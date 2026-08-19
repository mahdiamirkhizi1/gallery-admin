import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/index.css";
import "./styles/forms.css";
import "./styles/layout-state.css";
import "./pages/dashboard/dashboard.css";
import "./pages/products/create/create-product.css";
import "./pages/products/products.css";
import "./pages/products/product-refinements.css";
import "./pages/products/detail-tables.css";
import "./styles/readability.css";
import "./styles/product-adjustments.css";
import "./styles/product-form-improvements.css";
import "./styles/product-list-fixes.css";
import "./pages/products/product-detail-edit.css";
import "./pages/products/semantic-status.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><App /></BrowserRouter></QueryClientProvider></React.StrictMode>,
);
