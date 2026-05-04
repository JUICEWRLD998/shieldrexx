import { WalletGuard } from "@/components/ui/WalletGuard";

export default function ContributorPage() {
  return (
    <WalletGuard>
      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <p className="step-num uppercase tracking-widest mb-1">
            Contributor View
          </p>
          <h1 className="text-3xl font-bold text-white">My Payments</h1>
          <p className="text-slate-400 mt-2">
            Only private payments addressed to your connected wallet are shown
            here — nothing else is ever exposed.
          </p>
        </div>

        {/* Privacy notice */}
        <div
          className="card rounded-xl p-4 mb-5 flex items-start gap-3"
          style={{ borderColor: "rgba(124,58,237,0.3)" }}
          role="note"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path
                d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                fill="url(#cp)"
                opacity="0.9"
              />
              <defs>
                <linearGradient
                  id="cp"
                  x1="3"
                  y1="2"
                  x2="21"
                  y2="22"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            <span className="text-slate-200 font-medium">Privacy guaranteed.</span>{" "}
            Other batch recipients and their amounts are never surfaced here.
            Only your own incoming transfers are decrypted and displayed.
          </p>
        </div>

        {/* Empty state */}
        <div
          className="card rounded-2xl flex flex-col items-center justify-center text-center gap-4 p-12"
          style={{ minHeight: "260px" }}
          role="region"
          aria-label="Payment history — coming in Phase 5"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(109,40,217,0.1)",
              border: "2px dashed rgba(124,58,237,0.35)",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <circle cx="12" cy="8" r="4" stroke="url(#cu)" strokeWidth="1.5" />
              <path
                d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
                stroke="url(#cu)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="cu"
                  x1="4"
                  y1="4"
                  x2="20"
                  y2="20"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <p className="text-slate-300 font-semibold mb-1">
              Payment history — Phase 5
            </p>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Once implemented, incoming shielded transfers will appear here
              with amount, token, and Solscan TX link.
            </p>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
