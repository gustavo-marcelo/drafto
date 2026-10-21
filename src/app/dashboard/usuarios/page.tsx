import { UsersManager, type UserRow } from "@/components/features/users-manager";
import { verifySession } from "@/lib/auth";
import { listUsers } from "@/services/users";

export const instant = false;

export default async function UsersPage() {
  await verifySession();
  const users = await listUsers();

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    createdAt: user.createdAt,
    proposalsCount: user._count.proposals,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-primary-900 text-2xl font-semibold">Usuários</h1>
        <p className="text-primary-600 text-sm">
          Cadastre novos usuários com acesso ao sistema. O cadastro público está desativado.
        </p>
      </div>

      <UsersManager users={rows} />
    </div>
  );
}
