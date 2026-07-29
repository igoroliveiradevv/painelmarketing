import { z } from "zod";

export interface DailyEntry {
  id: string;
  date: string;
  name: string;
  investment: number;
  trafficLeads: number;
  organicLeads: number;
  qualified: number;
  appointments: number;
  meetings: number;
  proposals: number;
  closings: number;
  dailyRevenue: number;
}

export const dailyEntrySchema = z.object({
  date: z.string().min(1, "Data obrigatória"),
  name: z.string(),
  investment: z.coerce.number().min(0),
  trafficLeads: z.coerce.number().int().min(0),
  organicLeads: z.coerce.number().int().min(0),
  qualified: z.coerce.number().int().min(0),
  appointments: z.coerce.number().int().min(0),
  meetings: z.coerce.number().int().min(0),
  proposals: z.coerce.number().int().min(0),
  closings: z.coerce.number().int().min(0),
  dailyRevenue: z.coerce.number().min(0),
});

export type DbEntry = {
  id: string;
  entry_date: string;
  name: string | null;
  investment: number | string;
  traffic_leads: number;
  organic_leads: number;
  qualified: number;
  appointments: number;
  meetings: number;
  proposals: number;
  closings: number;
  daily_revenue: number | string;
};

export function fromDb(r: DbEntry): DailyEntry {
  return {
    id: r.id,
    date: r.entry_date,
    name: r.name ?? "",
    investment: Number(r.investment),
    trafficLeads: r.traffic_leads,
    organicLeads: r.organic_leads,
    qualified: r.qualified,
    appointments: r.appointments,
    meetings: r.meetings,
    proposals: r.proposals,
    closings: r.closings,
    dailyRevenue: Number(r.daily_revenue),
  };
}

export function toDb(e: Omit<DailyEntry, "id">) {
  return {
    entry_date: e.date,
    name: e.name || null,
    investment: e.investment,
    traffic_leads: e.trafficLeads,
    organic_leads: e.organicLeads,
    qualified: e.qualified,
    appointments: e.appointments,
    meetings: e.meetings,
    proposals: e.proposals,
    closings: e.closings,
    daily_revenue: e.dailyRevenue,
  };
}

export function monthKey(dateISO: string) {
  return dateISO.slice(0, 7);
}

export interface MonthlyAggregate {
  monthKey: string;
  investment: number;
  trafficLeads: number;
  organicLeads: number;
  totalLeads: number;
  qualified: number;
  appointments: number;
  meetings: number;
  proposals: number;
  closings: number;
  revenue: number;
  cpl: number | null;
  cac: number | null;
  ticketMedio: number | null;
  roas: number | null;
  taxaQualificacao: number | null;
  taxaAgendamento: number | null;
  taxaNoShow: number | null;
  taxaComparecimento: number | null;
  taxaReuniaoFechamento: number | null;
  noShow: number;
}

export function aggregateMonth(entries: DailyEntry[], key: string): MonthlyAggregate {
  const rows = entries.filter((e) => monthKey(e.date) === key);
  const sum = (fn: (e: DailyEntry) => number) => rows.reduce((a, e) => a + fn(e), 0);
  const investment = sum((e) => e.investment);
  const trafficLeads = sum((e) => e.trafficLeads);
  const organicLeads = sum((e) => e.organicLeads);
  const totalLeads = trafficLeads + organicLeads;
  const qualified = sum((e) => e.qualified);
  const appointments = sum((e) => e.appointments);
  const meetings = sum((e) => e.meetings);
  const proposals = sum((e) => e.proposals);
  const closings = sum((e) => e.closings);
  const revenue = sum((e) => e.dailyRevenue);
  const div = (n: number, d: number) => (d > 0 ? n / d : null);
  return {
    monthKey: key,
    investment, trafficLeads, organicLeads, totalLeads,
    qualified, appointments, meetings, proposals, closings, revenue,
    cpl: div(investment, totalLeads),
    cac: div(investment, closings),
    ticketMedio: div(revenue, closings),
    roas: div(revenue, investment),
    taxaQualificacao: div(qualified, totalLeads),
    taxaAgendamento: div(appointments, qualified),
    taxaNoShow: div(appointments - meetings, appointments),
    taxaComparecimento: div(meetings, appointments),
    taxaReuniaoFechamento: div(closings, meetings),
    noShow: Math.max(0, appointments - meetings),
  };
}

export function listMonths(entries: DailyEntry[]): string[] {
  const set = new Set(entries.map((e) => monthKey(e.date)));
  return Array.from(set).sort();
}

export function monthLabel(key: string): string {
  if (!key) return "";
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const brlPrecise = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const pct = (n: number | null) =>
  n === null ? "—" : `${(n * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
export const num = (n: number) => n.toLocaleString("pt-BR");
export const money = (n: number | null) => (n === null ? "—" : brlPrecise(n));
export const ratio = (n: number | null, suffix = "x") =>
  n === null ? "—" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${suffix}`;

export function exportEntriesCSV(entries: DailyEntry[]): string {
  const header = ["data","nome","investimento","leads_trafego","leads_organicos","qualificados","agendamentos","reunioes","propostas","fechamentos","receita_dia"];
  const rows = [...entries].sort((a,b)=>a.date.localeCompare(b.date)).map((e) => [
    e.date, `"${e.name.replace(/"/g, '""')}"`, e.investment, e.trafficLeads, e.organicLeads, e.qualified,
    e.appointments, e.meetings, e.proposals, e.closings, e.dailyRevenue,
  ].join(","));
  return [header.join(","), ...rows].join("\n");
}