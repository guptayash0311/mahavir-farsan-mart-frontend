import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SessionProvider } from "./auth/session";
import { AdminLayout } from "./components/AdminLayout";
import { PublicLayout } from "./components/PublicLayout";
import { DocumentsPage, ForgotPasswordPage, LoginPage, RegisterPage } from "./pages/AuthPages";
import { CampaignPage, CategoriesPage, CategoryPage, ProductPage, SearchPage } from "./pages/CatalogPages";
import { AccountPage, CartPage, InquiryPage, WishlistPage } from "./pages/CommercePages";
import { HomePage } from "./pages/HomePage";
import {
  AuditAdmin,
  CampaignsAdmin,
  CategoriesAdmin,
  DashboardPage,
  DocumentsAdmin,
  InquiriesAdmin,
  PagesAdmin,
  PartnersAdmin,
  PaymentsAdmin,
  ProductsAdmin,
  PurchasesAdmin,
  RemindersAdmin,
  SettingsAdmin,
  UsersAdmin,
} from "./pages/admin/AdminScreens";

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/products/:slug" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/campaigns/:slug" element={<CampaignPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/inquiry" element={<InquiryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/admin/login" element={<div className="mx-auto max-w-md p-6"><LoginPage admin /></div>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="pages" element={<PagesAdmin />} />
            <Route path="campaigns" element={<CampaignsAdmin />} />
            <Route path="documents" element={<DocumentsAdmin />} />
            <Route path="partners" element={<PartnersAdmin />} />
            <Route path="purchases" element={<PurchasesAdmin />} />
            <Route path="payments" element={<PaymentsAdmin />} />
            <Route path="reminders" element={<RemindersAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="audit" element={<AuditAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
