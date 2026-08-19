import { api } from "@/services/api";
type Envelope<T> = { result: T };
export interface AdminPayment {
  id: number; status: string; method: string; amount: string; createdAt: string;
  order: { id: number; user: { id: number; fullName: string | null; mobile: string } };
  receipt: null | { referenceCode: string; paidAt: string; submittedAt: string; reviewNote: string | null };
}
export const getReviewPayments = async () => (await api.get<Envelope<AdminPayment[]>>("/payment/admin?status=PROCESSING")).data.result;
export interface AdminOrder {
  id: number; status: string; totalAmount: string; payableAmount: string; createdAt: string; expiresAt: string | null;
  addressSnapshot: { province?: string; city?: string; address?: string; postalCode?: string | null } | null;
  deliveryMethod: { category: string; shippingType: string; fee: string };
  user?: { id: number; fullName: string | null; mobile: string };
  orderItems: Array<{ id: number; quantity: number; priceAtTime: string; status: string; product: { title: string }; productVariant: { weight: string }; plan?: { type: string } }>;
  payments?: Array<{ id: number; method: string; status: string; amount: string; destinationCardNumber?: string | null; receipt?: { referenceCode: string; reviewNote: string | null } | null }>;
}
export const getAdminOrders = async () => (await api.get<Envelope<{ items: AdminOrder[] }>>("/order?recordFrom=0&recordTo=100")).data.result.items;
export const getAdminOrder = async (id: number) => (await api.get<Envelope<AdminOrder>>(`/order/${id}`)).data.result;
export interface CardSettings { cardNumber: string; iban: string | null; accountHolder: string; bankName: string; isActive: boolean }
export const getCardSettings = async () => (await api.get<Envelope<CardSettings | null>>("/payment/admin/card-to-card-settings")).data.result;
export const saveCardSettings = async (input: CardSettings) => (await api.put<Envelope<CardSettings>>("/payment/admin/card-to-card-settings", input)).data.result;
export const reviewPayment = async (id: number, status: "SUCCESS" | "FAILED", reviewNote?: string) =>
  (await api.patch(`/payment/${id}`, { status, reviewNote })).data.result;
export const getReceiptBlob = async (id: number) => (await api.get(`/payment/${id}/receipt/image`, { responseType: "blob" })).data as Blob;
