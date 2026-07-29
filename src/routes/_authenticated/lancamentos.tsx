import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Loader2, Pencil, Plus, Trash2, X, Check, Database } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { fetchMetaDayData, listMetaAdAccounts, listMetaCampaigns } from "@/lib/meta.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { brl, dailyEntrySchema, num, toDb, type DailyEntry } from "@/lib/marketing";
import { supabase } from "@/integrations/supabase/client";
import { useAppData } from "@/hooks/use-app-data";
import type { z } from "zod";

export const Route = createFileRoute("/_authenticated/lancamentos")({
  component: LancamentosPage,
});

type FormValues = z.infer<typeof dailyEntrySchema>;

const emptyForm: FormValues = {
  date: new Date().toISOString().slice(0, 10),
  name: "",
  investment: 0, trafficLeads: 0, organicLeads: 0, qualified: 0,
  appointments: 0, meetings: 0, proposals: 0, closings: 0, dailyRevenue: 0,
};

type EntryMode = "manual" | "meta";

function LancamentosPage() {
  const { entries, refresh, session } = useAppData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [mode, setMode] = useState<EntryMode>("manual");
  const [metaPulled, setMetaPulled] = useState(false);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [adAccounts, setAdAccounts] = useState<Array<{ id: string; account_id: string; name: string }>>([]);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string>("");
  const [loadingAdAccounts, setLoadingAdAccounts] = useState(false);
  const pullMeta = useServerFn(fetchMetaDayData);
  const listCampaignsFn = useServerFn(listMetaCampaigns);
  const listAdAccountsFn = useServerFn(listMetaAdAccounts);

  const loadAdAccounts = async () => {
    setLoadingAdAccounts(true);
    try {
      const data = await listAdAccountsFn();
      setAdAccounts(data);
    } catch (err) {
      toast.error((err as Error).message);
      setAdAccounts([]);
    } finally {
      setLoadingAdAccounts(false);
    }
  };

  const loadCampaigns = async (adAccountId: string) => {
    if (!adAccountId) return;
    setLoadingCampaigns(true);
    setCampaigns([]);
    setSelectedCampaignId("");
    try {
      const data = await listCampaignsFn({ data: { adAccountId } });
      setCampaigns(data);
    } catch (err) {
      toast.error((err as Error).message);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleAdAccountChange = (accountId: string) => {
    setSelectedAdAccountId(accountId);
    setSelectedCampaignId("");
    setMetaPulled(false);
    loadCampaigns(accountId);
  };

  const form = useForm<FormValues>({ resolver: zodResolver(dailyEntrySchema), defaultValues: emptyForm });
  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries]);

  const switchMode = (m: EntryMode) => {
    setMode(m);
    setMetaPulled(false);
    if (m === "manual") {
      form.reset(emptyForm);
    } else {
      const currentDate = form.getValues("date");
      form.reset({ ...emptyForm, date: currentDate });
      setSelectedAdAccountId("");
      setSelectedCampaignId("");
      setCampaigns([]);
      loadAdAccounts();
    }
  };

  const startEdit = (e: DailyEntry) => {
    setEditingId(e.id);
    setMode("manual");
    setMetaPulled(false);
    form.reset({
      date: e.date, name: e.name, investment: e.investment, trafficLeads: e.trafficLeads,
      organicLeads: e.organicLeads, qualified: e.qualified, appointments: e.appointments,
      meetings: e.meetings, proposals: e.proposals, closings: e.closings, dailyRevenue: e.dailyRevenue,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setMetaPulled(false); form.reset(emptyForm); };

  const pullFromMeta = async () => {
    const date = form.getValues("date");
    if (!date) return toast.error("Informe a data antes de puxar");
    if (!selectedAdAccountId) return toast.error("Selecione uma conta de anúncio");
    if (!selectedCampaignId) return toast.error("Selecione uma campanha");
    setPulling(true);
    setMetaPulled(false);
    try {
      const result = await pullMeta({ data: { date, adAccountId: selectedAdAccountId, campaignId: selectedCampaignId } });
      form.setValue("investment", result.investment, { shouldDirty: true, shouldValidate: true });
      form.setValue("trafficLeads", result.trafficLeads, { shouldDirty: true, shouldValidate: true });
      setMetaPulled(true);
      if (result.empty) toast.info("Sem dados Meta Ads para este dia");
      else toast.success(`Dados puxados da Meta: R$ ${result.investment.toFixed(2)} · ${result.trafficLeads} leads`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setPulling(false); }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!session) return;
    setBusy(true);
    try {
      const payload = { ...toDb(values), user_id: session.userId };
      if (editingId) {
        const { error } = await supabase.from("daily_entries").update(payload).eq("id", editingId);
        if (error) throw error;
        toast.success("Lançamento atualizado");
      } else {
        const { error } = await supabase.from("daily_entries").upsert(payload, { onConflict: "user_id,entry_date" });
        if (error) throw error;
        toast.success("Lançamento adicionado");
      }
      setEditingId(null);
      setMetaPulled(false);
      form.reset({ ...emptyForm, date: values.date });
      await refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from("daily_entries").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido");
    if (editingId === id) cancelEdit();
    await refresh();
  };

  const allFields: Array<{ name: keyof FormValues; label: string; type?: string; step?: string }> = [
    { name: "date", label: "Data", type: "date" },
    { name: "name", label: "Nome do lançamento" },
    { name: "investment", label: "Investimento (R$)", type: "number", step: "0.01" },
    { name: "trafficLeads", label: "Leads tráfego", type: "number" },
    { name: "organicLeads", label: "Leads orgânicos", type: "number" },
    { name: "qualified", label: "Qualificados", type: "number" },
    { name: "appointments", label: "Agendamentos", type: "number" },
    { name: "meetings", label: "Reuniões", type: "number" },
    { name: "proposals", label: "Propostas", type: "number" },
    { name: "closings", label: "Fechamentos", type: "number" },
    { name: "dailyRevenue", label: "Receita dia (R$)", type: "number", step: "0.01" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Registro diário</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Lançamentos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cada linha é um dia de operação.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{editingId ? "Editar lançamento" : "Novo lançamento"}</CardTitle>
          {editingId && <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="mr-1 h-4 w-4" /> Cancelar</Button>}
        </CardHeader>
        <CardContent>
          {/* Mode toggle */}
          {!editingId && (
            <div className="mb-5 inline-flex rounded-lg border border-[#1A1206]/10 bg-[#FFF7EE] p-1">
              <button
                type="button"
                onClick={() => switchMode("manual")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  mode === "manual" ? "bg-white text-[#1A1206] shadow-sm" : "text-[#1A1206]/50 hover:text-[#1A1206]"
                }`}
              >
                Inserir manualmente
              </button>
              <button
                type="button"
                onClick={() => switchMode("meta")}
                className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition ${
                  mode === "meta" ? "bg-white text-[#1A1206] shadow-sm" : "text-[#1A1206]/50 hover:text-[#1A1206]"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                Puxar Meta Ads
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {mode === "manual" ? (
              <>
                {allFields.map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={f.name}>{f.label}</Label>
                    <Input id={f.name} type={f.type ?? "text"} step={f.step} min={f.type === "number" ? 0 : undefined} {...form.register(f.name)} />
                    {form.formState.errors[f.name] && <p className="text-xs text-destructive">{form.formState.errors[f.name]?.message as string}</p>}
                  </div>
                ))}

                <div className="col-span-full flex justify-end gap-2 pt-2">
                  <Button type="submit" disabled={busy}><Plus className="mr-1 h-4 w-4" />{editingId ? "Salvar" : "Adicionar"}</Button>
                </div>
              </>
            ) : (
              <>
                {/* Meta Ads mode */}
                <div className="col-span-full">
                  <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[#FF6A1A]/15 bg-[#FFF7EE]/50 p-4">
                    <div className="space-y-1.5 w-full sm:w-auto sm:flex-1">
                      <Label htmlFor="meta-date">Data do lançamento</Label>
                      <Input id="meta-date" type="date" {...form.register("date")} />
                    </div>
                    <div className="space-y-1.5 w-full sm:w-auto sm:flex-1">
                      <Label htmlFor="meta-account">Conta de anúncio</Label>
                      <Select
                        value={selectedAdAccountId}
                        onValueChange={handleAdAccountChange}
                        disabled={loadingAdAccounts}
                      >
                        <SelectTrigger id="meta-account" className="w-full">
                          <SelectValue placeholder={loadingAdAccounts ? "Carregando..." : "Selecione a conta"} />
                        </SelectTrigger>
                        <SelectContent>
                          {adAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 w-full sm:w-auto sm:flex-1">
                      <Label htmlFor="meta-campaign">Campanha</Label>
                      <Select
                        value={selectedCampaignId}
                        onValueChange={setSelectedCampaignId}
                        disabled={loadingCampaigns || !selectedAdAccountId}
                      >
                        <SelectTrigger id="meta-campaign" className="w-full">
                          <SelectValue placeholder={!selectedAdAccountId ? "Selecione a conta primeiro" : loadingCampaigns ? "Carregando..." : "Selecione a campanha"} />
                        </SelectTrigger>
                        <SelectContent>
                          {campaigns.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={pullFromMeta}
                      disabled={pulling || !selectedAdAccountId || !selectedCampaignId}
                      className="bg-[#FF6A1A] hover:bg-[#FF7E33] text-white"
                    >
                      {pulling ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                      Puxar Meta Ads
                    </Button>
                  </div>
                  {form.formState.errors.date && <p className="mt-1 text-xs text-destructive">{form.formState.errors.date?.message as string}</p>}
                </div>

                {metaPulled && (
                  <>
                    <div className="col-span-full">
                      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                        <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                          <Check className="h-4 w-4" /> Dados puxados com sucesso
                        </p>
                        <p className="mt-1 text-xs text-green-700">Revise os valores abaixo e confirme para salvar.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="meta-name">Nome do lançamento</Label>
                      <Input id="meta-name" type="text" {...form.register("name")} placeholder="Ex: Campanha de lançamento" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="meta-investment">Investimento (R$)</Label>
                      <Input id="meta-investment" type="number" step="0.01" min={0} {...form.register("investment")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-trafficLeads">Leads tráfego</Label>
                      <Input id="meta-trafficLeads" type="number" min={0} {...form.register("trafficLeads")} />
                    </div>

                    {/* Optional manual fields */}
                    <div className="col-span-full mt-2">
                      <p className="text-xs text-muted-foreground mb-2">Preencha os demais campos manualmente (opcional):</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="meta-organic">Leads orgânicos</Label>
                      <Input id="meta-organic" type="number" min={0} {...form.register("organicLeads")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-qualified">Qualificados</Label>
                      <Input id="meta-qualified" type="number" min={0} {...form.register("qualified")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-appointments">Agendamentos</Label>
                      <Input id="meta-appointments" type="number" min={0} {...form.register("appointments")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-meetings">Reuniões</Label>
                      <Input id="meta-meetings" type="number" min={0} {...form.register("meetings")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-proposals">Propostas</Label>
                      <Input id="meta-proposals" type="number" min={0} {...form.register("proposals")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-closings">Fechamentos</Label>
                      <Input id="meta-closings" type="number" min={0} {...form.register("closings")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta-revenue">Receita dia (R$)</Label>
                      <Input id="meta-revenue" type="number" step="0.01" min={0} {...form.register("dailyRevenue")} />
                    </div>

                    <div className="col-span-full flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => switchMode("manual")}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={busy} className="bg-[#FF6A1A] hover:bg-[#FF7E33] text-white">
                        <Check className="mr-1.5 h-4 w-4" />
                        Confirmar lançamento
                      </Button>
                    </div>
                  </>
                )}

                {!metaPulled && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7EE]">
                      <Database className="h-7 w-7 text-[#FF6A1A]/60" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#1A1206]">Selecione a data, a conta de anúncio e a campanha</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                      Investimento e leads serão preenchidos automaticamente. Depois é só revisar e confirmar.
                    </p>
                  </div>
                )}
              </>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Histórico ({num(entries.length)})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {sorted.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Invest.</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Qualif.</TableHead>
                  <TableHead className="text-right">Agend.</TableHead>
                  <TableHead className="text-right">Reun.</TableHead>
                  <TableHead className="text-right">Prop.</TableHead>
                  <TableHead className="text-right">Fechos</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{new Date(e.date + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">{e.name || "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{brl(e.investment)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.trafficLeads + e.organicLeads)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.qualified)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.appointments)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.meetings)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.proposals)}</TableCell>
                    <TableCell className="text-right tabular-nums">{num(e.closings)}</TableCell>
                    <TableCell className="text-right tabular-nums">{brl(e.dailyRevenue)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(e.id)}>Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
