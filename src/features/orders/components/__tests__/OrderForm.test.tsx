import { render, screen } from "@testing-library/react";
import * as OF from "@/features/orders/components/OrderForm";
import * as Redux from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import draftReducer from "@/store/draftOrderSlice";

jest.mock("next/navigation", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/features/registry/hooks/useClients", () => ({
  useClients: () => ({
    data: [{ id: "c1", name: "A", authorizedTransportTypes: ["t1"] }],
  }),
}));
jest.mock("@/features/registry/hooks/useTransportTypes", () => ({
  useTransportTypes: () => ({
    data: [
      { id: "t1", name: "Caminhão", capacity: 100 },
      { id: "t2", name: "Carreta", capacity: 2500 },
    ],
  }),
}));
jest.mock("@/features/registry/hooks/useItems", () => ({
  useItems: () => ({ data: [{ id: "i1", sku: "SKU-001", name: "Item A", weight: 50 }] }),
}));
jest.mock("@/features/orders/hooks/useOrders", () => ({
  useCreateOrder: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

describe("OrderForm", () => {
  it("blocks submit when transport type unauthorized", () => {
    const store = configureStore({
      reducer: { draftOrder: draftReducer },
      preloadedState: {
        draftOrder: {
          clientId: "c1",
          transportTypeId: "t2",
          items: [{ itemId: "i1", quantity: 1 }],
          step: 1 as const,
        },
      },
    });
    render(
      <Redux.Provider store={store}>
        <OF.OrderForm></OF.OrderForm>
      </Redux.Provider>,
    );
    const btn = screen.getByText("Criar ordem");
    expect(btn).toBeDisabled();
  });

  it("blocks submit when total weight exceeds transport capacity", () => {
    const store = configureStore({
      reducer: { draftOrder: draftReducer },
      preloadedState: {
        draftOrder: {
          clientId: "c1",
          transportTypeId: "t1",
          items: [{ itemId: "i1", quantity: 3 }],
          step: 1 as const,
        },
      },
    });
    render(
      <Redux.Provider store={store}>
        <OF.OrderForm></OF.OrderForm>
      </Redux.Provider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "O peso total dos itens excede a capacidade",
    );
    expect(screen.getByText("Criar ordem")).toBeDisabled();
  });
});
