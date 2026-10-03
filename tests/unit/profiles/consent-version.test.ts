import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, hasCurrentConsent } from "@/lib/profiles";

describe("hasCurrentConsent", () => {
  it("requires both a consent time and the current version", () => {
    expect(hasCurrentConsent({ consentAt: new Date(), consentVersion: CONSENT_VERSION })).toBe(true);
    expect(hasCurrentConsent({ consentAt: new Date(), consentVersion: "2020-01-01" })).toBe(false);
    expect(hasCurrentConsent({ consentAt: null, consentVersion: CONSENT_VERSION })).toBe(false);
    expect(hasCurrentConsent(null)).toBe(false);
  });
});
