import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { ApiEnvelope, ApiOrder, ApiProduct, DashboardData, OrderStatus, Paginated } from "./dashboard.types";

const statuses: OrderStatus[] = ["PENDING_PAYMENT", "PARTIALLY_PAID", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];

export async function getDashboardData(): Promise<DashboardData> {
  const [ordersResponse, productsResponse, statusResponse] = await Promise.all([
    api.get<ApiEnvelope<Paginated<ApiOrder>>>(endpoints.orders.list, { params: { recordFrom: 0, recordTo: 20 } }),
    api.get<ApiEnvelope<Paginated<ApiProduct>>>(endpoints.products.list, { params: { recordFrom: 0, recordTo: 20, status: "PUBLISHED" } }),
    api.get<ApiEnvelope<Record<OrderStatus, number>>>(endpoints.orders.statusCounts),
  ]);
  const orders = ordersResponse.data.result.items;
  const products = productsResponse.data.result.items;
  const statusCounts = Object.fromEntries(statuses.map(status => [status, statusResponse.data.result[status] ?? 0])) as Record<OrderStatus, number>;
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => new Date(order.createdAt).toDateString() === today);
  const sales = todayOrders.filter(order => ["PAID", "PROCESSING", "SHIPPED", "COMPLETED"].includes(order.status)).reduce((sum, order) => sum + Number(order.totalAmount), 0);
  return { metrics: { sales, orders: todayOrders.length, products: productsResponse.data.result.totalCount, lowStock: products.filter(product => product.totalStock > 0 && product.totalStock <= 5).length }, orders: orders.slice(0, 5), products: products.slice(0, 5), statusCounts, salesTrend: buildSalesTrend(orders) };
}

function buildSalesTrend(orders: ApiOrder[]) {
  return Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return { label: new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(date), value: orders.filter(order => new Date(order.createdAt).toDateString() === date.toDateString()).reduce((sum, order) => sum + Number(order.totalAmount), 0) }; });
}
