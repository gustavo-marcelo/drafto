"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { UserForm } from "@/components/features/user-form";
import { formatDate, formatPhone } from "@/lib/format";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt: Date;
  proposalsCount: number;
};

export function UsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleDone(email: string) {
    setEditingId(null);
    toast.success(`Usuário ${email} atualizado.`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {editingId ? (
        <UserForm
          key={editingId}
          userId={editingId}
          initialData={(() => {
            const user = users.find((item) => item.id === editingId);
            return user
              ? { name: user.name ?? "", email: user.email, phone: user.phone ?? "" }
              : undefined;
          })()}
          onDone={handleDone}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <UserForm key="new" />
      )}

      <div className="border-primary-100 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-primary-100 bg-primary-50/60 text-primary-700 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Propostas</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-primary-50 border-b last:border-0">
                <td className="text-primary-900 px-4 py-3 font-medium">{user.name ?? "—"}</td>
                <td className="text-primary-700 px-4 py-3">{user.email}</td>
                <td className="text-primary-700 px-4 py-3">
                  {user.phone ? formatPhone(user.phone) : "—"}
                </td>
                <td className="text-primary-700 px-4 py-3">{user.proposalsCount}</td>
                <td className="text-primary-700 px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(user.id)}
                      className="text-primary-700 hover:bg-primary-50 rounded-md px-2 py-1 text-sm transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
