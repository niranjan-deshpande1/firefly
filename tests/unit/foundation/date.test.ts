import { describe, expect, it } from "vitest";
import { formatDate, formatDateLong, formatOffset, formatTime } from "@/lib/format/date";

describe("date formatting (manual 11.2)", () => {
  const summer = new Date("2026-07-22T16:30:00Z");
  const winter = new Date("2026-01-05T17:00:00Z");

  it("formats product dates as day plus lowercase short month", () => {
    expect(formatDate(summer)).toBe("22 jul");
  });

  it("formats email dates with the full month and year", () => {
    expect(formatDateLong(summer)).toBe("22 july 2026");
  });

  it("always names the IANA zone and the real offset, with daylight time", () => {
    expect(formatTime(summer)).toBe("09:30 America/Los_Angeles (UTC−07:00)");
    expect(formatOffset(winter)).toBe("UTC−08:00");
  });

  it("formats other zones", () => {
    expect(formatTime(summer, "UTC")).toBe("16:30 UTC (UTC+00:00)");
  });
});
