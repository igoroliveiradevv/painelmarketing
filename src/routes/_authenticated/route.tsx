import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppDataProvider, useAppData } from "@/hooks/use-app-data";
import { LogOut, LayoutDashboard, ListPlus, Target, SlidersHorizontal, Users, AlertTriangle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getSubscriptionStatus, createRenewalSession } from "@/lib/stripe.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

function Layout() {
  return (
    <AppDataProvider>
      <Shell />
    </AppDataProvider>
  );
}

function SubscriptionBanner({ userId }: { userId: string }) {
  const [subStatus, setSubStatus] = useState<string>("active");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const checkSub = useServerFn(getSubscriptionStatus);
  const renewSession = useServerFn(createRenewalSession);

  useEffect(() => {
    checkSub().then((r) => {
      setSubStatus(r.status);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [userId]);

  const handleRenew = async () => {
    setBusy(true);
    try {
      const result = await renewSession();
      window.location.href = result.url;
    } catch (err) {
      setBusy(false);
    }
  };

  if (loading || subStatus === "active" || subStatus === "trialing") return null;

  const messages: Record<string, { title: string; desc: string }> = {
    pending: {
      title: "Pagamento pendente",
      desc: "Seu pagamento ainda não foi confirmado. Clique em Pagar para concluir sua assinatura.",
    },
    past_due: {
      title: "Não foi possível prosseguir com o pagamento",
      desc: "Sua última cobrança foi recusada. Atualize seu método de pagamento para continuar usando a plataforma.",
    },
    inactive: {
      title: "Não foi possível prosseguir com o pagamento",
      desc: "Sua assinatura está inativa. Renove para voltar a acessar todos os recursos.",
    },
    canceled: {
      title: "Não foi possível prosseguir com o pagamento",
      desc: "Sua assinatura foi cancelada. Renove para continuar usando a plataforma.",
    },
    none: {
      title: "Assinatura necessária",
      desc: "Você ainda não possui uma assinatura ativa.",
    },
  };

  const msg = messages[subStatus] ?? messages.inactive;

  return (
    <div className="border-b border-amber-200 bg-amber-50/80 px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{msg.title}</p>
            <p className="text-xs text-amber-700">{msg.desc}</p>
          </div>
        </div>
        <Button
          onClick={handleRenew}
          disabled={busy}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {subStatus === "pending" ? "Pagar" : "Renovar"}
        </Button>
      </div>
    </div>
  );
}

function Shell() {
  const { session, theme, signOut } = useAppData();
  const navigate = useNavigate();
  const isAdmin = session?.isAdmin;

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/lancamentos", label: "Lançamentos", icon: ListPlus },
    { to: "/metas", label: "Metas", icon: Target },
    { to: "/aparencia", label: "Editar painel", icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {session?.userId && <SubscriptionBanner userId={session.userId} />}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 truncate">
            {theme.logo_url ? (
              <img
                src={theme.logo_url}
                alt={theme.brand_name}
                className="h-9 w-9 rounded-lg object-contain bg-white/60 p-0.5 shadow-sm animate-fade-in"
              />
            ) : (
              <span
                className="grid h-9 w-9 place-items-center rounded-lg font-bold shadow-sm"
                style={{ background: theme.primary_color, color: "#fff" }}
              >
                {(theme.brand_name?.[0] ?? "M").toUpperCase()}
              </span>
            )}
            <span className="truncate font-semibold tracking-tight">{theme.brand_name}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={l.exact ? { exact: true } : undefined}
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                <l.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3"
                activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            <button
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth" });
              }}
              className="ml-1 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3"
              title={session?.email}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
