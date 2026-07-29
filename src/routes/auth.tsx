import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { verifyRecaptcha } from "@/lib/stripe.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar · Painel Marketing & Vendas" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"loading" | "login">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const verifyRecaptchaFn = useServerFn(verifyRecaptcha);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/dashboard" });
        return;
      }
      setMode("login");
    })();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      toast.success("Conta criada com sucesso! Faça login para acessar.");
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      toast.error("Confirme que você não é um robô");
      return;
    }
    setBusy(true);
    try {
      await verifyRecaptchaFn({ data: { token } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
      recaptchaRef.current?.reset();
    } finally {
      setBusy(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-[#1A1206]/60">
        Carregando…
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 90% -10%, rgba(255,106,26,0.14), transparent 55%), radial-gradient(700px circle at -10% 110%, rgba(255,179,71,0.18), transparent 55%)",
        }}
      />

      <div className="w-full max-w-[380px]">
        <Link to="/" className="mb-10 flex items-center justify-center gap-2.5">
          <img
            src="/resultscalelogo.png"
            alt="Result Scale"
            className="h-9 w-9 rounded-lg"
          />
          <span className="text-xl font-semibold tracking-tight">
            Result<span className="text-[#FF6A1A]">Scale</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-[#1A1206]/10 bg-[#FFF7EE]/95 p-8 shadow-[0_30px_80px_-40px_rgba(26,18,6,0.35)] backdrop-blur sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6A1A]/25 bg-[#FF6A1A]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6A1A]">
            Acesso do cliente
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Bem-vindo de <span className="text-[#FF6A1A]">volta</span>
          </h1>
          <p className="mt-2 text-sm text-[#1A1206]/60">
            Entre com seu email e senha para acessar seu painel.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-[#1A1206]/60">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1206]/40" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-[#1A1206]/10 bg-[#FFF7EE] pl-10 text-[15px] focus-visible:border-[#FF6A1A] focus-visible:ring-[#FF6A1A]/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-[#1A1206]/60">
                Senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1206]/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-[#1A1206]/10 bg-[#FFF7EE] pl-10 pr-10 text-[15px] focus-visible:border-[#FF6A1A] focus-visible:ring-[#FF6A1A]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1206]/40 hover:text-[#1A1206]/70"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} theme="light" />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A1A] text-sm font-semibold text-white shadow-[0_16px_36px_-14px_rgba(255,106,26,0.75)] transition hover:bg-[#FF7E33] disabled:opacity-60"
            >
              {busy ? "Aguarde…" : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <Link
          to="/cadastro"
          className="mt-4 self-center text-sm text-[#FF6A1A] hover:text-[#FF6A1A]/80 font-medium"
        >
          Não tem conta? Cadastre-se →
        </Link>

        <Link
          to="/"
          className="mt-3 self-center text-sm text-[#1A1206]/60 hover:text-[#FF6A1A]"
        >
          ← Voltar para o site
        </Link>
      </div>
    </div>
  );
}
