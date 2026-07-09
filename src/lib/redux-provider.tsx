"use client";

import { Provider } from "react-redux";
import { store } from "@/store";

export function ReduxProvider(props: { children: React.ReactNode }) {
  return <Provider store={store}>{props.children}</Provider>;
}
