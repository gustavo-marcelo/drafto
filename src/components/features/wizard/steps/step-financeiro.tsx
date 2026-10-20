"use client";

import { TextPresetTextarea } from "@/components/features/text-preset-textarea";
import { Field, inputClass } from "@/components/ui/field";
import { formatCurrency } from "@/lib/format";
import type { WizardData, WizardPayment } from "@/lib/validations/wizard";

type StepFinanceiroProps = {
  data: WizardData;
  errors: Record<string, string[]>;
  onChange: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
};

export function StepFinanceiro({ data, errors, onChange }: StepFinanceiroProps) {
  const paymentsTotal = data.payments.reduce((sum, payment) => {
    const amount = Number(payment.amount);
    return sum + (Number.isNaN(amount) ? 0 : amount);
  }, 0);

  function updatePayment(index: number, patch: Partial<WizardPayment>) {
    onChange(
      "payments",
      data.payments.map((payment, i) => (i === index ? { ...payment, ...patch } : payment)),
    );
  }

  function addPayment() {
    onChange("payments", [...data.payments, { dueDate: "", amount: 0 }]);
  }

  function removePayment(index: number) {
    onChange(
      "payments",
      data.payments.filter((_, i) => i !== index),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-primary-900 text-lg font-semibold">Valores e Condições Comerciais</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Valor total (R$)" name="totalAmount" errors={errors.totalAmount}>
          <input
            id="totalAmount"
            type="number"
            min={0}
            step="0.01"
            value={data.totalAmount ?? ""}
            onChange={(e) =>
              onChange("totalAmount", e.target.value === "" ? undefined : Number(e.target.value))
            }
            placeholder="0,00"
            className={inputClass}
          />
        </Field>

        <Field label="Forma de pagamento" name="paymentMethod" errors={errors.paymentMethod}>
          <input
            id="paymentMethod"
            type="text"
            value={data.paymentMethod}
            onChange={(e) => onChange("paymentMethod", e.target.value)}
            placeholder="Ex: Boleto bancário"
            className={inputClass}
          />
        </Field>

        <Field label="Proposta válida até" name="validUntil" errors={errors.validUntil}>
          <input
            id="validUntil"
            type="date"
            value={data.validUntil}
            onChange={(e) => onChange("validUntil", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <TextPresetTextarea
        category="includedCosts"
        label="Custos incluídos"
        name="includedCosts"
        rows={2}
        value={data.includedCosts}
        onChange={(value) => onChange("includedCosts", value)}
        placeholder="Ex: Impostos, frete, montagem e desmontagem"
        errors={errors.includedCosts}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-primary-800 text-sm font-medium">Cronograma de parcelamento</h3>
          <button
            type="button"
            onClick={addPayment}
            className="border-primary-200 text-primary-800 hover:bg-primary-50 rounded-md border px-3 py-1.5 text-sm transition-colors"
          >
            + Adicionar parcela
          </button>
        </div>

        {errors.payments && errors.payments.length > 0 && (
          <p className="text-sm text-red-600">{errors.payments.join(" ")}</p>
        )}

        {data.payments.length === 0 ? (
          <p className="text-primary-700 text-sm">Nenhuma parcela adicionada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.payments.map((payment, index) => (
              <div
                key={index}
                className="border-primary-100 flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-end"
              >
                <div className="flex flex-1 flex-col gap-1">
                  <label
                    className="text-primary-800 text-sm font-medium"
                    htmlFor={`payment-${index}-dueDate`}
                  >
                    Vencimento
                  </label>
                  <input
                    id={`payment-${index}-dueDate`}
                    type="date"
                    value={payment.dueDate}
                    onChange={(e) => updatePayment(index, { dueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <label
                    className="text-primary-800 text-sm font-medium"
                    htmlFor={`payment-${index}-amount`}
                  >
                    Valor (R$)
                  </label>
                  <input
                    id={`payment-${index}-amount`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, { amount: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePayment(index)}
                  className="border-primary-200 rounded-md border px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
            ))}
            <div className="text-primary-800 flex justify-between text-sm">
              <span>Soma das parcelas</span>
              <span className="font-medium">{formatCurrency(paymentsTotal)}</span>
            </div>
            {data.totalAmount !== undefined &&
              Math.abs(paymentsTotal - data.totalAmount) > 0.009 && (
                <p className="text-sm text-red-600">
                  A soma das parcelas ({formatCurrency(paymentsTotal)}) difere do valor total (
                  {formatCurrency(data.totalAmount)}).
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
