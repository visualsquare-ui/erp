import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getClaims } = vi.hoisted(() => ({
  getClaims: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims },
  })),
}));

import { GET } from "./route";

describe("GET /api/address-suggestions", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_MAPS_API_KEY", "test-google-key");
    getClaims.mockResolvedValue({
      data: { claims: { sub: "staff-user" } },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("uses Google Places autocomplete with US-only results", async () => {
    const googleResponse = {
      suggestions: [
        {
          placePrediction: {
            placeId: "englewood-place-id",
            text: {
              text: "26 West Forest Avenue, Englewood, NJ, USA",
            },
          },
        },
      ],
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(googleResponse)));

    const response = await GET(
      new Request(
        "http://localhost/api/address-suggestions?q=26%20W%20Forest%20Ave&sessionToken=session-1",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      suggestions: [
        {
          label: "26 West Forest Avenue, Englewood, NJ, USA",
          placeId: "englewood-place-id",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places:autocomplete",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Goog-Api-Key": "test-google-key",
        }),
        body: JSON.stringify({
          input: "26 W Forest Ave",
          includedRegionCodes: ["us"],
          languageCode: "en",
          locationBias: {
            circle: {
              center: { latitude: 40.8509, longitude: -73.9701 },
              radius: 50000,
            },
          },
          regionCode: "us",
          sessionToken: "session-1",
        }),
      }),
    );
  });

  it("loads the selected Google place and returns form-ready address parts", async () => {
    const googleResponse = {
      formattedAddress: "26 West Forest Avenue, Englewood, NJ 07631",
      addressComponents: [
        { longText: "26", shortText: "26", types: ["street_number"] },
        {
          longText: "West Forest Avenue",
          shortText: "W Forest Ave",
          types: ["route"],
        },
        {
          longText: "Englewood",
          shortText: "Englewood",
          types: ["locality", "political"],
        },
        {
          longText: "New Jersey",
          shortText: "NJ",
          types: ["administrative_area_level_1", "political"],
        },
        {
          longText: "07631",
          shortText: "07631",
          types: ["postal_code"],
        },
      ],
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(googleResponse)));

    const response = await GET(
      new Request(
        "http://localhost/api/address-suggestions?placeId=englewood-place-id&sessionToken=session-1",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      address: {
        label: "26 West Forest Avenue, Englewood, NJ 07631",
        street: "26 West Forest Avenue",
        city: "Englewood",
        state: "NJ",
        zip: "07631",
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://places.googleapis.com/v1/places/englewood-place-id?languageCode=en&regionCode=us&sessionToken=session-1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Goog-Api-Key": "test-google-key",
          "X-Goog-FieldMask": "formattedAddress,addressComponents",
        }),
      }),
    );
  });

  it("does not expose the paid Google proxy to signed-out requests", async () => {
    getClaims.mockResolvedValue({
      data: { claims: null },
      error: new Error("missing session"),
    });
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const response = await GET(
      new Request("http://localhost/api/address-suggestions?q=26%20W%20Forest"),
    );

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
