import type { BatchResult } from "@/types";

const PREFIX = "shieldpay_vk_";

export function saveViewingKey(batchId: string, result: BatchResult): void {
  localStorage.setItem(PREFIX + batchId, JSON.stringify(result));
}

export function getViewingKey(batchId: string): BatchResult | null {
  const raw = localStorage.getItem(PREFIX + batchId);
  return raw ? (JSON.parse(raw) as BatchResult) : null;
}

export function listAllBatches(): BatchResult[] {
  const results: BatchResult[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      const raw = localStorage.getItem(key);
      if (raw) results.push(JSON.parse(raw) as BatchResult);
    }
  }
  return results.sort((a, b) => b.timestamp - a.timestamp);
}

export function deleteViewingKey(batchId: string): void {
  localStorage.removeItem(PREFIX + batchId);
}
