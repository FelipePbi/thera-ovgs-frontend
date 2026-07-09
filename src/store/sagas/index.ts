import { all, fork } from "redux-saga/effects";
import { orderSaga } from "./orderSaga";

export function* rootSaga() {
  yield all([fork(orderSaga)]);
}
