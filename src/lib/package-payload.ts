export type PackagePayload = {
  recursos?: string[];
  infraestrutura?: string[];
};

export function parsePackagePayload(payload: unknown): PackagePayload {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return payload as PackagePayload;
}
