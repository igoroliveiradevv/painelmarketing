import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp, Target, LineChart as LineIcon, Sparkles, CheckCircle2, Flame } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Result Scale — Painel de Marketing & Vendas que escala resultado" },
      {
        name: "description",
        content:
          "Acompanhe investimento, leads, funil de vendas e ROAS em um painel mensal claro, rápido e feito para decisões.",
      },
      { property: "og:title", content: "Result Scale — Painel que escala resultado" },
      {
        property: "og:description",
        content: "Dashboards de marketing e vendas em tempo real com metas, funil e ROAS.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-white text-[#1A1206] selection:bg-[#FF6A1A] selection:text-white">
      {/* Ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1000px circle at 85% -10%, rgba(255,106,26,0.18), transparent 55%), radial-gradient(800px circle at -10% 110%, rgba(255,179,71,0.22), transparent 55%)",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#1A1206]/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/resultscalelogo.png"
              alt="Result Scale"
              className="h-9 w-9 rounded-lg"
            />
            <span className="font-semibold tracking-tight">
              Result<span className="text-[#FF6A1A]">Scale</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-[#1A1206]/70 md:flex">
            <a href="#recursos" className="hover:text-[#FF6A1A] transition">Recursos</a>
            <a href="#numeros" className="hover:text-[#FF6A1A] transition">Números</a>
            <a href="#como" className="hover:text-[#FF6A1A] transition">Como funciona</a>
          </nav>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1A1206] px-4 py-2 text-sm font-semibold text-[#FFF7EE] transition hover:bg-[#FF6A1A]"
          >
            Entrar
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero — asymmetric split */}
      <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10 lg:pt-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6A1A]/25 bg-[#FFF7EE]/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#FF6A1A]">
            <Flame className="h-3.5 w-3.5" /> Painel de performance
          </span>
          <h1 className="mt-6 text-[44px] font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-[72px]">
            Do <span className="relative inline-block">
              <span className="relative z-10">lead</span>
              <span aria-hidden className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-sm bg-[#FFB347]/70" />
            </span>{" "}
            ao <span className="text-[#FF6A1A]">resultado</span>,
            <br className="hidden sm:block" /> com clareza absoluta.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#1A1206]/70">
            O Result Scale reúne investimento, funil, metas e ROAS em um só painel — feito para times que precisam decidir rápido, sem depender de planilha.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6A1A] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_36px_-14px_rgba(255,106,26,0.75)] transition hover:bg-[#FF7E33]"
            >
              Comece agora
              <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#recursos"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1A1206]/15 bg-[#FFF7EE]/60 px-6 py-3.5 text-sm font-semibold text-[#1A1206] transition hover:border-[#1A1206]/40"
            >
              Ver recursos
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1A1206]/70">
            {["Multi-empresa", "Metas mensais", "Cores personalizáveis"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#FF6A1A]" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Mock dashboard card */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[36px] opacity-70 blur-2xl"
            style={{ background: "radial-gradient(circle at 30% 30%, rgba(255,106,26,0.35), transparent 60%)" }}
          />
          <div className="relative rounded-3xl border border-[#1A1206]/10 bg-[#FFF7EE] p-5 shadow-[0_40px_80px_-40px_rgba(26,18,6,0.35)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1206]/50">Painel mensal</div>
                <div className="text-lg font-black">Outubro · 2026</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6A1A]/10 px-2.5 py-1 text-xs font-semibold text-[#FF6A1A]">
                <TrendingUp className="h-3.5 w-3.5" /> +32% MoM
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                { l: "CPL", v: "R$ 12,40" },
                { l: "CAC", v: "R$ 184" },
                { l: "ROAS", v: "4.8x" },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border border-[#1A1206]/8 bg-white p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#1A1206]/50">{k.l}</div>
                  <div className="mt-1 text-base font-black">{k.v}</div>
                </div>
              ))}
            </div>

            {/* Faux chart */}
            <div className="mt-4 rounded-xl border border-[#1A1206]/8 bg-gradient-to-br from-[#FFF7EE] to-white p-4">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1206]/70">Receita vs Investimento</span>
                <span className="text-[#1A1206]/40">últimos 7 dias</span>
              </div>
              <svg viewBox="0 0 300 90" className="h-24 w-full">
                <defs>
                  <linearGradient id="fill1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#FF6A1A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,25 L240,30 L300,10 L300,90 L0,90 Z" fill="url(#fill1)" />
                <path d="M0,70 L40,55 L80,60 L120,40 L160,45 L200,25 L240,30 L300,10" fill="none" stroke="#FF6A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0,78 L40,72 L80,74 L120,66 L160,70 L200,58 L240,60 L300,52" fill="none" stroke="#1A1206" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Funil bars */}
            <div className="mt-4 space-y-2">
              {[
                { l: "Leads", v: 92, n: "1.240" },
                { l: "Qualificados", v: 62, n: "770" },
                { l: "Reuniões", v: 34, n: "421" },
                { l: "Vendas", v: 18, n: "224" },
              ].map((s) => (
                <div key={s.l} className="flex items-center gap-3 text-xs">
                  <span className="w-24 shrink-0 font-medium text-[#1A1206]/70">{s.l}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1A1206]/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.v}%`, background: "linear-gradient(90deg,#FF6A1A,#FFB347)" }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right font-semibold">{s.n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-[#1A1206]/10 bg-[#1A1206] px-4 py-3 text-xs text-white shadow-xl sm:block">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FFB347]" />
              <div>
                <div className="font-semibold">Meta batida</div>
                <div className="text-white/60">104% do mês</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Números */}
      <section id="numeros" className="border-y border-[#1A1206]/8 bg-[#1A1206] text-[#FFF7EE]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-8">
          {[
            { n: "+3,2x", l: "ROAS médio" },
            { n: "-41%", l: "CAC em 90 dias" },
            { n: "100%", l: "dados centralizados" },
            { n: "<5min", l: "para lançar o dia" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-3xl font-black text-[#FF9046] sm:text-4xl">{s.n}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-[#FFF7EE]/60">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features — bento */}
      <section id="recursos" className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF6A1A]">Recursos</span>
            <h2 className="mt-2 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Menos planilha, <span className="text-[#FF6A1A]">mais decisão</span>.
            </h2>
          </div>
          <p className="max-w-sm text-[#1A1206]/65">
            Tudo que o seu time de marketing e vendas precisa acompanhar, no ritmo do negócio.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <FeatureCard
            className="md:col-span-4"
            icon={LineIcon}
            title="Dashboard mensal completo"
            desc="CPL, CAC, ROAS, receita, leads, funil e tendência — tudo consolidado por mês, sem exportar planilha."
            large
          />
          <FeatureCard
            className="md:col-span-2"
            icon={Target}
            title="Metas por indicador"
            desc="Defina metas mensais e veja o progresso em tempo real."
          />
          <FeatureCard
            className="md:col-span-2"
            icon={TrendingUp}
            title="Funil personalizável"
            desc="Renomeie etapas do seu funil para refletir seu processo real."
          />
          <FeatureCard
            className="md:col-span-4"
            icon={Sparkles}
            title="Sua marca, seu painel"
            desc="Faça upload da sua logo e personalize as cores do sistema. Cada cliente vê o painel com a identidade do seu negócio."
            large
          />
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <div className="rounded-3xl border border-[#1A1206]/10 bg-[#FFF7EE] p-8 sm:p-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF6A1A]">Como funciona</span>
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Três passos, resultado no mesmo dia.</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Lance o dia", d: "Registre investimento, leads e vendas em um formulário rápido." },
              { n: "02", t: "Acompanhe o mês", d: "Veja KPIs, funil e tendências atualizados em tempo real." },
              { n: "03", t: "Ajuste a rota", d: "Compare com metas e ajuste onde o funil está travando." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="text-5xl font-black text-[#FF6A1A]/20">{s.n}</div>
                <div className="mt-2 text-lg font-bold">{s.t}</div>
                <div className="mt-1 text-sm text-[#1A1206]/65">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-16"
          style={{ background: "linear-gradient(135deg,#FF6A1A 0%,#FF9046 60%,#FFB347 100%)" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />
          <div className="relative">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Pronto para escalar de verdade?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Entre no painel e transforme dados em decisão hoje mesmo.
            </p>
            <Link
              to="/cadastro"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1A1206] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Comece agora
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1A1206]/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-[#1A1206]/60 sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} Result Scale. Todos os direitos reservados.</span>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/termos" className="hover:text-[#FF6A1A] transition">Termos de Uso</Link>
            <Link to="/politicadeprivacidade" className="hover:text-[#FF6A1A] transition">Política de Privacidade</Link>
            <Link to="/exclusaodedados" className="hover:text-[#FF6A1A] transition">Exclusão de Dados</Link>
            <Link to="/auth" className="font-semibold text-[#1A1206] hover:text-[#FF6A1A]">Entrar →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
  className = "",
  large = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-[#1A1206]/10 bg-[#FFF7EE] p-6 transition hover:-translate-y-1 hover:border-[#FF6A1A]/40 hover:shadow-[0_24px_50px_-30px_rgba(255,106,26,0.6)] sm:p-8 ${className}`}
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6A1A]/10 text-[#FF6A1A] transition group-hover:bg-[#FF6A1A] group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className={`mt-5 font-black tracking-tight ${large ? "text-2xl" : "text-lg"}`}>{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[#1A1206]/65">{desc}</p>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition group-hover:opacity-100"
        style={{ background: "radial-gradient(circle,#FF6A1A,transparent 60%)" }}
      />
    </div>
  );
}