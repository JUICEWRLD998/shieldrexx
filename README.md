# ShieldPay

> Private Payroll & Batch Disbursement on Solana — Built with Cloak SDK

---

## What is ShieldPay?

ShieldPay is a minimal, high-impact web application that allows DAO treasurers and startup founders to execute private batch payroll disbursements using Cloak's privacy layer on Solana. Contributors receive USDC/USDT without any on-chain observer knowing who received what or how much. The treasurer retains a viewing key for audit and compliance.

**Without Cloak, this product cannot exist.** On a transparent chain, every contributor can see every other contributor's salary. ShieldPay makes on-chain payroll actually viable for real organizations.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Fast setup, SSR-ready, great DX |
| Styling | Tailwind CSS + shadcn/ui | Clean, professional UI with minimal effort |
| Wallet | `@solana/wallet-adapter-react` | Standard Solana wallet integration |
| Privacy SDK | `@cloak-labs/cloak-sdk` | All shielded TX logic — no custom crypto |
| CSV Parsing | `papaparse` | Lightweight, browser-safe CSV parser |
| Token | USDC on Solana devnet | Realistic demo, no real funds |
| State | React Context + `useState` | Simple — no Redux needed |
| Storage | `localStorage` | Viewing key persistence (client-only, no server) |
| Deployment | Vercel | One-command deploy for demo |

---

## Project Structure

```
shieldpay/
├── app/
│   ├── layout.tsx               # WalletProvider + ConnectionProvider (devnet)
│   ├── page.tsx                 # Landing page
│   ├── dashboard/
│   │   └── page.tsx             # Treasurer dashboard (main app)
│   ├── contributor/
│   │   └── page.tsx             # Recipient view — "my payments"
│   └── audit/
│       └── page.tsx             # Viewing key audit report (no wallet needed)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── payroll/
│   │   ├── CSVUploader.tsx      # Drag-and-drop CSV upload + validation
│   │   ├── PayrollPreviewTable.tsx  # Editable table before sending
│   │   ├── BatchSendButton.tsx  # Triggers batchDisbursement()
│   │   └── PayrollSummary.tsx   # Total amounts per token, recipient count
│   ├── audit/
│   │   ├── ViewingKeyExport.tsx # Generate + copy/download viewing key
│   │   ├── ViewingKeyImport.tsx # Paste viewing key to unlock audit report
│   │   └── AuditReportTable.tsx # Decrypted payroll breakdown
│   ├── contributor/
│   │   └── ContributorPayment.tsx  # Shows only this wallet's payment
│   └── ui/
│       ├── StatusBadge.tsx      # Pending / Confirmed / Failed badges
│       ├── TokenSelect.tsx      # USDC / USDT / SOL selector
│       └── WalletGuard.tsx      # Redirect if wallet not connected
├── lib/
│   ├── cloak.ts                 # Cloak SDK client init + helper functions
│   ├── csv.ts                   # CSV parsing + validation logic
│   ├── viewingKey.ts            # Viewing key CRUD (localStorage)
│   └── constants.ts             # Token addresses, RPC endpoint, program IDs
├── hooks/
│   ├── useCloakBatch.ts         # Wraps batchDisbursement() with state
│   ├── useViewingKey.ts         # Viewing key save/get/list
│   └── useContributorPayments.ts  # Fetch + poll incoming shielded transfers
├── types/
│   └── index.ts                 # PayrollEntry, BatchResult, AuditRecord
├── public/
│   └── sample-payroll.csv       # Sample CSV for demo
└── .env.local                   # RPC URL, Cloak config (never committed)
```

---

## Core Data Types

