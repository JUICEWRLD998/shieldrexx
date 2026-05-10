import { generateId } from "@/lib/utils";

const VAULT_KEY = "shieldrexx_viewing_key_vault_v1";

export interface VaultEntry {
  id: string;
  label: string;
  keyJson: string;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
}

interface EncryptedVaultPayload {
  version: 1;
  kdf: "PBKDF2";
  cipher: "AES-GCM";
  iterations: number;
  saltB64: string;
  ivB64: string;
  ciphertextB64: string;
  createdAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readVault(): VaultEntry[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as VaultEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeVault(entries: VaultEntry[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
}

export function listVaultEntries(): VaultEntry[] {
  return readVault().sort((a, b) => b.createdAt - a.createdAt);
}

export function addVaultEntry(input: {
  label?: string;
  keyJson: string;
  expiresAt?: number | null;
}): VaultEntry {
  const next: VaultEntry = {
    id: generateId(),
    label: input.label?.trim() || `Viewing Key ${new Date().toLocaleString()}`,
    keyJson: input.keyJson.trim(),
    createdAt: Date.now(),
    expiresAt: input.expiresAt ?? null,
    lastUsedAt: null,
  };
  const all = readVault();
  all.push(next);
  writeVault(all);
  return next;
}

export function addManyVaultEntries(inputs: Array<{ label?: string; keyJson: string; expiresAt?: number | null }>): VaultEntry[] {
  const existing = readVault();
  const toAdd = inputs
    .map((input) => ({
      id: generateId(),
      label: input.label?.trim() || `Viewing Key ${new Date().toLocaleString()}`,
      keyJson: input.keyJson.trim(),
      createdAt: Date.now(),
      expiresAt: input.expiresAt ?? null,
      lastUsedAt: null,
    }))
    .filter((entry) => entry.keyJson.length > 0);

  writeVault([...existing, ...toAdd]);
  return toAdd;
}

export function deleteVaultEntry(id: string): void {
  writeVault(readVault().filter((entry) => entry.id !== id));
}

export function updateVaultEntryLabel(id: string, label: string): void {
  const next = readVault().map((entry) =>
    entry.id === id ? { ...entry, label: label.trim() || entry.label } : entry
  );
  writeVault(next);
}

export function updateVaultEntryExpiry(id: string, expiresAt: number | null): void {
  const next = readVault().map((entry) =>
    entry.id === id ? { ...entry, expiresAt } : entry
  );
  writeVault(next);
}

export function markVaultEntryUsed(id: string): void {
  const next = readVault().map((entry) =>
    entry.id === id ? { ...entry, lastUsedAt: Date.now() } : entry
  );
  writeVault(next);
}

function toB64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    arr[i] = binary.charCodeAt(i);
  }
  return arr;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    material,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function exportVaultEncrypted(password: string, entries?: VaultEntry[]): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API is unavailable in this browser.");
  }
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const payloadEntries = entries ?? listVaultEntries();
  const plaintext = new TextEncoder().encode(JSON.stringify(payloadEntries));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 210000;
  const key = await deriveKey(password, salt, iterations);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    plaintext
  );

  const out: EncryptedVaultPayload = {
    version: 1,
    kdf: "PBKDF2",
    cipher: "AES-GCM",
    iterations,
    saltB64: toB64(salt),
    ivB64: toB64(iv),
    ciphertextB64: toB64(new Uint8Array(cipherBuffer)),
    createdAt: Date.now(),
  };

  return JSON.stringify(out, null, 2);
}

export async function importVaultEncrypted(payloadJson: string, password: string): Promise<VaultEntry[]> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Web Crypto API is unavailable in this browser.");
  }
  if (!password) {
    throw new Error("Password is required.");
  }

  let payload: EncryptedVaultPayload;
  try {
    payload = JSON.parse(payloadJson) as EncryptedVaultPayload;
  } catch {
    throw new Error("Encrypted payload is not valid JSON.");
  }

  if (
    payload.version !== 1 ||
    payload.kdf !== "PBKDF2" ||
    payload.cipher !== "AES-GCM" ||
    !payload.saltB64 ||
    !payload.ivB64 ||
    !payload.ciphertextB64
  ) {
    throw new Error("Unsupported encrypted payload format.");
  }

  const salt = fromB64(payload.saltB64);
  const iv = fromB64(payload.ivB64);
  const ciphertext = fromB64(payload.ciphertextB64);

  const key = await deriveKey(password, salt, payload.iterations);

  let plainBuffer: ArrayBuffer;
  try {
    plainBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      ciphertext
    );
  } catch {
    throw new Error("Failed to decrypt payload. Check your password.");
  }

  const decoded = new TextDecoder().decode(plainBuffer);
  let imported: VaultEntry[];
  try {
    imported = JSON.parse(decoded) as VaultEntry[];
  } catch {
    throw new Error("Decrypted payload is invalid.");
  }

  if (!Array.isArray(imported)) {
    throw new Error("Decrypted payload does not contain key entries.");
  }

  const normalized = imported
    .filter((entry) => typeof entry?.keyJson === "string" && entry.keyJson.trim().length > 0)
    .map((entry) => ({
      id: generateId(),
      label: entry.label || `Imported Key ${new Date().toLocaleString()}`,
      keyJson: entry.keyJson.trim(),
      createdAt: Date.now(),
      expiresAt: entry.expiresAt ?? null,
      lastUsedAt: null,
    }));

  if (normalized.length === 0) {
    throw new Error("No valid keys found in decrypted payload.");
  }

  const existing = readVault();
  writeVault([...existing, ...normalized]);
  return normalized;
}
