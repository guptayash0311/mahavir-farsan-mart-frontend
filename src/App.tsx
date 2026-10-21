import { BrowserRouter, Route, Routes } from "react-router-dom";

import { ApplicationHome } from "./admin/home/ApplicationHome";
import { AdminLayout } from "./admin/shell/AdminLayout";
import { CampaignsAdmin } from "./admin/cms/CampaignsAdmin";
import { PagesAdmin } from "./admin/cms/PagesAdmin";
import { CategoriesAdmin } from "./admin/catalog/CategoriesAdmin";
import { ProductsAdmin } from "./admin/catalog/ProductsAdmin";
import { OrdersAdmin } from "./admin/commerce/OrdersAdmin";
import { DocumentsAdmin } from "./admin/documents/DocumentsAdmin";
import { InquiriesAdmin } from "./admin/enquiry/InquiriesAdmin";
import { InventoryAdmin } from "./admin/inventory/InventoryAdmin";
import { InboxAdmin } from "./admin/notifications/InboxAdmin";
import { RemindersAdmin } from "./admin/notifications/RemindersAdmin";
import { PartnersAdmin } from "./admin/procurement/PartnersAdmin";
import { PaymentsAdmin } from "./admin/procurement/PaymentsAdmin";
import { PurchasesAdmin } from "./admin/procurement/PurchasesAdmin";
import { AuditAdmin } from "./admin/system/AuditAdmin";
import { SettingsAdmin } from "./admin/system/SettingsAdmin";
import { UsersAdmin } from "./admin/system/UsersAdmin";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "./ecommerce/auth/AuthPages";
import { CampaignPage, CategoriesPage, CategoryPage, ProductPage, SearchPage } from "./ecommerce/catalog/CatalogPages";
import { AccountPage, CartPage, WishlistPage } from "./ecommerce/commerce/CommercePages";
import { DocumentsPage } from "./ecommerce/documents/DocumentsPage";
import { InquiryPage } from "./ecommerce/enquiry/InquiryPage";
import { HomePage } from "./ecommerce/home/HomePage";
import { PublicLayout } from "./ecommerce/shell/PublicLayout";
import { SessionProvider } from "./shared/auth/session";

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
          <Route path="/admin/login" element={<div className="min-h-screen bg-cream px-4 py-10 text-ink"><div className="mx-auto max-w-md"><LoginPage admin /></div></div>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ApplicationHome />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="pages" element={<PagesAdmin />} />
            <Route path="campaigns" element={<CampaignsAdmin />} />
            <Route path="documents" element={<DocumentsAdmin />} />
            <Route path="partners" element={<PartnersAdmin />} />
            <Route path="purchases" element={<PurchasesAdmin />} />
            <Route path="payments" element={<PaymentsAdmin />} />
            <Route path="reminders" element={<RemindersAdmin />} />
            <Route path="inbox" element={<InboxAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="inventory" element={<InventoryAdmin />} />
            <Route path="audit" element={<AuditAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
