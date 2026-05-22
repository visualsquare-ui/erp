import { NextResponse } from "next/server";

type CensusAddressComponents = {
  city?: string;
  fromAddress?: string;
  preDirection?: string;
  preQualifier?: string;
  preType?: string;
  state?: string;
  streetName?: string;
  suffixDirection?: string;
  suffixQualifier?: string;
  suffixType?: string;
  toAddress?: string;
  zip?: string;
};

type CensusMatch = {
  matchedAddress?: string;
  addressComponents?: CensusAddressComponents;
};

type CensusResponse = {
  result?: {
    addressMatches?: CensusMatch[];
  };
};

type AddressSuggestion = {
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

function compact(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

function toSuggestion(match: CensusMatch): AddressSuggestion | null {
  const components = match.addressComponents;
  if (!components || !match.matchedAddress) {
    return null;
  }

  const matchedStreet = match.matchedAddress.split(",")[0]?.trim();
  const streetNumber = components.fromAddress ?? components.toAddress;
  const componentStreet = compact([
    streetNumber,
    components.preQualifier,
    components.preDirection,
    components.preType,
    components.streetName,
    components.suffixType,
    components.suffixDirection,
    components.suffixQualifier,
  ]);
  const street = matchedStreet || componentStreet;

  if (!street || !components.city || !components.state || !components.zip) {
    return null;
  }

  return {
    label: match.matchedAddress,
    street,
    city: components.city,
    state: components.state,
    zip: components.zip,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 4) {
    return NextResponse.json({ suggestions: [] });
  }

  const censusUrl = new URL(
    "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress",
  );
  censusUrl.searchParams.set("address", query);
  censusUrl.searchParams.set("benchmark", "Public_AR_Current");
  censusUrl.searchParams.set("format", "json");

  try {
    const response = await fetch(censusUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Visual Square ERP address lookup",
      },
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = (await response.json()) as CensusResponse;
    const suggestions = (data.result?.addressMatches ?? [])
      .map(toSuggestion)
      .filter((item): item is AddressSuggestion => Boolean(item))
      .slice(0, 5);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
