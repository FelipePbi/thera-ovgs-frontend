import { put, select, takeEvery } from "redux-saga/effects";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  SELECT_CLIENT_FOR_ORDER,
  resetTransportType,
  type SelectClientForOrderPayload,
} from "@/store/draftOrderSlice";
import type { RootState } from "@/store/rootReducer";

export function* handleSelectClientForOrder(
  action: PayloadAction<SelectClientForOrderPayload>,
) {
  const draft: RootState["draftOrder"] = yield select(
    (state: RootState) => state.draftOrder,
  );
  const { transportTypeId } = draft;
  const { authorizedTransportTypes } = action.payload;

  if (transportTypeId && !authorizedTransportTypes.includes(transportTypeId)) {
    yield put(resetTransportType());
  }
}

export function* orderSaga() {
  yield takeEvery(SELECT_CLIENT_FOR_ORDER, handleSelectClientForOrder);
}
