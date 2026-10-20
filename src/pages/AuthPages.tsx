import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/http";
import { useSession } from "../auth/session";
import { Notice, Panel, buttonClass, inputClass, usePageMeta } from "../components/ui";

export function LoginPage({ admin = false }: { admin?: boolean }) {
  const { login } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  usePageMeta(admin ? "Admin sign in · Mahavir Farsan Mart" : "Sign in · Mahavir Farsan Mart", "Sign in to Mahavir Farsan Mart.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get("email") ?? ""), String(data.get("password") ?? ""));
      navigate(admin ? "/admin" : "/account");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in");
    }
  }
  return (
    <Panel>
      <h1 className="text-2xl font-semibold">{admin ? "Staff sign in" : "Sign in"}</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" required className={inputClass} placeholder="Email" />
        <input name="password" type="password" required className={inputClass} placeholder="Password" />
        <button className={buttonClass}>Sign in</button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {admin ? null : <p className="mt-4 text-sm"><Link to="/register">Create an account</Link> · <Link to="/forgot-password">Forgot password</Link></p>}
    </Panel>
  );
}

export function RegisterPage() {
  const { register } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  usePageMeta("Create account · Mahavir Farsan Mart", "Create a Mahavir Farsan Mart account.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await register(String(data.get("email") ?? ""), String(data.get("password") ?? ""), String(data.get("full_name") ?? ""));
      navigate("/account");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Unable to register");
    }
  }
  return (
    <Panel>
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="full_name" className={inputClass} placeholder="Full name" />
        <input name="email" type="email" required className={inputClass} placeholder="Email" />
        <input name="password" type="password" required minLength={8} className={inputClass} placeholder="Password" />
        <button className={buttonClass}>Register</button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </Panel>
  );
}

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  usePageMeta("Reset password · Mahavir Farsan Mart", "Reset your Mahavir Farsan Mart password.");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = await api<{ message: string; reset_token: string | null }>("/api/v1/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email: String(data.get("email") ?? "") }),
    });
    setMessage(body.message);
    setToken(body.reset_token);
  }
  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await api("/api/v1/auth/reset-password", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token: String(data.get("token") ?? ""), password: String(data.get("password") ?? "") }),
    });
    setMessage("Password updated. You can sign in.");
  }
  return (
    <Panel>
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input name="email" type="email" required className={inputClass} placeholder="Email" />
        <button className={buttonClass}>Send reset</button>
      </form>
      {token ? (
        <form onSubmit={reset} className="mt-4 space-y-3">
          <input name="token" defaultValue={token} className={inputClass} />
          <input name="password" type="password" minLength={8} required className={inputClass} placeholder="New password" />
          <button className={buttonClass}>Update password</button>
        </form>
      ) : null}
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </Panel>
  );
}

export function DocumentsPage() {
  const [rows, setRows] = useState<{ id: string; title: string; category: string; file_url: string | null }[] | null>(null);
  const [error, setError] = useState("");
  usePageMeta("Documents · Mahavir Farsan Mart", "Published licenses and certificates.");
  useEffect(() => {
    api<{ id: string; title: string; category: string; file_url: string | null }[]>("/api/v1/documents/public", { auth: false })
      .then(setRows)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load documents"));
  }, []);
  if (error) return <Notice kind="error" message={error} />;
  if (!rows) return <Notice kind="loading" message="Loading documents…" />;
  if (rows.length === 0) return <Notice kind="empty" message="No public documents yet." />;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id} className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="font-medium">{row.title}</p>
          <p className="text-sm text-stone-500">{row.category}</p>
          {row.file_url ? <a className="text-sm text-amber-800" href={`${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}${row.file_url}`}>Open</a> : null}
        </li>
      ))}
    </ul>
  );
}
