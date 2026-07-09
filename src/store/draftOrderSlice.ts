import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type DraftOrderItem = { itemId: string; quantity: number };

export type DraftOrderStep = 1 | 2 | 3;

export type DraftOrderState = {
  clientId: string;
  transportTypeId: string;
  items: DraftOrderItem[];
  step: DraftOrderStep;
};

const initialState: DraftOrderState = {
  clientId: "",
  transportTypeId: "",
  items: [],
  step: 1,
};

export type SelectClientForOrderPayload = {
  clientId: string;
  authorizedTransportTypes: string[];
};

const draftOrderSlice = createSlice({
  name: "draftOrder",
  initialState,
  reducers: {
    setClientId(state, action: PayloadAction<string>) {
      state.clientId = action.payload;
    },
    setTransportTypeId(state, action: PayloadAction<string>) {
      state.transportTypeId = action.payload;
    },
    addItem(state, action: PayloadAction<DraftOrderItem>) {
      const existing = state.items.find((i) => i.itemId === action.payload.itemId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.itemId !== action.payload);
    },
    updateItemQuantity(
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>,
    ) {
      const row = state.items.find((i) => i.itemId === action.payload.itemId);
      if (row) {
        row.quantity = action.payload.quantity;
      }
    },
    setStep(state, action: PayloadAction<DraftOrderStep>) {
      state.step = action.payload;
    },
    resetDraft() {
      return initialState;
    },
    selectClientForOrder(state, action: PayloadAction<SelectClientForOrderPayload>) {
      state.clientId = action.payload.clientId;
      if (state.step < 1) {
        state.step = 1;
      }
    },
    resetTransportType(state) {
      state.transportTypeId = "";
    },
  },
});

export const {
  setClientId,
  setTransportTypeId,
  addItem,
  removeItem,
  updateItemQuantity,
  setStep,
  resetDraft,
  selectClientForOrder,
  resetTransportType,
} = draftOrderSlice.actions;

export const SELECT_CLIENT_FOR_ORDER = selectClientForOrder.type;
export const RESET_TRANSPORT_TYPE = resetTransportType.type;

export default draftOrderSlice.reducer;
