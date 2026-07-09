import { runSaga } from "redux-saga";
import { handleSelectClientForOrder } from "@/store/sagas/orderSaga";
import { resetTransportType, selectClientForOrder } from "@/store/draftOrderSlice";

describe("orderSaga", () => {
  it("dispatches resetTransportType when unauthorized", async () => {
    const dispatched: unknown[] = [];
    await runSaga(
      {
        dispatch: (a) => dispatched.push(a),
        getState: () => ({
          draftOrder: { clientId: "", transportTypeId: "t3", items: [], step: 1 },
        }),
      },
      handleSelectClientForOrder,
      selectClientForOrder({ clientId: "c1", authorizedTransportTypes: ["t1", "t2"] }),
    ).toPromise();
    expect(dispatched).toContainEqual(resetTransportType());
  });
});
