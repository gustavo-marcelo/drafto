import type { ReactNode } from "react";

export const inputClass =
  "rounded-md border border-primary-200 px-3 py-2 outline-none focus:border-primary-500";

export function Field({
  label,
  name,
  children,
  errors,
}: {
  label: string;
  name: string;
  children: ReactNode;
  errors?: string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-primary-800 text-sm font-medium">
        {label}
      </label>
      {children}
      {errors && errors.length > 0 && <p className="text-sm text-red-600">{errors.join(" ")}</p>}
    </div>
  );
}
