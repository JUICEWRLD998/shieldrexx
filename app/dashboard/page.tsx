import { WalletGuard } from "@/components/ui/WalletGuard";

const STEPS = ["Upload CSV", "Review & Edit", "Send Privately"] as const;

export default function DashboardPage() {
  return (
    <WalletGuard>
      <div className="max-w-4xl mx-auto w-full px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <p className="step-num uppercase tracking-widest mb-1">
            Treasurer Dashboard
          </p>
          <h1 className="text-3xl font-bold text-white">
            Payroll Disbursement
          </h1>
          <p className="text-slate-400 mt-2">
            Upload a CSV and run a private batch disbursement via Cloak.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8" aria-label="Progress steps" role="list">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2" role="listitem">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={
                  i === 0
                    ? {
                        background:
                          "linear-gradient(135deg,#6d28d9,#7c3aed)",
                        color: "#fff",
                      }
                    : {
                        background: "rgba(109,40,217,0.12)",
                        color: "#4b5563",
                        border: "1px solid rgba(124,58,237,0.2)",
                      }
                }
                aria-current={i === 0 ? "step" : undefined}
              >
                {i + 1}
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: i === 0 ? "#f1f5f9" : "#4b5563" }}
              >
                {step}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className="w-6 h-px mx-1"
                  style={{ background: "rgba(124,58,237,0.2)" }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        {/* Drop zone placeholder */}
        <div
          className="card rounded-2xl flex flex-col items-center justify-center text-center gap-5 p-12"
          style={{ minHeight: "340px" }}
          role="region"
          aria-label="CSV upload area — coming in Phase 2"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(109,40,217,0.1)",
              border: "2px dashed rgba(124,58,237,0.35)",
            }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                stroke="url(#up)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="17 8 12 3 7 8"
                stroke="url(#up)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
                stroke="url(#up)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="up"
                  x1="3"
                  y1="3"
                  x2="21"
                  y2="21"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div>
            <p className="text-slate-200 font-semibold text-base mb-1">
              CSV Uploader — Phase 2
            </p>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              Drag and drop your payroll CSV here. Every wallet address is
              validated on-curve before you can send.
            </p>
          </div>

          <div
            className="badge text-xs"
            style={{ opacity: 0.7 }}
          >
            Accepts: wallet, amount, token, label
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
