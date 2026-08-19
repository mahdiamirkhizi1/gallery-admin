import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ProductsPage } from "@/pages/products/ProductsPage";
import { CreateProductPage } from "@/pages/products/create/CreateProductPage";
import { ProductDetailPage } from "@/pages/products/detail/ProductDetailPage";
import { ProductEditPage } from "@/pages/products/edit/ProductEditPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { PlansPage } from "@/pages/plans/PlansPage";
import { CreatePlanPage } from "@/pages/plans/create/CreatePlanPage";
import { CategoriesPage } from "@/pages/categories/list/CategoriesPage";
import { CreateCategoryPage } from "@/pages/categories/create/CreateCategoryPage";
import { LabelsPage } from "@/pages/labels/LabelsPage";
import { CmsPage } from "@/pages/cms/CmsPage";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { PricesPage } from "@/pages/prices/PricesPage";
import { PaymentsPage } from "@/pages/payments/PaymentsPage";
import { OrdersPage } from "@/pages/payments/OrdersPage";
import { OrderDetailPage } from "@/pages/payments/OrderDetailPage";

export function App() {
  return (
    <>
      <ToastViewport />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<CreateProductPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="plans/new" element={<CreatePlanPage />} />
            <Route path="prices" element={<PricesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="labels" element={<LabelsPage />} />
            <Route path="cms" element={<Navigate to="/cms/gallery" replace />} />
            <Route path="cms/home" element={<CmsPage initialTab="home" />} />
            <Route path="cms/gallery" element={<CmsPage initialTab="gallery" />} />
        <Route path="categories/new" element={<CreateCategoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
