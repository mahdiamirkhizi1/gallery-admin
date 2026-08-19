export type OrderStatus = "PENDING_PAYMENT" | "PARTIALLY_PAID" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type ApiOrder = { id: number; userId: number; totalAmount: string; payableAmount?: string; status: OrderStatus; createdAt: string; orderItems: Array<{ quantity: number; product: { title: string } }> };
export type ApiProduct = { id: number; title: string; totalStock: number; medias?: Record<string, unknown>; variants: Array<{ stock: number; weight: string | number }> };
export type Paginated<T> = { items: T[]; totalCount: number; recordFrom: number; recordTo: number; hasMore: boolean };
export type ApiEnvelope<T> = { success: boolean; result: T };
export type DashboardData = { metrics: { sales: number; orders: number; products: number; lowStock: number }; orders: ApiOrder[]; products: ApiProduct[]; statusCounts: Record<OrderStatus, number>; salesTrend: Array<{ label: string; value: number }> };
