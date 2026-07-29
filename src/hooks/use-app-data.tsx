import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromDb, type DailyEntry, type DbEntry } from "@/lib/marketing";

export type FunnelConfig = {
  label_leads: string;
  label_qualified: string;
  label_appointments: string;
  label_meetings: string;
  label_proposals: string;
  label_closings: string;
};

export type ThemeSettings = {
  brand_name: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  card_color: string;
  foreground_color: string;
  logo_url: string | null;
  meta_ads_connected: boolean;
  meta_ads_account_id: string | null;
};

export type MonthlyGoal = {
  id?: string;
  month_key: string;
  revenue_goal: number | null;
  roas_goal: number | null;
  closings_goal: number | null;
  leads_goal: number | null;
  max_cac: number | null;
  max_cpl: number | null;
  max_noshow: number | null;
};

type Session = { userId: string; email: string; isAdmin: boolean } | null;

type Ctx = {
  session: Session;
  loading: boolean;
  entries: DailyEntry[];
  funnel: FunnelConfig;
  theme: ThemeSettings;
  goals: MonthlyGoal[];
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const defaultFunnel: FunnelConfig = {
  label_leads: "Leads",
  label_qualified: "Qualificados",
  label_appointments: "Agendamentos",
  label_meetings: "Reuniões",
  label_proposals: "Propostas",
  label_closings: "Fechamentos",
};

const defaultTheme: ThemeSettings = {
  brand_name: "Painel · Marketing & Vendas",
  primary_color: "#c2410c",
  accent_color: "#16a34a",
  background_color: "#fafaf7",
  card_color: "#ffffff",
  foreground_color: "#1c1917",
  logo_url: null,
  meta_ads_connected: false,
  meta_ads_account_id: null,
};

const AppCtx = createContext<Ctx | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [funnel, setFunnel] = useState<FunnelConfig>(defaultFunnel);
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);

  const loadAll = useCallback(async (userId: string) => {
    const [entriesRes, funnelRes, themeRes, goalsRes, rolesRes] = await Promise.all([
      supabase.from("daily_entries").select("*").order("entry_date", { ascending: false }),
      supabase.from("funnel_config").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("theme_settings").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("monthly_goals").select("*"),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setEntries((entriesRes.data ?? []).map((r) => fromDb(r as unknown as DbEntry)));
    if (funnelRes.data) setFunnel(funnelRes.data as unknown as FunnelConfig);
    if (themeRes.data) setTheme(themeRes.data as unknown as ThemeSettings);
    setGoals((goalsRes.data ?? []) as unknown as MonthlyGoal[]);
    const isAdmin = (rolesRes.data ?? []).some((r: { role: string }) => r.role === "admin");
    setSession((s) => (s ? { ...s, isAdmin } : s));
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setSession({ userId: data.user.id, email: data.user.email ?? "", isAdmin: false });
      await loadAll(data.user.id);
    } else {
      setSession(null);
    }
    setLoading(false);
  }, [loadAll]);

  useEffect(() => {
    bootstrap();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        bootstrap();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [bootstrap]);

  // Apply theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", theme.background_color);
    root.style.setProperty("--foreground", theme.foreground_color);
    root.style.setProperty("--card", theme.card_color);
    root.style.setProperty("--card-foreground", theme.foreground_color);
    root.style.setProperty("--popover", theme.card_color);
    root.style.setProperty("--popover-foreground", theme.foreground_color);
    root.style.setProperty("--primary", theme.primary_color);
    root.style.setProperty("--primary-foreground", "#ffffff");
    root.style.setProperty("--accent", theme.accent_color);
    root.style.setProperty("--accent-foreground", "#ffffff");
    root.style.setProperty("--ring", theme.primary_color);
    root.style.setProperty("--chart-1", theme.primary_color);
    root.style.setProperty("--chart-2", theme.accent_color);
  }, [theme]);

  const refresh = useCallback(async () => {
    if (session?.userId) await loadAll(session.userId);
  }, [session?.userId, loadAll]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setEntries([]);
    setGoals([]);
  }, []);

  return (
    <AppCtx.Provider value={{ session, loading, entries, funnel, theme, goals, refresh, signOut }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppData must be inside AppDataProvider");
  return ctx;
}