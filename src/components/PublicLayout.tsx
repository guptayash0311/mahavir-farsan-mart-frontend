import { Link, NavLink, Outlet } from "react-router-dom";

import { useSession } from "../auth/session";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "text-amber-800" : "text-stone-700 hover:text-amber-800";

export function PublicLayout() {
  const { user, logout } = useSession();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-amber-900">
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
                <button className="text-stone-700" onClick={() => void logout()}>
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
