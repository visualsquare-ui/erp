import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const GOOGLE_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

type GooglePlacePrediction = {
  placeId?: string;
  text?: {
    text?: string;
  };
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: GooglePlacePrediction;
  }>;
};

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlaceDetailsResponse = {
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
};

type AddressSuggestion = {
  label: string;
  placeId: string;
};

type AddressParts = {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

function toSuggestion(
  prediction: GooglePlacePrediction | undefined,
): AddressSuggestion | null {
  const label = prediction?.text?.text?.trim();
  const placeId = prediction?.placeId?.trim();

  if (!label || !placeId) {
    return null;
  }

  return { label, placeId };
}

function findComponent(
  components: GoogleAddressComponent[],
  types: string[],
) {
  for (const type of types) {
    const component = components.find((item) => item.types?.includes(type));

    if (component) {
      return component;
    }
  }

  return undefined;
}

function toAddressParts(
  place: GooglePlaceDetailsResponse,
): AddressParts | null {
  const components = place.addressComponents ?? [];
  const streetNumber = findComponent(components, ["street_number"])?.longText;
  const route = findComponent(components, ["route"])?.longText;
  const street = [streetNumber, route].filter(Boolean).join(" ").trim();
  const city = findComponent(components, [
    "locality",
    "postal_town",
    "sublocality_level_1",
  ])?.longText;
  const stateComponent = findComponent(components, [
    "administrative_area_level_1",
  ]);
  const state = stateComponent?.shortText ?? stateComponent?.longText;
  const postalCode = findComponent(components, ["postal_code"])?.longText;
  const postalSuffix = findComponent(components, ["postal_code_suffix"])?.longText;
  const zip = [postalCode, postalSuffix].filter(Boolean).join("-");
  const label = place.formattedAddress?.trim();

  if (!label || !street || !city || !state || !zip) {
    return null;
  }

  return { label, street, city, state, zip };
}

function googleHeaders(apiKey: string, fieldMask: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": fieldMask,
  };
}

async function isAuthenticated() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  return !error && Boolean(data?.claims);
}

async function getSuggestions({
  apiKey,
  query,
  sessionToken,
}: {
  apiKey: string;
  query: string;
  sessionToken?: string;
}) {
  const response = await fetch(GOOGLE_AUTOCOMPLETE_URL, {
    method: "POST",
    headers: googleHeaders(
      apiKey,
      "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
    ),
    body: JSON.stringify({
      input: query,
      includedRegionCodes: ["us"],
      languageCode: "en",
      locationBias: {
        circle: {
          center: { latitude: 40.8509, longitude: -73.9701 },
          radius: 50_000,
        },
      },
      regionCode: "us",
      ...(sessionToken ? { sessionToken } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Places autocomplete failed: ${response.status}`);
  }

  const data = (await response.json()) as GoogleAutocompleteResponse;
  return (data.suggestions ?? [])
    .map((suggestion) => toSuggestion(suggestion.placePrediction))
    .filter((item): item is AddressSuggestion => Boolean(item))
    .slice(0, 5);
}

async function getPlaceDetails({
  apiKey,
  placeId,
  sessionToken,
}: {
  apiKey: string;
  placeId: string;
  sessionToken?: string;
}) {
  const detailsUrl = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
  );
  detailsUrl.searchParams.set("languageCode", "en");
  detailsUrl.searchParams.set("regionCode", "us");

  if (sessionToken) {
    detailsUrl.searchParams.set("sessionToken", sessionToken);
  }

  const response = await fetch(detailsUrl.toString(), {
    headers: googleHeaders(apiKey, "formattedAddress,addressComponents"),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google Place Details failed: ${response.status}`);
  }

  return toAddressParts(
    (await response.json()) as GooglePlaceDetailsResponse,
  );
}

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Address search is not configured." },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const placeId = searchParams.get("placeId")?.trim();
  const sessionToken = searchParams.get("sessionToken")?.trim() || undefined;

  try {
    if (placeId) {
      const address = await getPlaceDetails({ apiKey, placeId, sessionToken });

      if (!address) {
        return NextResponse.json(
          { error: "Google did not return a complete postal address." },
          { status: 422 },
        );
      }

      return NextResponse.json({ address });
    }

    if (!query || query.length < 4) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getSuggestions({ apiKey, query, sessionToken });
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json(
      { error: "Address search is temporarily unavailable." },
      { status: 502 },
    );
  }
}