```ts
// types/index.ts

type Token = "USDC" | "USDT" | "SOL";

interface PayrollEntry {
  id: string;           // uuid assigned on CSV parse
  wallet: string;       // Solana public key (base58)
  amount: number;       // Human-readable (e.g. 500.00)
  token: Token;
  label?: string;       // Optional: "Alice - October"
  status: "pending" | "sent" | "failed";
}

interface BatchResult {
  txSignature: string;
  timestamp: number;
  entries: PayrollEntry[];
  viewingKey: string;   // Saved to localStorage after each batch
}

interface AuditRecord {
  wallet: string;
  amount: number;
  token: Token;
  label?: string;
  txSignature: string;
  timestamp: number;
}
```

---

## CSV Format

```csv
wallet,amount,token,label
7xKp3...abc,500,USDC,Alice - October
9mLr2...def,1200,USDC,Bob - October
4nQw9...ghi,750,USDC,Carol - October
```

**Rules:**
- `wallet` — valid Solana base58 public key (validated with `PublicKey.isOnCurve()`)
- `amount` — positive number
- `token` — `USDC`, `USDT`, or `SOL`
- `label` — optional, internal reference only

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CLOAK_PROGRAM_ID=<from Cloak docs>
NEXT_PUBLIC_USDC_DEVNET_MINT=<devnet USDC mint address>
```

---

## Implementation Plan

---

### Phase 1 — Scaffold & Wallet Integration
**Goal:** Running Next.js app with wallet connect working on Solana devnet.

**Steps:**
1. `npx create-next-app@latest . --typescript --tailwind --app`
2. Install dependencies:
   ```bash
   npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets \
     @solana/wallet-adapter-react-ui @solana/web3.js \
     @cloak-labs/cloak-sdk papaparse uuid shadcn
   npm install -D @types/papaparse @types/uuid
   npx shadcn@latest init
   ```
3. `app/layout.tsx` — wrap with `ConnectionProvider` (devnet RPC) + `WalletProvider`
4. `lib/constants.ts` — RPC endpoint, USDC devnet mint, Cloak program ID
5. `lib/cloak.ts` — `initCloakClient(wallet, connection)` using `useMemo` keyed on `wallet.publicKey`
6. `Header.tsx` — `WalletMultiButton`, nav links to `/dashboard`, `/contributor`, `/audit`
7. `WalletGuard.tsx` — redirect unauthenticated users on protected pages

**Verification:** Connect Phantom on devnet, wallet address displayed in header.

---

### Phase 2 — CSV Upload & Payroll Preview
**Goal:** Users can upload a CSV and see a validated, editable preview table.

**Steps:**
1. `lib/csv.ts` — `parseCSV(file: File): Promise<PayrollEntry[]>`:
   - Use PapaParse in browser mode
   - Validate each wallet with `PublicKey.isOnCurve()` from `@solana/web3.js`
   - Assign `uuid` per row, set `status: "pending"`
   - Return per-row validation errors (not a global throw)
2. `CSVUploader.tsx` — drag-and-drop zone (`.csv` only), inline row errors, "Download Sample CSV" button
3. `PayrollPreviewTable.tsx` — click-to-edit amounts, delete row, status badge per row
4. `PayrollSummary.tsx` — totals per token, recipient count
5. `app/dashboard/page.tsx` — two-step flow: **Step 1: Upload → Step 2: Preview & Send**

**Verification:** Upload CSV, edit an amount, delete a row, totals update correctly.

---

### Phase 3 — Private Batch Send via Cloak SDK
**Goal:** One click sends all disbursements privately via `batchDisbursement()`.

**Steps:**
1. `hooks/useCloakBatch.ts`:
   - Per recipient: call `cloakClient.generateStealthAddress(recipientPubkey)` — fresh every batch, never cached
   - Call `cloakClient.batchDisbursement({ recipients, token })`
   - Return `{ execute, status, result, error }`
   - Update per-entry status after TX (`sent` or `failed`)
2. `BatchSendButton.tsx`:
   - Disabled if no valid rows or wallet not connected
   - Loading spinner + "Sending privately..." during TX
   - On success: TX signature with Solscan devnet link
   - On error: human-readable error message
3. After successful batch:
   - Call `cloakClient.generateViewingKey(txSignature)` → viewing key
   - Save `BatchResult` to `localStorage` via `useViewingKey`
   - Show "Save Your Viewing Key" success banner with copy + download options

**Verification:** Batch TX fires on devnet. Solscan shows TX with no readable output amounts.

---

### Phase 4 — Viewing Key & Audit Report
**Goal:** Treasurer exports a viewing key; accountant uses it to read the full payroll breakdown.

**Steps:**
1. `hooks/useViewingKey.ts`:
   - `saveViewingKey(key, batchId)` → `localStorage` key: `shieldpay_vk_{batchId}`
   - `getViewingKey(batchId)`, `listAllBatches()`
2. `ViewingKeyExport.tsx`:
   - Key displayed as blurred text with "Reveal" toggle
   - Copy to clipboard button
   - Download as JSON: `{ viewingKey, batchId, timestamp, totalAmount }`
   - Warning: *"Store this key securely. It is the only way to audit this batch."*
3. `ViewingKeyImport.tsx`:
   - Paste key textarea + "Unlock Report" button
   - Calls `cloakClient.decryptBatchWithViewingKey(key)` → returns `AuditRecord[]`
4. `AuditReportTable.tsx`:
   - Columns: wallet (truncated), amount, token, label, timestamp, TX link
   - "Export CSV" button for accountant
   - Totals row at bottom
5. `app/audit/page.tsx` — **no wallet required** — read-only for accountants

**Verification:** Export key after batch, paste in `/audit`, all recipients and amounts match CSV input.

---

### Phase 5 — Contributor View
**Goal:** A recipient connects their wallet and sees only their own incoming private payment.

**Steps:**
1. `hooks/useContributorPayments.ts`:
   - `cloakClient.getIncomingShieldedTransfers(walletPubkey)`
   - Poll every 10 seconds on devnet
   - Return `{ amount, token, timestamp, txSignature }[]`
2. `ContributorPayment.tsx`:
   - Shows "You received X USDC" with token icon and timestamp
   - TX signature with Solscan devnet link
   - Empty state: "No private payments received yet"
   - **Only this wallet's data is ever rendered — no other recipients visible**
3. `app/contributor/page.tsx` — wallet-gated, clean single-focus layout

**Verification:** Connect recipient wallet → sees own payment. Connect a different wallet → empty state. Zero data leakage.

---

### Phase 6 — Polish, Deploy & Demo Prep
**Goal:** Production-quality demo on Vercel, complete demo script ready.

**Steps:**
1. `app/page.tsx` — hero: "Private Payroll for DAOs and Remote Teams", 3 feature bullets, "Launch App" CTA
2. shadcn/ui `Toast` notifications for: wallet connect/disconnect, parse errors, send success/failure, viewing key saved
3. Create `public/sample-payroll.csv` with 5 realistic fake rows
4. Configure `.env.local`, deploy to Vercel with environment variables
5. Full end-to-end smoke test on the live Vercel URL

**Verification:** Live Vercel URL, entire demo flow works without local setup.

---

## Full User Flow

```
[Landing Page]
      │
      ▼
