export const endpoints = {
  auth: { login: "/auth/login", refresh: "/auth/refresh" },
  user: { profile: "/user/profile" },
  products: { list: "/product/admin", create: "/product", detail: (id: number) => `/product/${id}`, update: (id: number) => `/product/${id}`, categories: "/product/category", category: (id: number) => `/product/category/${id}`, categoryStatus: (id: number) => `/product/category/${id}/status`, labels: "/product/label/admin", publicLabels: "/product/label", label: (id: number) => `/product/label/${id}`, plans: "/product/plan", createPlan: "/product/plan", updatePlanStatus: (id: number) => `/product/plan/${id}/status`, deletePlan: (id: number) => `/product/plan/${id}` },
  orders: { list: "/order", statusCounts: "/order/stats/status", detail: (id: number) => `/order/${id}` },
  auctions: { list: "/auction" },
  cms: { theme: "/cms/theme", home: "/cms/pages/home", gallery: "/cms/pages/gallery" },
  prices: { list: "/prices", current: "/prices/current", sync: "/prices/sync", item: (id: number) => `/prices/${id}`, rules: "/prices/rules", rule: (id: number) => `/prices/rules/${id}` },
} as const;
