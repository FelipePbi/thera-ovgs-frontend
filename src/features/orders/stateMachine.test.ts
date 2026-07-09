import { getNextStatus, canTransition } from "@/features/orders/stateMachine";

describe("stateMachine", () => {
  it("advances one step", () => {
    expect(getNextStatus("CRIADA")).toBe("PLANEJADA");
  });
  it("blocks invalid transition", () => {
    expect(canTransition("CRIADA", "EM_TRANSPORTE")).toBe(false);
  });
});
