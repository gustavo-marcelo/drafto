import { Field, inputClass } from "@/components/ui/field";
import { formatCep, formatDocument, formatPhone } from "@/lib/format";
import type { ClientInput } from "@/lib/validations/client";

type ClientFieldsProps = {
  form: ClientInput;
  errors: Record<string, string[]>;
  onChange: <K extends keyof ClientInput>(key: K, value: ClientInput[K]) => void;
};

export function ClientFields({ form, errors, onChange }: ClientFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-primary-100 flex max-w-2xl flex-col gap-4 rounded-lg border bg-white p-6">
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
              onChange={(e) => onChange("phone", formatPhone(e.target.value))}
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

          <Field label="Contato no cliente" name="client-contact" errors={errors.contact}>
            <input
              id="client-contact"
              type="text"
              value={form.contact}
              onChange={(e) => onChange("contact", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="CEP" name="client-zipCode" errors={errors.zipCode}>
            <input
              id="client-zipCode"
              type="text"
              inputMode="numeric"
              value={formatCep(form.zipCode)}
              onChange={(e) => onChange("zipCode", formatCep(e.target.value))}
              placeholder="00000-000"
              className={inputClass}
            />
          </Field>

          <Field label="Logradouro" name="client-street" errors={errors.street}>
            <input
              id="client-street"
              type="text"
              value={form.street}
              onChange={(e) => onChange("street", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Número" name="client-number" errors={errors.number}>
            <input
              id="client-number"
              type="text"
              value={form.number}
              onChange={(e) => onChange("number", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Complemento" name="client-complement" errors={errors.complement}>
            <input
              id="client-complement"
              type="text"
              value={form.complement}
              onChange={(e) => onChange("complement", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Cidade" name="client-city" errors={errors.city}>
            <input
              id="client-city"
              type="text"
              value={form.city}
              onChange={(e) => onChange("city", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Estado (UF)" name="client-state" errors={errors.state}>
            <input
              id="client-state"
              type="text"
              maxLength={2}
              value={form.state}
              onChange={(e) => onChange("state", e.target.value.toUpperCase())}
              placeholder="DF"
              className={inputClass}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
