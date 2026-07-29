import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Result Scale" },
      {
        name: "description",
        content:
          "Termos de Uso da plataforma Result Scale: condições para uso do painel de marketing e vendas, integrações e responsabilidades.",
      },
      { property: "og:title", content: "Termos de Uso — Result Scale" },
      {
        property: "og:description",
        content: "Condições de uso da plataforma Result Scale.",
      },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <LegalShell title="Termos de Uso" updated="14 de julho de 2026">
      <p>
        Estes Termos de Uso ("Termos") regulam o acesso e a utilização da plataforma
        <strong> Result Scale</strong> ("Plataforma", "nós"), disponibilizada nos domínios
        <em> resultscale.com.br</em> e <em>www.resultscale.com.br</em>. Ao criar uma conta,
        efetuar login ou utilizar qualquer funcionalidade da Plataforma, você ("Usuário")
        declara ter lido, compreendido e concordado integralmente com estes Termos e com a
        nossa <Link to="/politicadeprivacidade" className="text-[#FF6A1A] underline">Política de Privacidade</Link>.
      </p>

      <h2>1. Objeto da Plataforma</h2>
      <p>
        A Result Scale é uma aplicação SaaS de acompanhamento de marketing e vendas que
        permite ao Usuário registrar lançamentos diários (investimento em tráfego, leads,
        agendamentos, comparecimentos, vendas e faturamento), acompanhar métricas de funil,
        CPL, CAC e ROAS, definir metas mensais, personalizar a aparência do painel (cores,
        logotipo e rótulos de funil) e conectar contas de anúncios da Meta Ads (Facebook /
        Instagram) para importação automática de dados de gasto e leads.
      </p>

      <h2>2. Cadastro e Acesso</h2>
      <ul>
        <li>O cadastro de novos usuários é feito exclusivamente por um administrador da Plataforma. Não há auto-registro público.</li>
        <li>O Usuário é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta.</li>
        <li>Contas com papel "admin" podem criar, remover e alterar o papel de outros usuários dentro da mesma instância.</li>
        <li>Você concorda em fornecer informações verdadeiras, precisas e atualizadas no momento do cadastro.</li>
      </ul>

      <h2>3. Planos e Pagamentos</h2>
      <p>
        Eventuais planos, mensalidades e condições comerciais são acordados diretamente
        entre o Usuário e a Result Scale por meio de contrato específico ou canal de venda.
        O não pagamento pode resultar em suspensão ou cancelamento do acesso.
      </p>

      <h2>4. Integração com Meta Ads</h2>
      <p>
        Ao conectar sua conta Meta Ads (Facebook / Instagram), você autoriza a Plataforma a:
      </p>
      <ul>
        <li>Redirecionar você ao fluxo oficial de OAuth da Meta;</li>
        <li>Armazenar de forma segura o token de acesso emitido pela Meta em seu nome;</li>
        <li>Listar as contas de anúncios às quais você tem acesso e permitir que você selecione qual usar;</li>
        <li>Consultar periodicamente a Marketing API para importar métricas de investimento (spend) e leads e gravá-las como lançamentos diários no seu painel.</li>
      </ul>
      <p>
        A Result Scale é um produto independente e não é afiliado, patrocinado, endossado
        ou administrado pela Meta Platforms, Inc. O uso da Meta Ads também está sujeito aos
        termos e políticas da Meta. Você pode desconectar sua conta a qualquer momento na
        aba "Editar painel &gt; Integrações", o que revoga o armazenamento do token.
      </p>

      <h2>5. Dados do Usuário</h2>
      <p>
        Todos os dados de lançamentos, metas, configurações de aparência, logotipos e
        conexões pertencem ao Usuário que os criou. A Plataforma aplica isolamento por
        conta (Row Level Security) para garantir que um Usuário não acesse dados de outro.
        O tratamento de dados pessoais é descrito na
        {" "}<Link to="/politicadeprivacidade" className="text-[#FF6A1A] underline">Política de Privacidade</Link>.
      </p>

      <h2>6. Uso Aceitável</h2>
      <p>É vedado ao Usuário:</p>
      <ul>
        <li>Utilizar a Plataforma para fins ilícitos, fraudulentos ou que violem direitos de terceiros;</li>
        <li>Tentar burlar mecanismos de segurança, autenticação ou controle de papéis;</li>
        <li>Realizar engenharia reversa, copiar, revender ou redistribuir a Plataforma sem autorização;</li>
        <li>Inserir dados de contas de anúncios que não lhe pertençam ou para as quais não tenha autorização;</li>
        <li>Sobrecarregar a Plataforma com requisições automatizadas fora dos limites acordados.</li>
      </ul>

      <h2>7. Propriedade Intelectual</h2>
      <p>
        A marca, o design, o código-fonte, os textos e os elementos gráficos da Result Scale
        são de titularidade exclusiva da Result Scale. Logotipos enviados pelo Usuário
        permanecem de sua propriedade e são utilizados apenas para exibição em seu próprio
        painel.
      </p>

      <h2>8. Disponibilidade e Suporte</h2>
      <p>
        Nos empenhamos em manter a Plataforma disponível 24/7, mas não garantimos operação
        ininterrupta ou livre de erros. Poderão ocorrer janelas de manutenção, atualizações
        e indisponibilidades causadas por terceiros (provedores de nuvem, Meta Ads,
        provedores de e-mail, entre outros).
      </p>

      <h2>9. Limitação de Responsabilidade</h2>
      <p>
        A Result Scale não se responsabiliza por decisões comerciais tomadas com base nas
        métricas exibidas, por indisponibilidade de APIs de terceiros, por perda de dados
        decorrente de uso indevido da conta pelo Usuário, nem por danos indiretos, lucros
        cessantes ou perdas de oportunidade. As métricas de Meta Ads dependem da
        disponibilidade e precisão da própria Marketing API da Meta.
      </p>

      <h2>10. Cancelamento e Encerramento</h2>
      <p>
        O Usuário pode solicitar o encerramento de sua conta a qualquer momento. Um
        administrador pode remover contas dentro da instância. Após o encerramento, os
        dados poderão ser excluídos conforme prazos previstos na Política de Privacidade e
        obrigações legais.
      </p>

      <h2>11. Alterações destes Termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. Alterações relevantes serão
        comunicadas por e-mail ou dentro da própria Plataforma. O uso continuado após a
        notificação implica aceitação da nova versão.
      </p>

      <h2>12. Legislação e Foro</h2>
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito
        o foro do domicílio do titular da Result Scale para dirimir quaisquer controvérsias,
        renunciando as partes a qualquer outro, por mais privilegiado que seja.
      </p>

      <h2>13. Contato</h2>
      <p>
        Dúvidas sobre estes Termos podem ser encaminhadas para o e-mail de contato do
        administrador da sua instância Result Scale.
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