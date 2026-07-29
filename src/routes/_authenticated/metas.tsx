import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAppData } from "@/hooks/use-app-data";
import { monthLabel } from "@/lib/marketing";

export const Route = createFileRoute("/_authenticated/metas")({ component: MetasPage });

function MetasPage() {
  const { goals, session, refresh } = useAppData();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [monthKey, setMonthKey] = useState(currentMonth);
  const existing = useMemo(() => goals.find((g) => g.month_key === monthKey), [goals, monthKey]);

  const [values, setValues] = useState({
    revenue_goal: "", roas_goal: "", closings_goal: "", leads_goal: "",
    max_cac: "", max_cpl: "", max_noshow: "",
  });
  useEffect(() => {
    setValues({
      revenue_goal: existing?.revenue_goal?.toString() ?? "",
      roas_goal: existing?.roas_goal?.toString() ?? "",
      closings_goal: existing?.closings_goal?.toString() ?? "",
      leads_goal: existing?.leads_goal?.toString() ?? "",
      max_cac: existing?.max_cac?.toString() ?? "",
      max_cpl: existing?.max_cpl?.toString() ?? "",
      max_noshow: existing?.max_noshow != null ? (Number(existing.max_noshow) * 100).toString() : "",
    });
  }, [existing, monthKey]);

  const save = async () => {
    if (!session) return;
    const toNum = (s: string) => (s === "" ? null : Number(s));
    const payload = {
      user_id: session.userId,
      month_key: monthKey,
      revenue_goal: toNum(values.revenue_goal),
      roas_goal: toNum(values.roas_goal),
      closings_goal: values.closings_goal === "" ? null : parseInt(values.closings_goal, 10),
      leads_goal: values.leads_goal === "" ? null : parseInt(values.leads_goal, 10),
      max_cac: toNum(values.max_cac),
      max_cpl: toNum(values.max_cpl),
      max_noshow: values.max_noshow === "" ? null : Number(values.max_noshow) / 100,
    };
    const { error } = await supabase.from("monthly_goals").upsert(payload, { onConflict: "user_id,month_key" });
    if (error) return toast.error(error.message);
    toast.success("Metas salvas");
    await refresh();
  };

  const fields: { key: keyof typeof values; label: string; hint?: string; step?: string }[] = [
    { key: "revenue_goal", label: "Meta de receita (R$)", step: "0.01" },
    { key: "roas_goal", label: "Meta de ROAS", hint: "ex: 3 = 3x", step: "0.01" },
    { key: "closings_goal", label: "Meta de fechamentos" },
    { key: "leads_goal", label: "Meta de leads" },
    { key: "max_cac", label: "CAC máximo (R$)", step: "0.01" },
    { key: "max_cpl", label: "CPL máximo (R$)", step: "0.01" },
    { key: "max_noshow", label: "No-show máximo (%)", hint: "0-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Objetivos</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Metas mensais</h1>
        <p className="mt-1 text-sm text-muted-foreground">Defina metas e limites para acompanhar no dashboard.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="capitalize">{monthLabel(monthKey)}</CardTitle>
          <Input type="month" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} className="w-[180px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input type="number" step={f.step} value={values[f.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={save}>Salvar metas</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}