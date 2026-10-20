export type PackagePayload = {
  recursos?: string[];
  equipamentos?: {
    name: string;
    quantity?: number;
    specs?: string;
    description?: string;
  }[];
};

export function parsePackagePayload(payload: unknown): PackagePayload {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return payload as PackagePayload;
}
