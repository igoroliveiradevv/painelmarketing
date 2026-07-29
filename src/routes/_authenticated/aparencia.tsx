import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, Trash2, RefreshCw, Unplug, CheckCircle2 } from "lucide-react";
import { RotateCcw } from "lucide-react";

function MetaIcon({ className }: { className?: string }) {
  return <img src="/meta-icon.png" alt="Meta Ads" className={`h-10 w-10 object-contain ${className ?? ""}`} />;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden>
      <rect width="36" height="36" rx="8" fill="#fff" />
      <path fill="#4285F4" d="M30.5 18.27c0-.96-.09-1.69-.27-2.43H18.2v4.42h7.1c-.14 1.1-.9 2.76-2.64 3.88l-.02.15 3.84 2.97.26.03c2.44-2.25 3.76-5.56 3.76-9.02z" />
      <path fill="#34A853" d="M18.2 30.5c3.4 0 6.26-1.12 8.35-3.05l-3.98-3.08c-1.1.76-2.53 1.24-4.37 1.24-3.34 0-6.17-2.2-7.2-5.23l-.15.01-4.01 3.1-.05.15c2.08 4.04 6.36 6.86 11.41 6.86z" />
      <path fill="#FBBC05" d="M11 20.38a7.97 7.97 0 01-.44-2.5c0-.87.16-1.7.43-2.5l-.01-.17-4.06-3.15-.13-.06A12.96 12.96 0 005.5 17.88c0 2 .46 3.9 1.29 5.5l4.21-3z" />
      <path fill="#EA4335" d="M18.2 9.89c2.37 0 3.95 1.02 4.86 1.86l3.55-3.46C24.44 5.85 21.6 4.5 18.2 4.5c-5.05 0-9.33 2.82-11.4 6.87l4.2 3.26c1.02-3.02 3.85-5.24 7.2-5.24z" />
    </svg>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAppData, type FunnelConfig, type ThemeSettings } from "@/hooks/use-app-data";
import { useServerFn } from "@tanstack/react-start";
import {
  getMetaAuthUrl, getMetaConnection,
  syncMetaInsights, disconnectMeta,
} from "@/lib/meta.functions";

export const Route = createFileRoute("/_authenticated/aparencia")({ component: AparenciaPage });

function AparenciaPage() {
  const { theme, funnel, session, refresh } = useAppData();
  const [t, setT] = useState<ThemeSettings>(theme);
  const [f, setF] = useState<FunnelConfig>(funnel);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => setT(theme), [theme]);
  useEffect(() => setF(funnel), [funnel]);

  // ---- Meta Ads integration state ----
  type MetaConn = {
    meta_user_id: string | null;
    selected_ad_account_id: string | null;
    selected_ad_account_name: string | null;
    token_expires_at: string | null;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_error: string | null;
  } | null;
  const [metaConn, setMetaConn] = useState<MetaConn>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fnGetAuthUrl = useServerFn(getMetaAuthUrl);
  const fnGetConn = useServerFn(getMetaConnection);
  const fnSync = useServerFn(syncMetaInsights);
  const fnDisconnect = useServerFn(disconnectMeta);

