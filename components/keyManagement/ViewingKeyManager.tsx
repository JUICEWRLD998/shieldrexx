"use client";

import { useMemo, useState } from "react";
import {
  addManyVaultEntries,
  deleteVaultEntry,
  exportVaultEncrypted,
  importVaultEncrypted,
  listVaultEntries,
  markVaultEntryUsed,
  type VaultEntry,
} from "@/lib/viewingKeyVault";
import { formatDate, truncateTxSig } from "@/lib/utils";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { useToast } from "@/components/providers/ToastProvider";

interface Props {
  onUseKey: (keyJson: string) => void;
}

function extractTxSignature(keyJson: string): string {
  try {
    const parsed = JSON.parse(keyJson) as {
      batchEntries?: Array<{ txSignature?: string }>;
    };
    const entries = parsed.batchEntries ?? [];
    if (entries.length === 0) return "";
    return entries[entries.length - 1].txSignature ?? "";
  } catch {
    return "";
  }
}

function isExpired(entry: VaultEntry): boolean {
  return typeof entry.expiresAt === "number" && Date.now() > entry.expiresAt;
}

export function ViewingKeyManager({ onUseKey }: Props) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<VaultEntry[]>(() =>
    typeof window === "undefined" ? [] : listVaultEntries()
  );
  const [bulkInput, setBulkInput] = useState("");
  const [labelPrefix, setLabelPrefix] = useState("Audit Batch");
  const [expiryDays, setExpiryDays] = useState("0");
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [encryptedPayload, setEncryptedPayload] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => entries.filter((entry) => !isExpired(entry)).length,
    [entries]
  );

  function refresh() {
    setEntries(listVaultEntries());
  }

  function handleBulkImport() {
    const lines = bulkInput
      .split(/\n\s*\n|\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      toast({ type: "warning", title: "No viewing keys found", message: "Paste one or more key JSON blobs." });
      return;
    }

    const days = Number(expiryDays);
    const expiresAt = Number.isFinite(days) && days > 0 ? Date.now() + days * 24 * 60 * 60 * 1000 : null;

    const toSave = lines.map((key, index) => ({
      label: `${labelPrefix || "Viewing Key"} #${index + 1}`,
      keyJson: key,
      expiresAt,
    }));

    try {
      const inserted = addManyVaultEntries(toSave);
      refresh();
      setBulkInput("");
      toast({
        type: "success",
        title: "Viewing keys imported",
        message: `${inserted.length} key${inserted.length !== 1 ? "s" : ""} saved to vault`,
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Failed to import keys",
        message: err instanceof Error ? err.message : "Unknown import error",
      });
    }
  }

  async function handleExportEncrypted() {
    try {
      const payload = await exportVaultEncrypted(encryptionPassword, entries);
      setEncryptedPayload(payload);
      toast({ type: "success", title: "Encrypted vault ready", message: "Copy or download it safely." });
    } catch (err) {
      toast({
        type: "error",
        title: "Encrypted export failed",
        message: err instanceof Error ? err.message : "Unknown encryption error",
      });
    }
  }

  function downloadEncrypted() {
    if (!encryptedPayload) return;
    const blob = new Blob([encryptedPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shieldrexx-key-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportEncrypted() {
    try {
      const inserted = await importVaultEncrypted(encryptedPayload, decryptPassword);
      refresh();
      toast({
        type: "success",
        title: "Encrypted vault imported",
        message: `${inserted.length} key${inserted.length !== 1 ? "s" : ""} added`,
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Encrypted import failed",
        message: err instanceof Error ? err.message : "Unknown decrypt error",
      });
    }
  }

  function handleDelete(id: string) {
    deleteVaultEntry(id);
    refresh();
    toast({ type: "info", title: "Key removed" });
  }

  function handleUse(entry: VaultEntry) {
    markVaultEntryUsed(entry.id);
    onUseKey(entry.keyJson);
    refresh();
  }

  return (
    <div className="card rounded-2xl p-6 flex flex-col gap-6">
      <div>
        <p className="step-num uppercase tracking-widest mb-1">Viewing Key Manager</p>
        <h2 className="text-xl font-bold text-white">Vault & Operations</h2>
        <p className="text-slate-400 text-sm mt-1">
          Import multiple keys, set optional expiry, export encrypted vault backups, and decrypt directly to audit.
        </p>
      </div>

      <InfoBanner
        role="note"
        type="warning"
        title="Security note"
        description="Encrypted exports use AES-GCM + PBKDF2 in your browser. Keep your password safe; there is no recovery if lost."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-200">Multi-key import</p>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={8}
            placeholder='Paste one or more JSON viewing keys (one per line).'
            className="w-full rounded-xl p-3 text-xs font-mono outline-none"
            style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={labelPrefix}
              onChange={(e) => setLabelPrefix(e.target.value)}
              placeholder="Label prefix"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
            />
            <input
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              placeholder="Expiry days (0 = never)"
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
            />
          </div>
          <button onClick={handleBulkImport} className="btn-primary w-fit px-4 py-2 text-sm">
            Import to Vault
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-slate-200">Encrypted backup</p>
          <input
            type="password"
            value={encryptionPassword}
            onChange={(e) => setEncryptionPassword(e.target.value)}
            placeholder="Export password (min 8 chars)"
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void handleExportEncrypted()} className="btn-secondary px-3 py-2 text-xs">
              Generate Encrypted Export
            </button>
            <button onClick={downloadEncrypted} disabled={!encryptedPayload} className="btn-secondary px-3 py-2 text-xs disabled:opacity-40">
              Download Vault JSON
            </button>
          </div>

          <textarea
            value={encryptedPayload}
            onChange={(e) => setEncryptedPayload(e.target.value)}
            rows={8}
            placeholder="Encrypted payload JSON"
            className="w-full rounded-xl p-3 text-xs font-mono outline-none"
            style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
          />
          <input
            type="password"
            value={decryptPassword}
            onChange={(e) => setDecryptPassword(e.target.value)}
            placeholder="Password for encrypted import"
            className="rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: "rgba(13,18,48,0.82)", border: "1px solid rgba(124,58,237,0.25)" }}
          />
          <button onClick={() => void handleImportEncrypted()} className="btn-secondary w-fit px-3 py-2 text-xs">
            Import Encrypted Vault
          </button>
        </div>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: "rgba(124,58,237,0.22)", background: "rgba(13,18,48,0.5)" }}>
        <p className="text-xs text-slate-500">
          Vault status: {entries.length} total key{entries.length !== 1 ? "s" : ""} · {activeCount} active · {entries.length - activeCount} expired
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {entries.length === 0 && (
          <p className="text-sm text-slate-500">No keys in vault yet.</p>
        )}

        {entries.map((entry) => {
          const expired = isExpired(entry);
          const tx = extractTxSignature(entry.keyJson);
          const revealed = revealedId === entry.id;

          return (
            <div key={entry.id} className="rounded-xl border p-3 flex flex-col gap-2" style={{ borderColor: "rgba(124,58,237,0.22)", background: "rgba(13,18,48,0.55)" }}>
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">{entry.label}</p>
                  <p className="text-xs text-slate-500">
                    Added {formatDate(entry.createdAt)}
                    {entry.expiresAt ? ` · Expires ${formatDate(entry.expiresAt)}` : " · Never expires"}
                    {entry.lastUsedAt ? ` · Last used ${formatDate(entry.lastUsedAt)}` : ""}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: expired ? "rgba(248,113,113,0.12)" : "rgba(74,222,128,0.12)", color: expired ? "#f87171" : "#4ade80" }}>
                    {expired ? "Expired" : "Active"}
                  </span>
                  {tx && (
                    <span className="text-xs text-slate-400 font-mono">Tx {truncateTxSig(tx)}</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg px-3 py-2 text-xs font-mono break-all" style={{ background: "rgba(13,18,48,0.7)", border: "1px solid rgba(124,58,237,0.2)", color: "#94a3b8" }}>
                {revealed ? entry.keyJson : `${entry.keyJson.slice(0, 150)}…`}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setRevealedId(revealed ? null : entry.id)} className="btn-secondary px-2.5 py-1 text-xs">
                  {revealed ? "Hide" : "Reveal"}
                </button>
                <button
                  onClick={() => handleUse(entry)}
                  disabled={expired}
                  className="btn-primary px-2.5 py-1 text-xs disabled:opacity-40"
                >
                  Use in Audit
                </button>
                <button onClick={() => handleDelete(entry.id)} className="px-2.5 py-1 text-xs rounded-lg" style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
