import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/exclusaodedados")({
  head: () => ({
    meta: [
      { title: "Exclusão de Dados — Result Scale" },
      {
        name: "description",
        content:
          "Instruções para exclusão de dados pessoais e da conta na plataforma Result Scale.",
      },
      { property: "og:title", content: "Exclusão de Dados — Result Scale" },
      {
        property: "og:description",
        content: "Saiba como excluir seus dados da Result Scale.",
      },
    ],
  }),
  component: ExclusaoPage,
});

function ExclusaoPage() {
  return (
    <LegalShell title="Exclusão de Dados" updated="14 de julho de 2026">
      <p>
        Este documento explica como você pode excluir seus dados pessoais e
        encerrar sua conta na plataforma <strong>Result Scale</strong>, em
        conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº
        13.709/2018 — LGPD).
      </p>

      <h2>1. Desconectar integração Meta Ads</h2>
      <p>
        Se você deseja remover apenas os dados da integração com Meta Ads, faça
        login na sua conta e acesse <strong>Configurações → Integrações → Desconectar Meta Ads</strong>. Isso removerá os tokens de acesso e encerrará a
        integração com sua conta Meta.
      </p>

      <h2>2. Exclusão completa da conta e dados</h2>
      <p>
        Caso deseje a exclusão completa da sua conta e de todos os dados
        armazenados, envie um e-mail para{" "}
        <a
          href="mailto:igor@agencianexapulse.com.br"
          className="text-[#FF6A1A] underline"
        >
          igor@agencianexapulse.com.br
        </a>{" "}
        com o assunto <strong>"Exclusão de Dados"</strong> juntamente ao
        endereço de e-mail associado à conta. A solicitação será processada em
        até <strong>7 dias</strong>.
      </p>

      <h2>3. O que é excluído</h2>
      <ul>
        <li>Dados de conta (e-mail, nome, senha);</li>
        <li>Lançamentos diários e metas mensais;</li>
        <li>Configurações de aparência e logotipo enviado;</li>
        <li>Tokens de acesso e dados da integração Meta Ads;</li>
        <li>Quaisquer outros dados operacionais inseridos na Plataforma.</li>
      </ul>

      <h2>4. Prazos de retenção residual</h2>
      <p>
        Após a exclusão, alguns registros podem ser mantidos por período
        limitado para cumprimento de obrigações legais, como logs de acesso
        (até 6 meses, conforme o Marco Civil da Internet) e registros
        financeiros (conforme legislação fiscal aplicável).
      </p>

      <h2>5. Direitos do titular</h2>
      <p>
        Nos termos da LGPD, você tem o direito de solicitar a eliminação dos
        dados pessoais tratados com base no consentimento, bem como revogar o
        consentimento a qualquer tempo. O exercício desses direitos não afeta a
        licitude do tratamento realizado antes da revogação.
      </p>

      <h2>6. Contato</h2>
      <p>
        Em caso de dúvidas sobre o processo de exclusão de dados, entre em
        contato pelo e-mail{" "}
        <a
          href="mailto:igor@agencianexapulse.com.br"
          className="text-[#FF6A1A] underline"
        >
          igor@agencianexapulse.com.br
        </a>
        .
      </p>
    </LegalShell>
  );
}

function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#1A1206]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(900px circle at 90% -10%, rgba(255,106,26,0.14), transparent 55%), radial-gradient(700px circle at -10% 110%, rgba(255,179,71,0.18), transparent 55%)",
        }}
      />
      <header className="sticky top-0 z-30 border-b border-[#1A1206]/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-8">
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
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1A1206]/10 bg-[#FFF7EE] px-3.5 py-1.5 text-xs font-semibold text-[#1A1206]/70 transition hover:border-[#FF6A1A]/40 hover:text-[#FF6A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-14 sm:px-8">
        <span className="inline-flex items-center rounded-full bg-[#FFF7EE] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FF6A1A]">
          Direitos do titular
        </span>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-2 text-sm text-[#1A1206]/60">Última atualização: {updated}</p>

        <article className="legal-content mt-10 space-y-4 text-[15px] leading-relaxed text-[#1A1206]/80">
          {children}
        </article>

        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-[#1A1206]/10 pt-6 text-sm">
          <Link to="/termos" className="rounded-full bg-[#FFF7EE] px-4 py-2 font-semibold text-[#1A1206] hover:text-[#FF6A1A]">
            Termos de Uso
          </Link>
          <Link to="/politicadeprivacidade" className="rounded-full bg-[#FFF7EE] px-4 py-2 font-semibold text-[#1A1206] hover:text-[#FF6A1A]">
            Política de Privacidade
          </Link>
          <Link to="/exclusaodedados" className="rounded-full bg-[#FFF7EE] px-4 py-2 font-semibold text-[#1A1206] hover:text-[#FF6A1A]">
            Exclusão de Dados
          </Link>
          <Link to="/auth" className="ml-auto rounded-full bg-[#1A1206] px-4 py-2 font-semibold text-white hover:bg-[#FF6A1A]">
            Entrar
          </Link>
        </div>
      </main>

      <style>{`
        .legal-content h2 { font-size: 1.25rem; font-weight: 800; color: #1A1206; margin-top: 2rem; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
        .legal-content p { margin: 0.5rem 0; }
        .legal-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
        .legal-content li { margin: 0.25rem 0; }
        .legal-content strong { color: #1A1206; }
      `}</style>
    </div>
  );
}
