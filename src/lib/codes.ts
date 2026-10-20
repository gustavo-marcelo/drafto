export type CodePrefix = "CL" | "PR";

function randomBlock(): string {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
}

export function generateCode(prefix: CodePrefix): string {
  return `${prefix}${randomBlock()}.${randomBlock()}`;
}

const SHARE_ALPHABET = "abcdefghijkmnopqrstuvwxyz23456789";

export function generateShareId(length = 16): string {
  let id = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) {
    id += SHARE_ALPHABET[bytes[i] % SHARE_ALPHABET.length];
  }
  return id;
}
