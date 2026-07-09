import {
  getOrderTotalWeight,
  validateOrderWeightWithinCapacity,
} from "@/features/orders/schemas";

describe("order weight validation", () => {
  const catalog = [
    { id: "i1", weight: 10 },
    { id: "i2", weight: 2.5 },
  ];

  it("calculates total weight from items and quantities", () => {
    expect(
      getOrderTotalWeight(
        [
          { itemId: "i1", quantity: 2 },
          { itemId: "i2", quantity: 4 },
        ],
        catalog,
      ),
    ).toBe(30);
  });

  it("blocks when total weight exceeds capacity", () => {
    const total = getOrderTotalWeight([{ itemId: "i1", quantity: 100 }], catalog);
    expect(validateOrderWeightWithinCapacity(total, 500)).toBe(false);
  });

  it("allows when total weight is within capacity", () => {
    const total = getOrderTotalWeight([{ itemId: "i2", quantity: 10 }], catalog);
    expect(validateOrderWeightWithinCapacity(total, 50)).toBe(true);
  });

  it("rejects missing or invalid capacity", () => {
    expect(validateOrderWeightWithinCapacity(10, undefined)).toBe(false);
    expect(validateOrderWeightWithinCapacity(10, 0)).toBe(false);
  });
});
