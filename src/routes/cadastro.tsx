import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { createCheckoutSession } from "@/lib/stripe.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;

const cadastroSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof cadastroSchema>;

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro — Result Scale" },
      { name: "description", content: "Crie sua conta no Result Scale" },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const createSession = useServerFn(createCheckoutSession);

  const form = useForm<FormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  const { isValid } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      toast.error("Confirme que você não é um robô");
      return;
    }
    setBusy(true);
    setEmailError("");
    try {
      const result = await createSession({ data: { ...values, recaptchaToken: token } });
      window.location.href = result.url;
    } catch (err) {
      const msg = (err as Error).message;
      if (msg === "E-mail já cadastrado") {
        setEmailError("E-mail já cadastrado");
        form.setError("email", { message: "E-mail já cadastrado" });
      } else {
        toast.error(msg);
      }
      recaptchaRef.current?.reset();
      setBusy(false);
    }
  });

  return (
    <div className="min-h-screen bg-white text-[#1A1206] selection:bg-[#FF6A1A] selection:text-white">
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
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1A1206]/10 bg-[#FFF7EE] px-3.5 py-1.5 text-xs font-semibold text-[#1A1206]/70 transition hover:border-[#FF6A1A]/40 hover:text-[#FF6A1A]"
          >
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-20 sm:px-8">
        <Card className="border-[#1A1206]/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-black">Criar conta</CardTitle>
            <p className="mt-1 text-sm text-[#1A1206]/60">
              Preencha os dados e prossiga para o pagamento
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1206]/40" />
                  <Input
                    id="name"
                    type="text"
                    className="pl-10"
                    placeholder="Seu nome"
                    {...form.register("name")}
                  />
                </div>
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1206]/40" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="seu@email.com"
                    {...form.register("email")}
                    onChange={(e) => {
                      form.register("email").onChange(e);
                      if (emailError) setEmailError("");
                    }}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1206]/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="Mínimo 8 caracteres"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1206]/40 hover:text-[#1A1206]/70"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} theme="light" />
              </div>

              <Button
                type="submit"
                disabled={busy || !isValid}
                className="w-full bg-[#FF6A1A] hover:bg-[#FF7E33] text-white disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                )}
                Prosseguir para pagamento
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-[#1A1206]/50">
              Ao prosseguir você concorda com nossos{" "}
              <Link to="/termos" className="text-[#FF6A1A] underline">Termos de Uso</Link>{" "}
              e{" "}
              <Link to="/politicadeprivacidade" className="text-[#FF6A1A] underline">Política de Privacidade</Link>.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
