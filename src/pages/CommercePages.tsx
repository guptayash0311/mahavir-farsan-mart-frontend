import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/http";
import type { ProductCard } from "../api/types";
import { Notice, Panel, buttonClass, inputClass, usePageMeta } from "../components/ui";
import { useSession } from "../auth/session";
import { formatInr } from "../lib/format";

type Cart = { items: (ProductCard & { item_id: string; quantity: number })[] };
type Inquiry = { id: string; status: string; message: string; created_at: string };
type Order = { id: string; status: string; created_at: string };

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Cart · Mahavir Farsan Mart", "Review your cart and send an inquiry.");
  function load() {
    api<Cart>("/api/v1/cart", { auth: false })
      .then(setCart)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load the cart"));
  }
  useEffect(load, []);
  async function change(itemId: string, quantity: number) {
    await api(`/api/v1/cart/items/${itemId}`, { method: "PATCH", auth: false, body: JSON.stringify({ quantity }) });
    load();
  }
  if (error) return <Notice kind="error" message={error} />;
  if (!cart) return <Notice kind="loading" message="Loading cart…" />;
  return (
    <div>
      <h1 className="text-3xl font-semibold">Cart</h1>
      {cart.items.length === 0 ? <p className="mt-4 text-stone-600">Your cart is empty.</p> : null}
      <ul className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <li key={item.item_id} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4">
            <div>
              <Link to={`/products/${item.slug}`} className="font-medium">{item.name}</Link>
              <p className="text-sm text-amber-800">{formatInr(item.price)}</p>
            </div>
            <input className="w-16 rounded border px-2 py-1" type="number" min={0} value={item.quantity} onChange={(event) => void change(item.item_id, Number(event.target.value))} />
          </li>
        ))}
      </ul>
      <Link to="/inquiry?from=cart" className={`${buttonClass} mt-6 inline-block`}>Send as inquiry</Link>
    </div>
  );
}

export function WishlistPage() {
  const { user, loading } = useSession();
  const [items, setItems] = useState<ProductCard[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Wishlist · Mahavir Farsan Mart", "Products you saved.");
  useEffect(() => {
    if (!user) return;
    api<{ items: ProductCard[] }>("/api/v1/wishlist")
      .then((body) => setItems(body.items))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load wishlist"));
  }, [user]);
  if (loading) return <Notice kind="loading" message="Loading…" />;
  if (!user) return <Notice kind="empty" message="Sign in to see your wishlist." />;
  if (error) return <Notice kind="error" message={error} />;
  if (!items) return <Notice kind="loading" message="Loading wishlist…" />;
  if (items.length === 0) return <Notice kind="empty" message="No saved products yet." />;
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}><Link to={`/products/${item.slug}`}>{item.name}</Link> · {formatInr(item.price)}</li>
      ))}
    </ul>
  );
}

export function InquiryPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  usePageMeta("Inquiry · Mahavir Farsan Mart", "Ask about products or send an order request.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api("/api/v1/inquiries", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          from_cart: params.get("from") === "cart",
        }),
      });
      setMessage("Inquiry sent. We will confirm from the shop.");
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to send the inquiry");
    }
  }
  return (
    <Panel>
      <h1 className="text-2xl font-semibold">Inquiry</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="name" required placeholder="Name" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input name="email" type="email" placeholder="Email" className={inputClass} />
        <textarea name="message" placeholder="Message" className={inputClass} />
        <button className={buttonClass}>Submit</button>
      </form>
      {message ? <p className="mt-3 text-sm text-green-800">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </Panel>
  );
}

export function AccountPage() {
  const { user, loading } = useSession();
  const [profile, setProfile] = useState<{ full_name: string; phone: string; email: string } | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  usePageMeta("Account · Mahavir Farsan Mart", "Your profile, inquiries, and orders.");
  useEffect(() => {
    if (!user) return;
    Promise.all([
      api<{ full_name: string; phone: string; email: string }>("/api/v1/profile"),
      api<Inquiry[]>("/api/v1/inquiries"),
      api<Order[]>("/api/v1/orders"),
    ])
      .then(([nextProfile, nextInquiries, nextOrders]) => {
        setProfile(nextProfile);
        setInquiries(nextInquiries);
        setOrders(nextOrders);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load account"));
  }, [user]);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = await api<{ full_name: string; phone: string; email: string }>("/api/v1/profile", {
      method: "PATCH",
      body: JSON.stringify({ full_name: String(data.get("full_name") ?? ""), phone: String(data.get("phone") ?? "") }),
    });
    setProfile(next);
  }
  if (loading) return <Notice kind="loading" message="Loading…" />;
  if (!user) return <Notice kind="empty" message="Sign in to see your account." />;
  if (error) return <Notice kind="error" message={error} />;
  if (!profile) return <Notice kind="loading" message="Loading account…" />;
  return (
    <div className="space-y-6">
      <Panel>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input name="full_name" defaultValue={profile.full_name} className={inputClass} />
          <input name="phone" defaultValue={profile.phone} className={inputClass} />
          <p className="text-sm text-stone-500">{profile.email}</p>
          <button className={buttonClass}>Save</button>
        </form>
      </Panel>
      <Panel>
        <h2 className="text-xl font-semibold">Inquiries</h2>
        {inquiries.length === 0 ? <p className="mt-2 text-stone-600">No inquiries yet.</p> : null}
        <ul className="mt-2 space-y-2 text-sm">{inquiries.map((row) => <li key={row.id}>{row.status} — {row.message}</li>)}</ul>
      </Panel>
      <Panel>
        <h2 className="text-xl font-semibold">Orders</h2>
        {orders.length === 0 ? <p className="mt-2 text-stone-600">No orders yet.</p> : null}
        <ul className="mt-2 space-y-2 text-sm">{orders.map((row) => <li key={row.id}>{row.status}</li>)}</ul>
      </Panel>
    </div>
  );
}
