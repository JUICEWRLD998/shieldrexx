export default function AuditPage() {
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-10">
      <div className="mb-8">
        <p className="step-num uppercase tracking-widest mb-1">Audit Report</p>
        <h1 className="text-3xl font-bold text-white">Verify a Batch</h1>
        <p className="text-slate-400 mt-2">
          Paste a viewing key to decrypt the full payroll breakdown. No wallet
          required — designed for accountants and auditors.
        </p>
      </div>

      {/* Info card */}
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
            <circle cx="12" cy="12" r="10" stroke="#a78bfa" strokeWidth="1.5" />
            <path
              d="M12 8v4m0 4h.01"
              stroke="#a78bfa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-slate-200 text-sm font-medium mb-0.5">
            No wallet needed
          </p>
          <p className="text-slate-500 text-xs leading-relaxed">
            The viewing key contains everything needed to decrypt the batch.
            This page is open access — share the URL and key with your
            accountant, not your wallet credentials.
          </p>
        </div>
      </div>

      {/* Placeholder import area */}
      <div
        className="card rounded-2xl flex flex-col items-center justify-center text-center gap-5 p-12"
        style={{ minHeight: "300px" }}
        role="region"
        aria-label="Viewing key import — coming in Phase 4"
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
            <circle cx="9" cy="12" r="5" stroke="url(#au)" strokeWidth="1.5" />
            <path
              d="M14 10.5H22M19 10.5V14"
              stroke="url(#au)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="9" cy="12" r="2" fill="url(#au)" />
            <defs>
              <linearGradient
                id="au"
                x1="3"
                y1="7"
                x2="22"
                y2="17"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#c4b5fd" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div>
          <p className="text-slate-200 font-semibold mb-1">
            Viewing Key Import — Phase 4
          </p>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            Paste your viewing key to unlock the full payroll breakdown and
            export it as CSV for your records.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <div
            className="rounded-xl p-3 text-left text-xs font-mono"
            style={{
              background: "rgba(109,40,217,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              color: "#6b7280",
            }}
            aria-hidden="true"
          >
            {"{ \"viewingKey\": \"...\", \"batchId\": \"...\", \"timestamp\": ... }"}
          </div>
        </div>
      </div>
    </div>
  );
}
