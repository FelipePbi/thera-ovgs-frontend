import { resetTransportType } from "@/store/draftOrderSlice";
import draftReducer from "@/store/draftOrderSlice";

describe("draftOrderSlice", () => {
  it("resets transport type", () => {
    const state = draftReducer(
      { clientId: "c1", transportTypeId: "t1", items: [], step: 1 },
      resetTransportType(),
    );
    expect(state.transportTypeId).toBe("");
  });
});
