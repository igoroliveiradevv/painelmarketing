import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/politicadeprivacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Result Scale" },
      {
        name: "description",
        content:
          "Como a Result Scale coleta, usa, armazena e protege dados pessoais e dados de anúncios integrados via Meta Ads.",
      },
      { property: "og:title", content: "Política de Privacidade — Result Scale" },
      {
        property: "og:description",
        content: "Práticas de privacidade e tratamento de dados da Result Scale.",
      },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <LegalShell title="Política de Privacidade" updated="14 de julho de 2026">
      <p>
        Esta Política descreve como a plataforma <strong>Result Scale</strong> ("Plataforma",
        "nós") coleta, utiliza, armazena, compartilha e protege dados pessoais e dados
        operacionais dos seus usuários, em conformidade com a Lei Geral de Proteção de
        Dados Pessoais (Lei nº 13.709/2018 — LGPD) e com boas práticas internacionais de
        privacidade. Esta Política deve ser lida em conjunto com os nossos
        {" "}<Link to="/termos" className="text-[#FF6A1A] underline">Termos de Uso</Link>.
      </p>

      <h2>1. Controlador dos Dados</h2>
      <p>
        O controlador dos dados é a Result Scale, responsável pela operação da Plataforma
        nos domínios <em>resultscale.com.br</em> e <em>www.resultscale.com.br</em>. Contato:
        via administrador da sua instância.
      </p>

      <h2>2. Dados que coletamos</h2>
      <h3 className="mt-4 font-bold">2.1. Dados de conta</h3>
      <ul>
        <li>Endereço de e-mail;</li>
        <li>Nome de exibição (se informado);</li>
        <li>Senha (armazenada de forma criptografada — nunca em texto puro);</li>
        <li>Papel do usuário na instância (user / admin);</li>
        <li>Datas de criação e último acesso.</li>
      </ul>
      <h3 className="mt-4 font-bold">2.2. Dados operacionais inseridos pelo usuário</h3>
      <ul>
        <li>Lançamentos diários (data, investimento em tráfego, leads, agendamentos, comparecimentos, vendas, faturamento);</li>
        <li>Metas mensais;</li>
        <li>Configurações de aparência (cores, rótulos de funil, nome da marca);</li>
        <li>Logotipo enviado pelo usuário (armazenado em bucket privado, com acesso restrito ao próprio usuário via URLs assinadas);</li>
        <li>Preferências e customizações do painel.</li>
      </ul>
      <h3 className="mt-4 font-bold">2.3. Dados de integração com Meta Ads</h3>
      <ul>
        <li>Identificador do usuário Meta;</li>
        <li>Token de acesso emitido pela Meta (long-lived, ~60 dias);</li>
        <li>Lista de contas de anúncios acessíveis ao usuário e conta selecionada;</li>
        <li>Métricas agregadas de campanhas: investimento (spend), leads, data;</li>
        <li>Registro do último sincronismo e eventuais erros retornados pela API.</li>
      </ul>
      <h3 className="mt-4 font-bold">2.4. Dados técnicos</h3>
      <ul>
        <li>Endereço IP, tipo de dispositivo, navegador e sistema operacional;</li>
        <li>Registros de acesso e ações realizadas na Plataforma (logs);</li>
        <li>Cookies e tokens necessários para autenticação e manutenção da sessão.</li>
      </ul>

      <h2>3. Como usamos os dados</h2>
      <ul>
        <li><strong>Prestação do serviço:</strong> autenticar o usuário, exibir dashboards, permitir edição de lançamentos e configurações;</li>
        <li><strong>Integração Meta Ads:</strong> importar métricas automáticas mediante autorização explícita do usuário;</li>
        <li><strong>Segurança:</strong> detectar acessos indevidos, aplicar RLS por usuário, mitigar fraudes;</li>
        <li><strong>Suporte:</strong> responder solicitações e resolver incidentes;</li>
        <li><strong>Melhoria do produto:</strong> analisar uso agregado e anonimizado;</li>
        <li><strong>Cumprimento legal:</strong> atender obrigações regulatórias e ordens de autoridades competentes.</li>
      </ul>

      <h2>4. Bases legais (LGPD)</h2>
      <ul>
        <li><strong>Execução de contrato</strong> (art. 7º, V) — para viabilizar o acesso e as funcionalidades da Plataforma;</li>
        <li><strong>Consentimento</strong> (art. 7º, I) — para a integração com Meta Ads e para comunicações opcionais;</li>
        <li><strong>Legítimo interesse</strong> (art. 7º, IX) — para segurança, prevenção a fraudes e melhoria do serviço;</li>
        <li><strong>Cumprimento de obrigação legal ou regulatória</strong> (art. 7º, II).</li>
      </ul>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Não vendemos dados pessoais. Compartilhamos apenas com operadores estritamente
        necessários para a operação da Plataforma:
      </p>
      <ul>
        <li><strong>Provedor de backend (Supabase):</strong> hospedagem do banco de dados, autenticação, storage de logotipos e execução de funções de servidor;</li>
        <li><strong>Provedor de hospedagem web e CDN:</strong> entrega da aplicação;</li>
        <li><strong>Meta Platforms, Inc. (Facebook / Instagram):</strong> apenas quando o usuário conecta sua conta Meta Ads, para autenticação OAuth e consulta à Marketing API;</li>
        <li><strong>Autoridades públicas:</strong> quando exigido por lei ou ordem judicial.</li>
      </ul>

      <h2>6. Transferência internacional</h2>
      <p>
        Alguns operadores (por exemplo, Meta e provedores de nuvem) podem processar dados
        fora do Brasil. Nesses casos, adotamos salvaguardas contratuais e utilizamos
        fornecedores comprometidos com padrões equivalentes de proteção.
      </p>

      <h2>7. Segurança da informação</h2>
      <ul>
        <li>Autenticação por e-mail e senha, com senhas armazenadas com hash;</li>
        <li>Isolamento por usuário via <em>Row Level Security</em> em todas as tabelas de dados;</li>
        <li>Bucket de logotipos privado, acessível somente pelo próprio usuário via URLs assinadas;</li>
        <li>Tokens de acesso Meta armazenados de forma restrita e usados apenas em funções de servidor autenticadas;</li>
        <li>HTTPS obrigatório em todo o tráfego;</li>
        <li>Políticas de menor privilégio para funções internas e revogação explícita de permissões amplas.</li>
      </ul>

      <h2>8. Retenção</h2>
      <p>
        Mantemos os dados enquanto a conta estiver ativa. Após o encerramento da conta, os
        dados podem ser excluídos em até 90 dias, ressalvadas obrigações legais de guarda
        (por exemplo, logs de acesso por até 6 meses, conforme o Marco Civil da Internet).
      </p>

      <h2>9. Direitos do titular</h2>
      <p>Você tem direito a, nos termos da LGPD:</p>
      <ul>
        <li>Confirmar a existência de tratamento;</li>
        <li>Acessar seus dados;</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
        <li>Portabilidade dos dados;</li>
        <li>Eliminação dos dados tratados com base no consentimento;</li>
        <li>Revogar o consentimento a qualquer tempo — por exemplo, desconectando a integração Meta Ads em "Editar painel &gt; Integrações";</li>
        <li>Informação sobre com quem compartilhamos seus dados;</li>
        <li>Peticionar perante a Autoridade Nacional de Proteção de Dados (ANPD).</li>
      </ul>
      <p>Para exercer esses direitos, entre em contato com o administrador da sua instância.</p>

      <h2>10. Cookies</h2>
      <p>
        Utilizamos cookies estritamente necessários para autenticação e manutenção da
        sessão. Não utilizamos cookies publicitários de terceiros na área autenticada.
      </p>

      <h2>11. Dados de crianças e adolescentes</h2>
      <p>
        A Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente
        dados de menores.
      </p>

      <h2>12. Alterações desta Política</h2>
      <p>
        Podemos atualizar esta Política periodicamente. Alterações relevantes serão
        comunicadas por e-mail ou na Plataforma, com nova data de "Última atualização".
      </p>

      <h2>13. Contato do Encarregado (DPO)</h2>
      <p>
        Para tratar de assuntos relativos a esta Política e à LGPD, entre em contato com o
        administrador da sua instância Result Scale, que atuará como ponto focal para o
        Encarregado pelo Tratamento de Dados Pessoais.
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
          Documento legal
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