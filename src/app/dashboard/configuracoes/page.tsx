import { SettingsForm } from "@/components/features/settings-form";
import { verifySession } from "@/lib/auth";
import { getSettings } from "@/services/settings";

export const instant = false;

export default async function SettingsPage() {
  await verifySession();
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-primary-900 text-2xl font-semibold">Configurações</h1>
        <p className="text-primary-600 text-sm">
          Dados usados no cabeçalho, assinaturas e rodapé das propostas.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