//   const loadMeta = async () => {
//     try {
//       const conn = await fnGetConn();
//       setMetaConn(conn as MetaConn);
//     } catch (e) {
//       console.error(e);
//     }
//   };

  useEffect(() => {
    if (!session) return;
    // void loadMeta(); // inativo - em manutenção
    // Show toast if returning from OAuth
    const params = new URLSearchParams(window.location.search);
    const meta = params.get("meta");
    if (meta === "connected") toast.success("Meta Ads conectado!");
    else if (meta === "error") toast.error(`Falha ao conectar: ${params.get("meta_detail") ?? ""}`);
    if (meta) {
      const url = new URL(window.location.href);
      url.searchParams.delete("meta");
      url.searchParams.delete("meta_detail");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId]);

  // const connectMeta = async () => {
  //   setMetaLoading(true);
  //   try {
  //     const { url } = await fnGetAuthUrl();
  //     window.location.href = url;
  //   } catch (e) {
  //     setMetaLoading(false);
  //     toast.error(e instanceof Error ? e.message : "Falha ao iniciar conexão");
  //   }
  // };

  // const runSync = async () => {
  //   setSyncing(true);
  //   try {
  //     const r = await fnSync({ data: {} }) as { processed: number; from: string; to: string };
  //     toast.success(`${r.processed} dias sincronizados (${r.from} → ${r.to})`);
  //     await loadMeta();
  //     await refresh();
  //   } catch (e) {
  //     toast.error(e instanceof Error ? e.message : "Falha ao sincronizar");
  //   } finally {
  //     setSyncing(false);
  //   }
  // };

  // const disconnectM = async () => {
  //   if (!confirm("Desconectar Meta Ads?")) return;
  //   try {
  //     await fnDisconnect();
  //     toast.success("Desconectado");
  //     setMetaConn(null);
  //     setAdAccounts([]);
  //   } catch (e) {
  //     toast.error(e instanceof Error ? e.message : "Erro");
  //   }
  // };

  const saveTheme = async () => {
    if (!session) return;
    const { error } = await supabase.from("theme_settings").upsert({ user_id: session.userId, ...t }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Aparência salva");
    await refresh();
  };

  const DEFAULT_THEME = {
    primary_color: "#c2410c",
    accent_color: "#16a34a",
    background_color: "#fafaf7",
    card_color: "#ffffff",
    foreground_color: "#1c1917",
  } as const;

  const resetTheme = async () => {
    if (!session) return;
    const next = { ...t, ...DEFAULT_THEME };
    setT(next);
    const { error } = await supabase.from("theme_settings").upsert({ user_id: session.userId, ...next }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Cores restauradas para o padrão da plataforma");
    await refresh();
  };
  const saveFunnel = async () => {
    if (!session) return;
    const { error } = await supabase.from("funnel_config").upsert({ user_id: session.userId, ...f }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Funil atualizado");
    await refresh();
  };

  const uploadLogo = async (file: File) => {
    if (!session) return;
    if (!/image\/(png|jpeg|jpg|webp|svg\+xml)/.test(file.type)) return toast.error("Use PNG, JPG, WEBP ou SVG");
    if (file.size > 2 * 1024 * 1024) return toast.error("Máximo 2MB");
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${session.userId}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("logos").upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: signed } = await supabase.storage.from("logos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    const url = signed?.signedUrl ?? null;
    setT({ ...t, logo_url: url });
    const { error } = await supabase.from("theme_settings").upsert({ user_id: session.userId, ...t, logo_url: url }, { onConflict: "user_id" });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Logo enviada");
    await refresh();
  };

  const removeLogo = async () => {
    if (!session) return;
    const next = { ...t, logo_url: null };
    setT(next);
    const { error } = await supabase.from("theme_settings").upsert({ user_id: session.userId, ...next }, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Logo removida");
    await refresh();
  };

  type ColorKey = "primary_color" | "accent_color" | "background_color" | "card_color" | "foreground_color";
  const colorFields: { key: ColorKey; label: string }[] = [
    { key: "primary_color", label: "Cor primária" },
    { key: "accent_color", label: "Cor de destaque" },
    { key: "background_color", label: "Fundo" },
    { key: "card_color", label: "Cartões" },
    { key: "foreground_color", label: "Texto" },
  ];

  const funnelFields: { key: keyof FunnelConfig; label: string }[] = [
    { key: "label_leads", label: "Leads" },
    { key: "label_qualified", label: "Qualificados" },
    { key: "label_appointments", label: "Agendamentos" },
    { key: "label_meetings", label: "Reuniões" },
    { key: "label_proposals", label: "Propostas" },
    { key: "label_closings", label: "Fechamentos" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Personalização</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Aparência</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cores, marca e rótulos do funil.</p>
      </div>

      <Tabs defaultValue="tema">
        <TabsList>
          <TabsTrigger value="tema">Tema</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="funil">Funil</TabsTrigger>
        </TabsList>

        <TabsContent value="tema">
          <Card>
            <CardHeader><CardTitle>Cores e marca</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1.5">
                <Label>Nome da marca</Label>
                <Input value={t.brand_name} onChange={(e) => setT({ ...t, brand_name: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {colorFields.map((c) => (
                  <div key={c.key} className="space-y-1.5">
                    <Label>{c.label}</Label>
                    <div className="flex gap-2">
                      <input type="color" value={t[c.key]} onChange={(e) => setT({ ...t, [c.key]: e.target.value })}
                        className="h-10 w-14 cursor-pointer rounded border border-input bg-transparent" />
                      <Input value={t[c.key]} onChange={(e) => setT({ ...t, [c.key]: e.target.value })} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetTheme} className="hover-lift">
                  <RotateCcw className="mr-2 h-4 w-4" /> Voltar ao padrão
                </Button>
                <Button onClick={saveTheme} className="hover-lift">Salvar tema</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo">
          <Card>
            <CardHeader><CardTitle>Logo da marca</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-secondary/40">
                  {t.logo_url ? (
                    <img src={t.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Recomendação para enquadramento perfeito:</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    <li>PNG com <strong>fundo transparente</strong></li>
                    <li>Formato <strong>quadrado (1:1)</strong> — ideal <strong>512×512 px</strong></li>
                    <li>Margem interna de ~10% para não cortar</li>
                    <li>Máximo 2MB · PNG, JPG, WEBP ou SVG</li>
                  </ul>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="hover-lift">
                  <Upload className="mr-2 h-4 w-4" />{uploading ? "Enviando..." : "Enviar logo"}
                </Button>
                {t.logo_url && (
                  <Button variant="outline" onClick={removeLogo} className="hover-lift">
                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes">
          <Card>
            <CardHeader><CardTitle>Integrações</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg overflow-hidden opacity-50">
                    <MetaIcon className="h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Meta Ads</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-orange-600">
                        Em manutenção
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Esta integração está temporariamente em manutenção. Voltaremos em breve.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-secondary/30 p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg overflow-hidden border border-border/30 bg-white">
                    <GoogleIcon className="h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Google Ads</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Em breve</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Importe dados de investimento e conversões das suas campanhas do Google Ads automaticamente para o painel.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funil">
          <Card>
            <CardHeader><CardTitle>Rótulos do funil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {funnelFields.map((ff) => (
                  <div key={ff.key} className="space-y-1.5">
                    <Label>{ff.label}</Label>
                    <Input value={f[ff.key]} onChange={(e) => setF({ ...f, [ff.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end"><Button onClick={saveFunnel} className="hover-lift">Salvar funil</Button></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}