"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FIELD_BASE =
  "w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 " +
  "text-slate-100 placeholder-slate-500 text-xs sm:text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 " +
  "transition-all duration-200";

const LABEL_BASE = "block mb-1 text-xs font-bold tracking-wider text-slate-300 uppercase";

export default function InvoiceClaimForm() {
  const router = useRouter();
  const [softwares, setSoftwares] = useState([]);
  const [loadingSoftwares, setLoadingSoftwares] = useState(true);

  // Form inputs
  const [selectedSoftware, setSelectedSoftware] = useState("");
  const [orderId, setOrderId] = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [remarks, setRemarks]                   = useState("");
  const [file, setFile]                         = useState(null);
  const [dpdpConsent, setDpdpConsent]           = useState(false);
  const [filePreview, setFilePreview]           = useState("");

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchSoftwares() {
      try {
        const res = await fetch("/api/software?limit=50");
        const json = await res.json();
        if (json.softwares) {
          setSoftwares(json.softwares);
        }
      } catch (err) {
        console.error("Failed to load softwares", err);
      } finally {
        setLoadingSoftwares(false);
      }
    }
    fetchSoftwares();
  }, []);

  function validate() {
    const errs = {};
    if (!selectedSoftware.trim()) errs.software = "Please select the software you purchased.";
    if (!orderId.trim()) errs.orderId = "Order ID / Invoice Number is required.";
    if (!purchaseEmail.trim() || !purchaseEmail.includes("@")) {
      errs.purchaseEmail = "Please enter the exact email used for purchasing.";
    }
    if (!purchaseDate) errs.purchaseDate = "Purchase date is required.";
    if (!purchaseAmount || Number(purchaseAmount) <= 0) {
      errs.purchaseAmount = "Please enter the invoice amount paid.";
    }

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiId.trim() || !upiRegex.test(upiId.trim())) {
      errs.upiId = "Please enter a valid UPI ID (e.g. name@okhdfcbank or mobile@paytm).";
    }

    if (!file) errs.file = "Please upload your invoice receipt (Screenshot or PDF).";
    if (!dpdpConsent) errs.dpdpConsent = "You must agree to DPDP data processing to submit this claim.";
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

  function handleFileChange(e) {
    const picked = e.target.files?.[0] ?? null;
    if (picked) {
      if (picked.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "File size exceeds 5MB limit." }));
        return;
      }
      setFile(picked);
      setErrors((prev) => ({ ...prev, file: undefined }));

      if (picked.type.startsWith("image/")) {
        const url = URL.createObjectURL(picked);
        setFilePreview(url);
      } else {
        setFilePreview("");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const receiptData = await fileToBase64(file);
      const matchedSw = softwares.find((s) => s.slug === selectedSoftware || s.name === selectedSoftware);
      const softwareName = matchedSw ? matchedSw.name : selectedSoftware;

      const res = await fetch("/api/cashback/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareSlug: matchedSw?.slug || selectedSoftware.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          softwareName,
          orderId: orderId.trim(),
          purchaseEmail: purchaseEmail.trim().toLowerCase(),
          purchaseDate,
          purchaseAmount: Number(purchaseAmount),
          upiId: upiId.trim(),
          remarks: remarks.trim(),
          receiptFileName: file?.name || "invoice_receipt",
          receiptData,
          cashbackAmount: matchedSw?.cashbackValue || 400,
          dpdpConsent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to submit cashback claim.");
      }

      setSubmittedClaim(data.claim);
      setStatus("success");
    } catch (err) {
      setErrors({ submit: err.message });
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <div className="rounded-3xl border border-emerald-500/40 bg-[#0d1d30] p-8 sm:p-10 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40 text-4xl shadow-inner">
            🎉
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Cashback Claim Submitted!</h2>
            <p className="text-sm text-emerald-400 font-bold">
              Guaranteed ₹{submittedClaim?.cashbackAmount || 400} UPI Cashback Record Created!
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our team will verify your Order ID (<code className="text-sky-300 font-bold">{submittedClaim?.orderId}</code>) with the vendor affiliate report.
            </p>
          </div>

          {/* Highlighted Profile Tracking Callout */}
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-black text-sky-300 uppercase tracking-wider">
              <span>🔔</span> Important: Track Live Status in Your Profile
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please check your <strong>Profile &gt; Cashback tab</strong> regularly to monitor your claim's live progress. Once verified, your status will update and your UPI Payout <strong>UTR Reference Number</strong> will appear there.
            </p>
          </div>

          {/* CashKaro Tracking Timeline Preview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Tracking Timeline:</span>
              <span className="text-sky-400 font-mono text-[11px]">Status: 📤 1. Submitted</span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300">
                <p className="text-[10px] font-black">1. Submitted</p>
                <p className="text-[8px] text-slate-400">Done ✅</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
                <p className="text-[10px] font-black">2. Tracked</p>
                <p className="text-[8px] text-slate-500">24-48 hrs</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
                <p className="text-[10px] font-black">3. Locked</p>
                <p className="text-[8px] text-slate-500">30 Days</p>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500">
                <p className="text-[10px] font-black">4. Paid to UPI</p>
                <p className="text-[8px] text-slate-500">Direct Cash</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/profile?tab=cashback"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-xs font-black text-slate-950 shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              Track Cashback in My Profile →
            </Link>
            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setFile(null);
                setFilePreview("");
                setOrderId("");
              }}
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-slate-300 hover:text-white"
            >
              Submit Another Claim
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-lg">
            <span>🎁</span> Direct UPI Cashback Rebate
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-bold shadow-sm">
            <span>🔒</span> Zero Spam Calls · 256-Bit Encrypted
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Claim Your Software Cashback
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Purchased software through SaaTerra? Enter your purchase details below to verify and receive guaranteed cash rebate directly in your UPI account.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl border border-slate-800 bg-[#0d1d30]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        {errors.submit && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-bold text-rose-300 flex items-start gap-2.5 shadow-lg">
            <span className="text-base">⚠️</span>
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Software & Order Verification Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-base">1️⃣</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">
                Software &amp; Order Verification Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Software Selection */}
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Software Purchased <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedSoftware}
                  onChange={(e) => setSelectedSoftware(e.target.value)}
                  className={FIELD_BASE}
                  disabled={loadingSoftwares}
                >
                  <option value="">-- Choose Software --</option>
                  {softwares.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} (₹{s.cashbackValue || 400} Cashback)
                    </option>
                  ))}
                  <option value="other">Other Software (Purchased via SaaTerra link)</option>
                </select>
                {errors.software && <p className="text-[11px] text-rose-400 font-medium">{errors.software}</p>}
              </div>

              {/* Order ID / Invoice Number */}
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Order ID / Invoice Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. HOST-984219 or INV-2026-441"
                  className={FIELD_BASE}
                />
                <p className="text-[10px] text-slate-500">Found on your vendor email receipt / bill.</p>
                {errors.orderId && <p className="text-[11px] text-rose-400 font-medium">{errors.orderId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Purchase Email */}
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Purchase Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={purchaseEmail}
                  onChange={(e) => setPurchaseEmail(e.target.value)}
                  placeholder="email used on vendor site"
                  className={FIELD_BASE}
                />
                <p className="text-[10px] text-slate-500">Exact email used at vendor checkout.</p>
                {errors.purchaseEmail && <p className="text-[11px] text-rose-400 font-medium">{errors.purchaseEmail}</p>}
              </div>

              {/* Purchase Date */}
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Purchase Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={FIELD_BASE}
                />
                {errors.purchaseDate && <p className="text-[11px] text-rose-400 font-medium">{errors.purchaseDate}</p>}
              </div>

              {/* Amount Paid */}
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Amount Paid (₹ INR) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder="e.g. 2499"
                  className={FIELD_BASE}
                />
                {errors.purchaseAmount && <p className="text-[11px] text-rose-400 font-medium">{errors.purchaseAmount}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Payout UPI ID */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-base">2️⃣</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Cashback Payout Details (Direct UPI)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Your UPI ID (GPay / PhonePe / Paytm) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okhdfcbank or 9876543210@paytm"
                  className={`${FIELD_BASE} font-mono text-emerald-300 font-bold`}
                />
                <p className="text-[10px] text-slate-500">
                  Cashback will be sent directly to this UPI address. No wallet holding.
                </p>
                {errors.upiId && <p className="text-[11px] text-rose-400 font-medium">{errors.upiId}</p>}
              </div>

              <div className="space-y-1">
                <label className={LABEL_BASE}>
                  Additional Remarks / Plan Name (Optional)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. 1 Year Premium Plan"
                  className={FIELD_BASE}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Upload Invoice Receipt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-base">3️⃣</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-400">
                Upload Proof of Purchase (Invoice / Bill)
              </h3>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                file
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-700 bg-slate-900/60 hover:border-sky-500/50 hover:bg-slate-900"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="text-3xl">📄</div>
                  <p className="text-xs font-bold text-white">{file.name}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">
                    File selected ({(file.size / 1024).toFixed(1)} KB) — Click to replace
                  </p>
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Receipt Preview"
                      className="mx-auto max-h-36 rounded-xl border border-slate-700 object-contain mt-2 shadow"
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-3xl">📥</div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to upload your invoice screenshot or PDF bill
                  </p>
                  <p className="text-[11px] text-slate-500">Supports JPG, PNG, PDF up to 5MB</p>
                </div>
              )}
            </div>
            {errors.file && <p className="text-[11px] text-rose-400 font-medium">{errors.file}</p>}
          </div>

          {/* DPDP Act 2023 Consent Box */}
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 space-y-1.5">
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
                <strong className="text-white font-semibold">DPDP Act 2023 Data Consent:</strong> I agree to allow SaaTerra to securely process my invoice receipt and UPI ID strictly for the purpose of cashback verification, affiliate tracking, and bank settlement under the <a href="/privacy" target="_blank" className="text-sky-400 underline font-bold">Privacy Policy</a>.
              </span>
            </label>
            {errors.dpdpConsent && <p className="text-[11px] font-bold text-rose-400">⚠️ {errors.dpdpConsent}</p>}
          </div>

          {/* Submit Button & Trust Assurances */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>🛡️</span> 256-Bit SSL Encrypted &amp; Privacy Protected
                </p>
                <p className="text-[11px] text-slate-500">
                  Receipts are strictly used for vendor reconciliation. No phone spam or sales calls guaranteed.
                </p>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === "loading" ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting &amp; Verifying…</span>
                  </>
                ) : (
                  <span>🚀 Submit Cashback Claim</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Trust & Assurance 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="rounded-2xl border border-slate-800 bg-[#0d1d30]/60 p-4 space-y-1.5 text-center">
          <span className="text-xl">⚡</span>
          <h4 className="text-xs font-bold text-white">24-48 Hr Confirmation</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Claims are verified against vendor affiliate reports within 24-48 hrs.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0d1d30]/60 p-4 space-y-1.5 text-center">
          <span className="text-xl">🔒</span>
          <h4 className="text-xs font-bold text-white">30-Day Fraud Lock</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Cash is released once vendor 30-day refund guarantee window closes.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0d1d30]/60 p-4 space-y-1.5 text-center">
          <span className="text-xl">💸</span>
          <h4 className="text-xs font-bold text-white">Direct UPI Transfer</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">100% money sent with official bank UTR number directly to your UPI ID.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0d1d30]/60 p-4 space-y-1.5 text-center">
          <span className="text-xl">📞</span>
          <h4 className="text-xs font-bold text-white">24-Hr Human Support</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Direct support via <span className="text-sky-400 font-semibold">support@saaterra.in</span> with 24-hr resolution guarantee.</p>
        </div>
      </div>
    </div>
  );
}
