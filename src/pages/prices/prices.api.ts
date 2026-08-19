import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
export type PriceMode = "AUTO" | "OBSERVE" | "MANUAL" | "PAUSED";
export type MarketPrice = {
  id: number;
  code: string;
  metal: string | null;
  carat: number | null;
  amount: string;
  providerAmount: string | null;
  manualAmount: string | null;
  mode: PriceMode;
  provider: string | null;
  isActive: boolean;
};
export type PricingRule = {
  id: number;
  role: string;
  operation: "BUY" | "SELL";
  metal: string | null;
  category: string | null;
  adjustmentType: "FIXED" | "PERCENT";
  adjustmentValue: string;
};
type E<T> = { result: T };
export const getPrices = async () =>
  (await api.get<E<MarketPrice[]>>(endpoints.prices.list)).data.result;
export const updatePrice = async (id: number, data: Partial<MarketPrice>) =>
  (await api.patch(endpoints.prices.item(id), data)).data;
export const syncPrices = async () =>
  (await api.post(endpoints.prices.sync)).data;
export const getRules = async () =>
  (await api.get<E<PricingRule[]>>(endpoints.prices.rules)).data.result;
export const createRule = async (data: Record<string, unknown>) =>
  (await api.post(endpoints.prices.rules, data)).data;
export const updateRule = async (id: number, data: Record<string, unknown>) =>
  (await api.patch(endpoints.prices.rule(id), data)).data;
export const deleteRule = async (id: number) =>
  (await api.delete(endpoints.prices.rule(id))).data;
