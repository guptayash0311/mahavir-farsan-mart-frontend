import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../../shared/api/http";
import { useSession } from "../../shared/auth/session";
import { Panel, buttonClass, inputClass, usePageMeta } from "../../shared/ui";

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
      {admin ? null : <p className="mt-4 text-sm"><Link className="text-saffron-deep" to="/register">Create an account</Link> · <Link className="text-saffron-deep" to="/forgot-password">Forgot password</Link></p>}
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
