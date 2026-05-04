"use client";

import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from "react";
import { parseCSV, type ParseResult } from "@/lib/csv";
import { useToast } from "@/components/providers/ToastProvider";
import type { PayrollEntry } from "@/types";

interface Props {
  onParsed: (entries: PayrollEntry[]) => void;
}

export function CSVUploader({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      const msg = "Please upload a .csv file.";
      setErrors([msg]);
      toast({ type: "error", title: "Invalid file type", message: msg });
      return;
    }
    setLoading(true);
    setErrors([]);
    setFileName(file.name);

    const result: ParseResult = await parseCSV(file);

    setLoading(false);

    if (result.errors.length > 0 && result.entries.length === 0) {
      setErrors(result.errors);
      toast({
        type: "error",
        title: `CSV parse failed — ${result.errors.length} error${result.errors.length > 1 ? "s" : ""}`,
        message: result.errors[0],
      });
      return;
    }

    if (result.errors.length > 0) {
      setErrors(result.errors);
      toast({
        type: "warning",
        title: `${result.errors.length} row${result.errors.length > 1 ? "s" : ""} skipped`,
        message: result.errors[0],
      });
    }

    if (result.entries.length > 0) {
      toast({
        type: "success",
        title: `${result.entries.length} recipient${result.entries.length > 1 ? "s" : ""} loaded`,
        message: file.name,
      });
      onParsed(result.entries);
    }
  }

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop CSV file here or click to browse"
        className="card rounded-2xl flex flex-col items-center justify-center text-center gap-5 p-12 cursor-pointer transition-all duration-200"
        style={{
          minHeight: "300px",
          borderStyle: "dashed",
          borderColor: dragging
            ? "rgba(124,58,237,0.8)"
            : "rgba(124,58,237,0.35)",
          background: dragging
            ? "rgba(109,40,217,0.12)"
            : "rgba(13,18,48,0.7)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
          aria-hidden="true"
        />

        {/* Upload icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "rgba(109,40,217,0.1)",
            border: "1.5px dashed rgba(124,58,237,0.45)",
          }}
          aria-hidden="true"
        >
          {loading ? (
            <svg className="w-7 h-7 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(124,58,237,0.3)" strokeWidth="2" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="url(#up)" strokeWidth="1.5" strokeLinecap="round" />
              <polyline points="17 8 12 3 7 8" stroke="url(#up)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="3" x2="12" y2="15" stroke="url(#up)" strokeWidth="1.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="up" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c4b5fd" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        <div>
          {loading ? (
            <p className="text-slate-300 font-semibold">Parsing {fileName}…</p>
          ) : (
            <>
              <p className="text-slate-200 font-semibold text-base mb-1">
                {dragging ? "Drop it here" : "Drop your payroll CSV here"}
              </p>
              <p className="text-slate-500 text-sm">
                or{" "}
                <span className="text-violet-400 underline underline-offset-2">
                  browse files
                </span>
              </p>
            </>
          )}
        </div>

        <p className="text-slate-600 text-xs">
          Required columns:&nbsp;
          <code className="text-slate-500">wallet, amount, token</code>
        </p>
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
          role="alert"
          aria-label="Validation errors"
        >
          <p className="text-red-400 font-semibold text-sm mb-1">
            {errors.length} issue{errors.length > 1 ? "s" : ""} found — rows with errors are skipped
          </p>
          <ul className="flex flex-col gap-1">
            {errors.map((e, i) => (
              <li key={i} className="text-red-300 text-xs leading-relaxed flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sample download */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600 text-xs">
          Accepted tokens: USDC · USDT · SOL
        </p>
        <a
          href="/sample-payroll.csv"
          download
          className="text-xs font-medium transition-colors"
          style={{ color: "#a78bfa" }}
          onClick={(e) => e.stopPropagation()}
        >
          Download sample CSV ↓
        </a>
      </div>
    </div>
  );
}