[Treasurer connects wallet]
      │
      ▼
[Upload CSV] → [Validate rows] → [Preview Table]
                                       │
                             [Edit / Remove rows]
                                       │
                             [Click: Send Privately]
                                       │
                        [Cloak SDK: batchDisbursement()]
                                       │
             ┌─────────────────────────┴──────────────────────┐
             ▼                                                 ▼
   Shielded USDC → Recipient A                   Shielded USDC → Recipient B
   (fresh stealth address)                        (fresh stealth address)
                                       │
                        [On-chain: one TX, no readable amounts]
                                       │
                        [Viewing key generated + saved locally]
                                       │
                        [Treasurer exports viewing key]
                                       │
             ┌─────────────────────────┴──────────────────────┐
             ▼                                                 ▼
   [/audit: paste key → full breakdown]         [/contributor: wallet → own payment only]
   [Accountant-readable, no wallet needed]       [Nothing else exposed]
```

---

## Cloak SDK Features Used

| Feature | Where |
|---|---|
| `batchDisbursement()` | Core payroll send — Phase 3 |
| `generateStealthAddress()` | Fresh one-time address per recipient per batch — Phase 3 |
| `generateViewingKey()` | Treasurer audit key — Phase 3 & 4 |
| `decryptBatchWithViewingKey()` | Audit report unlock — Phase 4 |
| `getIncomingShieldedTransfers()` | Contributor payment view — Phase 5 |

---

## Critical Implementation Notes

| File | Note |
|---|---|
| `lib/cloak.ts` | Re-initialize SDK client on every wallet change. Use `useMemo` keyed on `wallet.publicKey` |
| `hooks/useCloakBatch.ts` | Always generate a **fresh stealth address** per recipient per batch. Never cache stealth addresses across pay periods |
| `lib/csv.ts` | Validate every wallet with `PublicKey.isOnCurve()` before any TX. One bad address will fail the entire batch |
| `hooks/useViewingKey.ts` | Never POST viewing keys to any server. `localStorage` only. Surface a clear warning in the UI |
| `app/audit/page.tsx` | Must work **without** a Solana wallet — an accountant will not have one |
| `hooks/useContributorPayments.ts` | Filter strictly by connected wallet pubkey. Never expose batch metadata or other recipients |

---

## Judging Criteria Alignment

| Criterion | How ShieldPay Addresses It |
|---|---|
| **Use of Cloak SDK** | Batch disbursement, stealth addresses, viewing keys — all 3 core features used end-to-end |
| **Privacy is essential** | Without Cloak, every salary is public on-chain — the product cannot exist without it |
| **Real-world use case** | Payroll is universally understood and immediately relatable |
| **Working demo** | Upload → send → receive → audit — fully demonstrable live |
| **Code quality** | SDK logic isolated in `lib/cloak.ts` + hooks, fully typed with TypeScript |
| **Presentation** | Clear before/after: public Solscan TX vs. Cloak-shielded TX |

---

## Demo Script (5 Minutes)

| Time | Action |
|---|---|
| 0:00 | Open Solscan — show a public payroll TX. *"Anyone can see Alice got $4,200 and Bob got $1,800."* |
| 0:45 | Open ShieldPay — connect Phantom (treasurer wallet on devnet) |
| 1:00 | Upload `sample-payroll.csv` — 5 contributors appear in the preview table |
| 1:30 | Click "Send Privately" — watch the loading state |
| 2:00 | TX confirmed — open Solscan link — **no readable output amounts** |
| 2:30 | *"Here's the viewing key — the only key that unlocks this."* |
| 3:00 | Connect Alice's wallet on `/contributor` — shows only Alice's payment |
| 3:30 | Switch to Bob's wallet — empty state. *"Bob cannot see Alice. Alice cannot see Bob."* |
| 4:00 | Go to `/audit` — paste viewing key — full breakdown appears |
| 4:30 | Click "Export CSV". *"This is what the accountant receives."* |
| 5:00 | **"Private by default. Auditable by choice. That is ShieldPay."** |

---

## Build Timeline

| Day | Phase | Deliverable |
|---|---|---|
| Day 1 | Phase 1: Scaffold + Wallet | Wallet connect working on devnet |
| Day 2 | Phase 2: CSV + Preview | Upload, parse, display, validate |
| Day 3 | Phase 3: Batch Send | Private TX fires and confirmed on devnet |
| Day 4 | Phase 4 + 5: Audit + Contributor | Viewing key unlock + recipient view |
| Day 5 | Phase 6: Polish + Deploy | Live on Vercel, demo ready |

---

## Quick Start (After Scaffolding)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SOLANA_RPC_URL, NEXT_PUBLIC_CLOAK_PROGRAM_ID, NEXT_PUBLIC_USDC_DEVNET_MINT

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Phantom wallet set to **Solana Devnet**.
