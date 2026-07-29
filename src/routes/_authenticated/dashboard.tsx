import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowRight, Download, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  aggregateMonth, brl, exportEntriesCSV, listMonths, money, monthKey, monthLabel,
  num, pct, ratio, type DailyEntry, type MonthlyAggregate,
} from "@/lib/marketing";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { entries, funnel, goals } = useAppData();
  const months = useMemo(() => listMonths(entries), [entries]);
  const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
  const defaultMonth = months.includes(currentMonth) ? currentMonth : months[months.length - 1] ?? currentMonth;
  const [selected, setSelected] = useState<string>(defaultMonth);

  useEffect(() => {
    if (!months.length) return;
    if (!months.includes(selected)) setSelected(months[months.length - 1]);
  }, [months, selected]);

  const agg = useMemo(() => aggregateMonth(entries, selected), [entries, selected]);
  const trend = useMemo(() => months.map((m) => aggregateMonth(entries, m)), [entries, months]);
  const goal = goals.find((g) => g.month_key === selected);

  if (!entries.length) return <EmptyState />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Resumo mensal</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl capitalize">{monthLabel(selected)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Métricas do funil, custo e conversão.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Escolher mês" /></SelectTrigger>
            <SelectContent>
              {months.map((m) => <SelectItem key={m} value={m} className="capitalize">{monthLabel(m)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" title="Exportar CSV" onClick={() => downloadCSV(entries)} className="hover-lift">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <KpiRow agg={agg} goal={goal} />
      {goal && <GoalProgress agg={agg} goal={goal} />}
      <FunnelSection agg={agg} funnel={funnel} />
      <RatesSection agg={agg} goal={goal} />
      <TrendSection trend={trend} />
    </div>
  );
}

function KpiRow({ agg }: { agg: MonthlyAggregate; goal?: { revenue_goal: number | null } }) {
  const items = [
    { label: "Investimento", value: brl(agg.investment) },
    { label: "Receita", value: brl(agg.revenue) },
    { label: "ROAS", value: ratio(agg.roas) },
    { label: "CAC", value: money(agg.cac) },
    { label: "CPL", value: money(agg.cpl) },
    { label: "Ticket médio", value: money(agg.ticketMedio) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it, i) => (
        <Card key={it.label} className="border-border/60 card-anim" style={{ animationDelay: `${i * 60}ms` }}>
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{it.label}</div>
            <div className="mt-2 text-xl font-semibold tracking-tight">{it.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GoalProgress({ agg, goal }: { agg: MonthlyAggregate; goal: { revenue_goal: number | null; roas_goal: number | null; closings_goal: number | null; leads_goal: number | null } }) {
  const items = [
    goal.revenue_goal ? { label: "Receita", current: agg.revenue, target: Number(goal.revenue_goal), fmt: brl } : null,
    goal.closings_goal ? { label: "Fechamentos", current: agg.closings, target: Number(goal.closings_goal), fmt: num } : null,
    goal.leads_goal ? { label: "Leads", current: agg.totalLeads, target: Number(goal.leads_goal), fmt: num } : null,
    goal.roas_goal && agg.roas != null ? { label: "ROAS", current: agg.roas, target: Number(goal.roas_goal), fmt: (n: number) => `${n.toFixed(2)}x` } : null,
  ].filter(Boolean) as { label: string; current: number; target: number; fmt: (n: number) => string }[];
  if (!items.length) return null;
  return (
    <Card className="card-anim">
      <CardHeader><CardTitle>Metas do mês</CardTitle></CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => {
          const p = Math.min(100, (it.current / it.target) * 100);
          return (
            <div key={it.label} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{it.label}</span>
                <span className="text-xs text-muted-foreground">{it.fmt(it.current)} / {it.fmt(it.target)}</span>
              </div>
              <Progress value={p} />
              <div className="text-xs text-muted-foreground">{p.toFixed(0)}% da meta</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function FunnelSection({ agg, funnel }: { agg: MonthlyAggregate; funnel: ReturnType<typeof useAppData>["funnel"] }) {
  const data = [
    { stage: funnel.label_leads, value: agg.totalLeads },
    { stage: funnel.label_qualified, value: agg.qualified },
    { stage: funnel.label_appointments, value: agg.appointments },
    { stage: funnel.label_meetings, value: agg.meetings },
    { stage: funnel.label_proposals, value: agg.proposals },
    { stage: funnel.label_closings, value: agg.closings },
  ];
  return (
    <Card className="card-anim">
      <CardHeader><CardTitle>Funil do mês</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="stage" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="divide-y divide-border/60 text-sm">
            {data.map((d) => (
              <li key={d.stage} className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">{d.stage}</span>
                <span className="font-semibold tabular-nums">{num(d.value)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">No-show</span>
              <span className="font-semibold tabular-nums">{num(agg.noShow)}</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function RatesSection({ agg, goal }: { agg: MonthlyAggregate; goal?: { max_noshow: number | null } }) {
  const noshowLimit = goal?.max_noshow ? Number(goal.max_noshow) : 0.2;
  const rates = [
    { label: "Qualificação", value: agg.taxaQualificacao },
    { label: "Agendamento", value: agg.taxaAgendamento },
    { label: "Comparecimento", value: agg.taxaComparecimento },
    { label: "No-show", value: agg.taxaNoShow, warn: true },
    { label: "Reunião → Fechamento", value: agg.taxaReuniaoFechamento },
  ];
  return (
    <Card className="card-anim">
      <CardHeader><CardTitle>Taxas do funil</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {rates.map((r) => (
            <div key={r.label} className="rounded-lg border border-border/60 bg-secondary/40 p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{r.label}</div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums ${r.warn && r.value && r.value > noshowLimit ? "text-destructive" : ""}`}>
                {pct(r.value)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TrendSection({ trend }: { trend: MonthlyAggregate[] }) {
  const data = trend.map((t) => ({
    month: monthLabel(t.monthKey).replace(" de ", "/"),
    Investimento: Math.round(t.investment),
    Receita: Math.round(t.revenue),
    Fechamentos: t.closings,
  }));
  return (
    <Card className="card-anim">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" /> Tendência mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name) => (name === "Investimento" || name === "Receita" ? brl(v) : num(v))} />
              <Line type="monotone" dataKey="Investimento" stroke="var(--primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Receita" stroke="var(--accent)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Fechamentos" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl py-24 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <TrendingUp className="h-6 w-6" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Comece a registrar seus dados</h1>
      <p className="mt-2 text-muted-foreground">Adicione o primeiro lançamento diário para ver o resumo mensal.</p>
      <Button asChild size="lg" className="mt-6 hover-lift">
        <Link to="/lancamentos">Adicionar lançamento <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </div>
  );
}

function downloadCSV(entries: DailyEntry[]) {
  const csv = exportEntriesCSV(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `marketing-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}