import {
  Bell,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Gauge,
  Gem,
  LogOut,
  ListTree,
  Menu,
  Package,
  Percent,
  ReceiptText,
  Settings,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAdminSession, getAdminUser } from "@/features/auth/auth";
import { useUiStore } from "@/stores/ui.store";

const navigation = [
  { to: "/", label: "داشبورد", icon: Gauge, end: true },
  { to: "/plans", label: "پلن‌های فروش", icon: CircleDollarSign },
  { to: "/prices", label: "مدیریت قیمت", icon: TrendingUp },
  { to: "/customers", label: "مشتریان", icon: Users },
  { to: "/settings", label: "تنظیمات", icon: Settings },
];
const titles: Record<string, string> = {
  "/": "داشبورد",
  "/products": "مدیریت محصولات",
  "/products/new": "افزودن محصول جدید",
  "/cms": "مدیریت محتوا",
  "/cms/home": "محتوای صفحه خانه",
  "/cms/gallery": "محتوای گالری محصولات",
  "/orders": "سفارش‌ها",
  "/payments": "بررسی پرداخت‌ها",
};

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<"products" | "orders" | "cms" | null>(() =>
    location.pathname.startsWith("/cms") ? "cms" : ["/orders", "/payments"].some((path) => location.pathname.startsWith(path)) ? "orders" : ["/products", "/categories", "/labels", "/inventory", "/discounts"].some((path) => location.pathname.startsWith(path)) ? "products" : null
  );
  const user = getAdminUser();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const logout = () => {
    clearAdminSession();
    navigate("/login");
  };
  return (
    <div
      className={`admin-shell ${sidebarCollapsed ? "admin-shell--collapsed" : ""}`}
    >
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="بستن منو"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="brand">
          <div className="brand__mark">
            <Gem size={24} />
          </div>
          <div>
            <strong>GOLDINO</strong>
            <span>پنل مدیریت</span>
          </div>
          <button
            className="icon-button sidebar__collapse"
            onClick={toggleSidebar}
          >
            <Menu size={18} />
          </button>
          <button
            className="icon-button sidebar__close"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav className="sidebar__nav">
          <span className="sidebar__label">منوی اصلی</span>
          {navigation.slice(0, 1).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item--active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="nav-group">
            <button type="button" className="nav-group__title" aria-expanded={expandedGroup === "products"} onClick={() => setExpandedGroup((value) => value === "products" ? null : "products")}>
              <Gem size={20} />
              <span>محصولات</span>
              <ChevronDown size={15} className={expandedGroup === "products" ? "rotate-180" : ""} />
            </button>
            {expandedGroup === "products" ? <>
            <NavLink
              to="/products"
              end
              className={({ isActive }) =>
                `nav-subitem ${isActive ? "nav-subitem--active" : ""}`
              }
            >
              <ListTree size={15} />
              همه محصولات
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `nav-subitem ${isActive ? "nav-subitem--active" : ""}`
              }
            >
              <Tags size={15} />
              دسته‌بندی‌ها
            </NavLink>
            <NavLink
              to="/labels"
              className={({ isActive }) => `nav-subitem ${isActive ? "nav-subitem--active" : ""}`}
            >
              <Tags size={15} />
              برچسب‌ها
            </NavLink>
            <NavLink to="/inventory" className="nav-subitem">
              <Package size={15} />
              موجودی
            </NavLink>
            <NavLink to="/discounts" className="nav-subitem">
              <Percent size={15} />
              تخفیف‌ها
            </NavLink>
            </> : null}
          </div>
          <div className="nav-group">
            <button type="button" className="nav-group__title" aria-expanded={expandedGroup === "orders"} onClick={() => setExpandedGroup((value) => value === "orders" ? null : "orders")}>
              <ShoppingBag size={20} />
              <span>سفارش‌ها</span>
              <ChevronDown size={15} className={expandedGroup === "orders" ? "rotate-180" : ""} />
            </button>
            {expandedGroup === "orders" ? <>
              <NavLink to="/orders" end className={({ isActive }) => `nav-subitem ${isActive ? "nav-subitem--active" : ""}`}>
                <ListTree size={15} />
                همه سفارش‌ها
              </NavLink>
              <NavLink to="/payments" className={({ isActive }) => `nav-subitem ${isActive ? "nav-subitem--active" : ""}`}>
                <ReceiptText size={15} />
                بررسی پرداخت‌ها
              </NavLink>
            </> : null}
          </div>
          <div className="nav-group">
            <button type="button" className="nav-group__title" aria-expanded={expandedGroup === "cms"} onClick={() => setExpandedGroup((value) => value === "cms" ? null : "cms")}>
              <FileText size={20} />
              <span>مدیریت محتوا</span>
              <ChevronDown size={15} className={expandedGroup === "cms" ? "rotate-180" : ""} />
            </button>
            {expandedGroup === "cms" ? <>
            <NavLink to="/cms/home" className={({ isActive }) => `nav-subitem ${isActive ? "nav-subitem--active" : ""}`}>
              <FileText size={15} />
              صفحه خانه
            </NavLink>
            <NavLink to="/cms/gallery" className={({ isActive }) => `nav-subitem ${isActive ? "nav-subitem--active" : ""}`}>
              <ListTree size={15} />
              گالری محصولات
            </NavLink>
            </> : null}
          </div>
          {navigation.slice(1).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item--active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="nav-item sidebar__logout" onClick={logout}>
          <LogOut size={20} />
          <span>خروج از حساب</span>
        </button>
      </aside>
      <main className="admin-main">
        <header className="topbar">
          <div className="topbar__title">
            <button
              className="icon-button menu-button"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <div>
              <h1>{titles[location.pathname] ?? "پنل مدیریت"}</h1>
              <p>مدیریت یکپارچه فروشگاه طلا</p>
            </div>
          </div>
          <div className="topbar__actions">
            <button className="icon-button notification">
              <Bell size={20} />
              <i />
            </button>
            <button className="profile">
              <span className="profile__avatar">
                {user?.name?.slice(0, 1) ?? "م"}
              </span>
              <span>
                <strong>{user?.name ?? "مدیر فروشگاه"}</strong>
                <small>
                  {user?.role === "SUPER_ADMIN" ? "مدیر ارشد" : "مدیر"}
                </small>
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
