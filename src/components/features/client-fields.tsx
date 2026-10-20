import { Field, inputClass } from "@/components/ui/field";
import { formatDocument, formatPhone } from "@/lib/format";
import type { ClientInput } from "@/lib/validations/client";

type ClientFieldsProps = {
  form: ClientInput;
  errors: Record<string, string[]>;
  onChange: <K extends keyof ClientInput>(key: K, value: ClientInput[K]) => void;
};

export function ClientFields({ form, errors, onChange }: ClientFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Código do cliente" name="client-clientCode" errors={errors.clientCode}>
        <input
          id="client-clientCode"
          type="text"
          value={form.clientCode}
          onChange={(e) => onChange("clientCode", e.target.value.toUpperCase())}
          placeholder="CL0000.0000"
          className={inputClass}
          readOnly
        />
        <p className="text-primary-700 text-xs">
          Deixe em branco para gerar um código automaticamente (ex: CL1909.0180).
        </p>
      </Field>

      <Field label="Nome / Razão Social" name="client-name" errors={errors.name}>
        <input
          id="client-name"
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="CNPJ / CPF" name="client-document" errors={errors.document}>
        <input
          id="client-document"
          type="text"
          inputMode="numeric"
          value={formatDocument(form.document)}
          onChange={(e) => onChange("document", formatDocument(e.target.value))}
          placeholder="00.000.000/0000-00"
          className={inputClass}
        />
      </Field>

      <Field label="Telefone" name="client-phone" errors={errors.phone}>
        <input
          id="client-phone"
          type="tel"
          inputMode="tel"
          value={formatPhone(form.phone)}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="(00) 00000-0000"
          className={inputClass}
        />
      </Field>

      <Field label="E-mail" name="client-email" errors={errors.email}>
        <input
          id="client-email"
          type="email"
          inputMode="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="contato@empresa.com"
          className={inputClass}
        />
      </Field>

      <Field label="Endereço completo" name="client-address" errors={errors.address}>
        <input
          id="client-address"
          type="text"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Contato no cliente" name="client-contact" errors={errors.contact}>
        <input
          id="client-contact"
          type="text"
          value={form.contact}
          onChange={(e) => onChange("contact", e.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
  );
}
