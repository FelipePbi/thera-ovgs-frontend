import { formatCurrency, formatDate } from "@/utils/formatters";

describe("formatters", () => {
  it("formats currency", () => {
    expect(formatCurrency(10)).toContain("10");
  });
  it("formats date", () => {
    expect(formatDate("2024-01-15T00:00:00.000Z")).not.toBe("—");
  });
});
