"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const FIELD_BASE =
  "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 " +
  "text-slate-100 placeholder-slate-500 text-xs sm:text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-500 " +
  "transition-all duration-200";

const LABEL_BASE =
  "block mb-1 text-[11px] font-bold tracking-wider text-slate-300 uppercase";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function ClaimForm({ softwareName, softwareSlug, cashbackValue, displayRate, onClose, onSuccessSubmitted }) {
  const [upiId, setUpiId]               = useState("");
  const [orderId, setOrderId]           = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [purchaseDate, setPurchaseDate]   = useState(new Date().toISOString().split("T")[0]);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [file, setFile]                 = useState(null);
  const [dpdpConsent, setDpdpConsent]   = useState(false);
  const [errors, setErrors]             = useState({});
  const [status, setStatus]             = useState("idle"); 
  const fileInputRef                    = useRef(null);

  function validate() {
    const errs = {};
    if (!orderId.trim())         errs.orderId       = "Order ID / Invoice Number is required.";
    if (!purchaseEmail.trim() || !purchaseEmail.includes("@")) {
      errs.purchaseEmail = "Please enter the email used for purchase.";
    }
    if (!purchaseAmount || Number(purchaseAmount) <= 0) {
      errs.purchaseAmount = "Please enter the invoice paid amount.";
    }
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiId.trim() || !upiRegex.test(upiId.trim())) {
      errs.upiId = "Please enter a valid UPI ID (e.g. name@okhdfcbank).";
    }
    if (!file)                   errs.file          = "Please upload your invoice receipt.";
    if (!dpdpConsent)            errs.dpdpConsent   = "You must consent to DPDP data processing to claim cashback.";
    return errs;
  }

  function fileToBase64(fileObj) {
    return new Promise((resolve) => {
      if (!fileObj) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileObj);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("loading");

    try {
      const receiptData = await fileToBase64(file);

      const res = await fetch("/api/cashback/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upiId: upiId.trim(),
          orderId: orderId.trim(),
          softwareSlug: softwareSlug || "",
          softwareName: softwareName || "Software Claim",
          purchaseEmail: purchaseEmail.trim().toLowerCase(),
          purchaseDate,
          purchaseAmount: Number(purchaseAmount),
          cashbackAmount: Number(cashbackValue) || 400,
          receiptFileName: file?.name || "",
          receiptData,
          dpdpConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit claim.");
      }

      setStatus("success");
      if (onSuccessSubmitted) {
        onSuccessSubmitted();
      }
    } catch (err) {
      setErrors({ submit: err.message });
      setStatus("idle");
    }
  }

  function handleFileChange(e) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    if (picked) setErrors((prev) => ({ ...prev, file: undefined }));
  }

  const isLoading = status === "loading";

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="relative flex items-center justify-center w-14 h-14">
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-2xl">
            🎉
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black text-white">Cashback Claim Submitted!</h3>
          <p className="text-xs sm:text-sm font-bold text-emerald-400">
            Guaranteed {displayRate} UPI Cashback Registered
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Order ID <code className="text-sky-300 font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{orderId}</code> saved for affiliate verification.
          </p>
        </div>

        {/* Highlighted Profile Tracking Callout */}
        <div className="w-full rounded-2xl border border-sky-500/40 bg-sky-500/10 p-3.5 text-left space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-black text-sky-300 uppercase tracking-wider">
            <span>🔔</span> Important: Track Live Status in Your Profile
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please check your <strong>Profile &gt; Cashback tab</strong> regularly to monitor your claim's live progress. Once verified, your status will update and your UPI Payout <strong>UTR Reference Number</strong> will appear there.
          </p>
        </div>

        {/* 4-Step Mini Progress Stepper */}
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 p-3 text-left space-y-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Tracking Timeline:</span>
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="p-2 rounded-xl border border-sky-500/50 bg-sky-500/15 text-sky-300">
              <p className="text-[10px] font-black">1. Submitted</p>
              <p className="text-[8px] text-sky-400">Done ✅</p>
            </div>
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
              <p className="text-[10px] font-black">2. Tracked</p>
              <p className="text-[8px] text-slate-500">24-48 hrs</p>
            </div>
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
              <p className="text-[10px] font-black">3. Locked</p>
              <p className="text-[8px] text-slate-500">30 Days</p>
            </div>
            <div className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-500">
              <p className="text-[10px] font-black">4. Paid UPI</p>
              <p className="text-[8px] text-slate-500">Direct Cash</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-1">
          <Link
            href="/profile?tab=cashback"
            className="block w-full text-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            🔍 Track Cashback in My Profile →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕ Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
      {/* Order ID */}
      <div>
        <label htmlFor="modal-order-id" className={LABEL_BASE}>
          Software Order ID / Invoice Number <span className="text-rose-400">*</span>
        </label>
        <input
          id="modal-order-id"
          type="text"
          placeholder="e.g. HOST-984219 or INV-2026-008"
          value={orderId}
          onChange={(e) => { setOrderId(e.target.value); setErrors((p) => ({ ...p, orderId: undefined })); }}
          disabled={isLoading}
          className={`${FIELD_BASE} ${errors.orderId ? "border-rose-500/70" : ""}`}
        />
        {errors.orderId && <p className="mt-1 text-[11px] text-rose-400">{errors.orderId}</p>}
      </div>

      {/* Purchase Email & Amount Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="modal-purchase-email" className={LABEL_BASE}>
            Purchase Email <span className="text-rose-400">*</span>
          </label>
          <input
            id="modal-purchase-email"
            type="email"
            placeholder="email used on vendor site"
            value={purchaseEmail}
            onChange={(e) => { setPurchaseEmail(e.target.value); setErrors((p) => ({ ...p, purchaseEmail: undefined })); }}
            disabled={isLoading}
            className={`${FIELD_BASE} ${errors.purchaseEmail ? "border-rose-500/70" : ""}`}
          />
          {errors.purchaseEmail && <p className="mt-1 text-[11px] text-rose-400">{errors.purchaseEmail}</p>}
        </div>

        <div>
          <label htmlFor="modal-purchase-amount" className={LABEL_BASE}>
            Amount Paid (₹) <span className="text-rose-400">*</span>
          </label>
          <input
            id="modal-purchase-amount"
            type="number"
            placeholder="e.g. 2499"
            value={purchaseAmount}
            onChange={(e) => { setPurchaseAmount(e.target.value); setErrors((p) => ({ ...p, purchaseAmount: undefined })); }}
            disabled={isLoading}
            className={`${FIELD_BASE} ${errors.purchaseAmount ? "border-rose-500/70" : ""}`}
          />
          {errors.purchaseAmount && <p className="mt-1 text-[11px] text-rose-400">{errors.purchaseAmount}</p>}
        </div>
      </div>

      {/* UPI ID */}
      <div>
        <label htmlFor="modal-upi-id" className={LABEL_BASE}>
          Your UPI ID (GPay / PhonePe) <span className="text-emerald-400">*</span>
        </label>
        <input
          id="modal-upi-id"
          type="text"
          placeholder="yourname@okhdfcbank or 9876543210@paytm"
          value={upiId}
          onChange={(e) => { setUpiId(e.target.value); setErrors((p) => ({ ...p, upiId: undefined })); }}
          disabled={isLoading}
          className={`${FIELD_BASE} font-mono text-emerald-300 font-bold ${errors.upiId ? "border-rose-500/70" : ""}`}
        />
        {errors.upiId && <p className="mt-1 text-[11px] text-rose-400">{errors.upiId}</p>}
        <p className="mt-0.5 text-[10px] text-slate-400">Guaranteed {displayRate} direct transfer to your UPI account.</p>
      </div>

      {/* Invoice File Upload */}
      <div>
        <label className={LABEL_BASE}>
          Upload Invoice Receipt (PDF or Screenshot) <span className="text-rose-400">*</span>
        </label>
        <input
          ref={fileInputRef}
          id="modal-invoice-file"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,image/*,application/pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="sr-only"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className={[
            "flex flex-col items-center justify-center gap-1.5",
            "rounded-xl border-2 border-dashed border-slate-700/80 bg-slate-900/50 p-4",
            "cursor-pointer hover:border-sky-500/60 hover:bg-slate-900/80 transition-all",
            file ? "border-emerald-500/60 bg-emerald-950/20" : "",
            errors.file ? "border-rose-500/70" : "",
          ].join(" ")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          aria-label="Upload invoice file"
        >
          {file ? (
            <div className="flex items-center gap-2.5 text-left">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 text-xs">
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-400 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </div>
            </div>
          ) : (
            <>
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-300">
                  <span className="text-sky-400 font-semibold underline">Click to upload</span> or drag & drop
                </p>
                <p className="text-[10px] text-slate-500">PDF, PNG, JPG up to 5MB</p>
              </div>
            </>
          )}
        </div>
        {errors.file && <p className="mt-1 text-[11px] text-rose-400">{errors.file}</p>}
      </div>

      {/* DPDP Act 2023 Consent Checkbox */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3.5 space-y-1.5">
        <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dpdpConsent}
            onChange={(e) => {
              setDpdpConsent(e.target.checked);
              if (e.target.checked) setErrors((p) => ({ ...p, dpdpConsent: undefined }));
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
          />
          <span className="leading-relaxed text-[11px] text-slate-300">
            <strong className="text-white font-semibold">DPDP Act 2023 Consent:</strong> I agree to allow SaaTerra to securely process my invoice &amp; UPI ID solely for cashback verification, affiliate tracking, and payment settlement as per the <a href="/privacy" target="_blank" className="text-sky-400 underline font-bold">Privacy Policy</a>.
          </span>
        </label>
        {errors.dpdpConsent && <p className="text-[11px] font-bold text-rose-400">⚠️ {errors.dpdpConsent}</p>}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-400">
          ⚠️ {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={[
          "w-full rounded-xl py-3 text-xs sm:text-sm font-black transition-all cursor-pointer",
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500",
          "text-slate-950 shadow-lg shadow-emerald-500/25",
          "hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400 active:scale-98",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center gap-2",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Processing Claim…</span>
          </>
        ) : (
          <span>🚀 Submit Cashback Claim ({displayRate})</span>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center pt-1">
        <span>🔒 Zero Spam Calls</span>
        <span>·</span>
        <span>🛡️ 256-Bit SSL Encrypted</span>
        <span>·</span>
        <span>💸 100% UPI Guarantee</span>
      </div>
    </form>
  );
}

export default function CashbackClaimSection({
  softwareName,
  softwareSlug,
  cashbackData,
}) {
  const [open, setOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!cashbackData || cashbackData.cashbackActive === false) {
    return null;
  }

  const {
    cashbackType = "flat",
    cashbackValue = 400,
    cashbackLabel = "Buy via SaaTerra & claim your cashback instantly",
    cashbackValidity = "",
  } = cashbackData;

  const displayRate =
    cashbackType === "percentage"
      ? `${cashbackValue}%`
      : `₹${Number(cashbackValue).toLocaleString('en-IN')}`;

  return (
    <>
      <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-[#0d1c2e] p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <span className="text-lg font-black text-amber-400">{displayRate} Cashback</span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {cashbackLabel}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-400">
            Active Deal
          </span>
        </div>

        {cashbackValidity && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>🗓️</span> Valid: {cashbackValidity}
          </p>
        )}

        {/* Post-Submission Tracking Reminder Banner if user closed modal */}
        {hasSubmitted && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
              <span>✅</span> Claim Submitted for {softwareName}!
            </div>
            <p className="text-[11px] text-slate-300">
              Please check your <strong>Profile &gt; Cashback tab</strong> to track live progress and payout status!
            </p>
            <Link
              href="/profile?tab=cashback"
              className="inline-flex items-center gap-1 text-xs font-black text-sky-400 hover:text-sky-300 hover:underline"
            >
              Go to Profile Cashback Tracker →
            </Link>
          </div>
        )}

        <div className="border-t border-slate-800/80 pt-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={[
              "w-full text-center rounded-xl py-3",
              "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500",
              "text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25",
              "active:scale-95 transition-all whitespace-nowrap cursor-pointer",
            ].join(" ")}
          >
            🎁 Claim {displayRate} Cashback
          </button>
        </div>
      </div>

      {/* Render Modal via React Portal directly to document.body to prevent any parent clipping */}
      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="relative z-10 w-full max-w-md my-auto rounded-3xl border border-slate-700 bg-[#0d1d30] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="border-b border-slate-800 pb-3.5 flex items-center justify-between gap-3 sticky top-0 bg-[#0d1d30] z-20">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-lg shrink-0">
                  💸
                </span>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Claim {displayRate} Cashback
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">{softwareName} · via SaaTerra</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <ClaimForm
              softwareName={softwareName}
              softwareSlug={softwareSlug}
              cashbackValue={cashbackValue}
              displayRate={displayRate}
              onClose={() => setOpen(false)}
              onSuccessSubmitted={() => setHasSubmitted(true)}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
