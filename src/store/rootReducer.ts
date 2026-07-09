import { combineReducers } from "@reduxjs/toolkit";
import draftOrderReducer from "./draftOrderSlice";

export const rootReducer = combineReducers({
  draftOrder: draftOrderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
