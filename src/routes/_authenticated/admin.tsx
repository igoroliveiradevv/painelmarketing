import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createSubUser, deleteSubUser, listUsers, setUserRole } from "@/lib/admin.functions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!(roles ?? []).some((r) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

type UserRow = { id: string; email: string; full_name: string | null; created_at: string; roles: string[] };

function AdminPage() {
  const { session } = useAppData();
  const list = useServerFn(listUsers);
  const create = useServerFn(createSubUser);
  const del = useServerFn(deleteSubUser);
  const setRole = useServerFn(setUserRole);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  const reload = async () => {
    try { setUsers(await list({}) as UserRow[]); }
    catch (e) { toast.error((e as Error).message); }
  };
  useEffect(() => { reload(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { email: form.email, password: form.password, fullName: form.fullName || undefined } });
      toast.success("Usuário criado");
      setForm({ email: "", password: "", fullName: "" });
      await reload();
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (userId: string) => {
    try {
      await del({ data: { userId } });
      toast.success("Removido");
      await reload();
    } catch (err) { toast.error((err as Error).message); }
  };

  const changeRole = async (userId: string, role: "user" | "admin") => {
    try {
      await setRole({ data: { userId, role } });
      toast.success("Papel atualizado");
      await reload();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Administração</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Sub-acessos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cada usuário vê e edita apenas os próprios dados.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Novo sub-acesso</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha inicial</Label>
              <Input type="text" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" disabled={busy}>{busy ? "Criando…" : "Criar usuário"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Usuários ({users.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.id === session?.userId ? (
                      <span className="rounded px-2 py-0.5 text-xs bg-primary/10 text-primary">
                        {u.roles.includes("admin") ? "admin" : "user"}
                      </span>
                    ) : (
                      <Select
                        value={u.roles.includes("admin") ? "admin" : "user"}
                        onValueChange={(v) => changeRole(u.id, v as "user" | "admin")}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    {u.id !== session?.userId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Todos os dados de <b>{u.email}</b> serão excluídos permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(u.id)}>Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}