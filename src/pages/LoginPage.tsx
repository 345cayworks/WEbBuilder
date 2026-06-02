import { useMemo, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Megaphone, KeyRound, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useData } from "@/context/DataContext";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ROLE_LABELS } from "@/lib/constants";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const { data } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isSuperEmail = useMemo(
    () => email.trim().toLowerCase() === settings.superAdminEmail.trim().toLowerCase(),
    [email, settings.superAdminEmail],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = login(email, masterKey);
    if (res.ok) navigate("/", { replace: true });
    else setError(res.error ?? "Unable to sign in.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-brand-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Megaphone size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900">WebBuilder Workspace</h1>
          <p className="mt-1 text-sm text-slate-500">{settings.companyName}</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <Field label="Email address" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoFocus
              placeholder="you@cayworks.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          {isSuperEmail && (
            <Field
              label="SuperAdmin master key"
              htmlFor="masterKey"
              hint={
                settings.superAdminMasterKey
                  ? "Required for SuperAdmin access."
                  : "No master key configured yet — leave blank to bootstrap, then set one in Settings."
              }
            >
              <Input
                id="masterKey"
                type="password"
                placeholder="••••••••"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
              />
            </Field>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg">
            <LogIn size={16} />
            Sign in
          </Button>
        </form>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white/70 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <KeyRound size={13} /> Demo accounts (MVP)
          </div>
          <div className="space-y-1.5">
            {data.users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setEmail(u.email);
                  setMasterKey("");
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
              >
                <span className="text-slate-700">{u.email}</span>
                <span className="text-xs text-slate-400">{ROLE_LABELS[u.role]}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
            This MVP uses passwordless demo login backed by local storage. In production, wire
            Supabase Auth / Netlify Identity and keep the master key server-side.
          </p>
        </div>
      </div>
    </div>
  );
}
