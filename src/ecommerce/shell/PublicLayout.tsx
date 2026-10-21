import { Link, NavLink, Outlet } from "react-router-dom";

import { useSession } from "../../shared/auth/session";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "font-medium text-marigold" : "text-cream/90 hover:text-marigold";

export function PublicLayout() {
  const { user, logout } = useSession();
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-marigold/70 bg-saffron-deep text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-marigold">
            Mahavir Farsan Mart
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/categories" className={linkClass}>
              Categories
            </NavLink>
            <NavLink to="/search" className={linkClass}>
              Search
            </NavLink>
            <NavLink to="/documents" className={linkClass}>
              Documents
            </NavLink>
            <NavLink to="/cart" className={linkClass}>
              Cart
            </NavLink>
            <NavLink to="/wishlist" className={linkClass}>
              Wishlist
            </NavLink>
            <NavLink to="/inquiry" className={linkClass}>
              Inquiry
            </NavLink>
            {user ? (
              <>
                <NavLink to="/account" className={linkClass}>
                  Account
                </NavLink>
                <button className="text-cream/90" onClick={() => void logout()}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
