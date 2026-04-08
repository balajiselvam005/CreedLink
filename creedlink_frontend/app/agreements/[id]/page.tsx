/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  FileText,
  Calendar,
  User,
  Download,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import Button from "@/app/components/ui/Button";
import SignaturePad from "@/app/components/SignaturePad";

interface Agreement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  senderSigned: boolean;
  receiverSigned: boolean;
  senderSignature?: string;
  receiverSignature?: string;
  sender: { email: string };
  receiver: { email: string };
  hash?: string;
}

export default function AgreementViewer() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { user } = useAuth();

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [confirmedSignature, setConfirmedSignature] = useState<string | null>(
    null,
  );

  const agreementRef = useRef<HTMLDivElement>(null);

  /* ---------------- LOAD AGREEMENT ---------------- */

  const loadAgreement = async () => {
    const data = await apiFetch(`/api/agreements/${id}`);
    setAgreement(data);
  };

  useEffect(() => {
    const loadAgreement = async () => {
      const data = await apiFetch(`/api/agreements/${id}`);
      setAgreement(data);
    };
    loadAgreement();
  }, [id]);

  /* ---------------- TIPTAP VIEWER ---------------- */

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: "",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || !agreement?.content) return;

    let parsedContent;
    try {
      parsedContent =
        typeof agreement.content === "string"
          ? JSON.parse(agreement.content)
          : agreement.content;
    } catch {
      parsedContent = agreement.content;
    }

    editor.commands.setContent(parsedContent);
  }, [editor, agreement]);

  /* ---------------- DOWNLOAD PDF ---------------- */

  const downloadPDF = async () => {
    const element = agreementRef.current;
    if (!element) return;

    // Clone the element into an offscreen container
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = element.offsetWidth + "px";
    clone.style.backgroundColor = "#ffffff";
    clone.style.color = "#000000";
    document.body.appendChild(clone);

    // Walk all elements in the clone and strip unsupported color values
    const allEls = clone.querySelectorAll("*");
    allEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);

      // List of color properties to sanitize
      const colorProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderBottomColor",
        "borderLeftColor",
        "borderRightColor",
        "outlineColor",
        "textDecorationColor",
      ];

      colorProps.forEach((prop) => {
        const value = computed[prop as any];
        // If it contains modern color functions, replace with safe fallback
        if (
          value &&
          (value.includes("lab(") ||
            value.includes("lch(") ||
            value.includes("oklch(") ||
            value.includes("oklab(") ||
            value.includes("color(") ||
            value.includes("color-mix("))
        ) {
          htmlEl.style[prop as any] = prop.toLowerCase().includes("background")
            ? "#ffffff"
            : "#000000";
        }
      });
    });

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${agreement?.title ?? "agreement"}.pdf`);
    } finally {
      // Always clean up the clone
      document.body.removeChild(clone);
    }
  };

  /* ---------------- SIGN AGREEMENT ---------------- */

  const handleSignature = (signature: string) => {
    setConfirmedSignature(signature);
    setShowSignatureModal(false);
  };

  const submitSignature = async () => {
    if (!confirmedSignature) return;

    await apiFetch(`/api/agreements/${agreement?.id}/sign`, {
      method: "POST",
      body: JSON.stringify({ signature: confirmedSignature }),
    });

    await loadAgreement();
    setConfirmedSignature(null);
  };

  /* ---------------- VERIFY AGREEMENT ---------------- */

  const verifyAgreement = async () => {
    const result = await apiFetch(`/api/agreements/${agreement?.id}/verify`);
    setVerification(result);
  };

  if (!agreement) {
    return <div className="p-10 text-slate-400">Loading agreement...</div>;
  }

  const isReceiver = user?.email === agreement.receiver.email;

  const status =
    agreement.senderSigned && agreement.receiverSigned
      ? "Completed"
      : agreement.senderSigned
        ? "Waiting for Receiver"
        : "Draft";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/my-agreements")}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to My Agreements
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white hover:bg-white/5"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {/* AGREEMENT HEADER */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {agreement.title}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Agreement ID: {agreement.id}
              </p>
            </div>

            <span className="rounded-full border border-yellow-500/30 bg-yellow-500/20 px-3 py-1 text-xs text-yellow-400">
              {status}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-400" size={18} />
              <div>
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm text-white">
                  {new Date(agreement.createdAt).toDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="text-blue-400" size={18} />
              <div>
                <p className="text-xs text-slate-400">Collaborator</p>
                <p className="text-sm text-white">{agreement.receiver.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="text-green-400" size={18} />
              <div>
                <p className="text-xs text-slate-400">Version</p>
                <p className="text-sm text-white">1.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* PDF CAPTURE AREA — white background, clean layout */}
        <div
          ref={agreementRef}
          className="rounded-3xl bg-white p-10 text-black shadow-xl"
        >
          {/* PDF Header */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {agreement.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Agreement ID: {agreement.id}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Created: {new Date(agreement.createdAt).toDateString()}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Between:{" "}
              <span className="font-medium">{agreement.sender.email}</span> and{" "}
              <span className="font-medium">{agreement.receiver.email}</span>
            </p>
          </div>

          {/* PDF Content */}
          <EditorContent
            editor={editor}
            className="prose max-w-none text-gray-800"
          />

          {/* PDF Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-10 border-t border-gray-200 pt-6">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                Sender Signature
              </p>
              {agreement.senderSignature ? (
                <img
                  src={agreement.senderSignature}
                  className="h-20 rounded border border-gray-200 p-1"
                />
              ) : (
                <p className="text-sm text-gray-400">Not signed</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {agreement.sender.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-500">
                Receiver Signature
              </p>
              {agreement.receiverSignature ? (
                <img
                  src={agreement.receiverSignature}
                  className="h-20 rounded border border-gray-200 p-1"
                />
              ) : (
                <p className="text-sm text-gray-400">Not signed yet</p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                {agreement.receiver.email}
              </p>
            </div>
          </div>
        </div>

        {/* SIGNATURE DISPLAY — UI only, not in PDF */}
        <div className="grid grid-cols-2 gap-6">
          {!isReceiver && (
            <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
              <p className="mb-3 text-sm text-slate-400">Sender Signature</p>
              {agreement.senderSignature ? (
                <img
                  src={agreement.senderSignature}
                  className="h-20 rounded-lg border border-white/20 bg-white p-2"
                />
              ) : (
                <p className="text-slate-500">Not signed</p>
              )}
            </div>
          )}

          <div
            className={`rounded-3xl border border-white/10 bg-slate-900 p-6 ${isReceiver ? "col-span-2" : ""}`}
          >
            <p className="mb-3 text-sm text-slate-400">
              {isReceiver ? "Your Signature" : "Receiver Signature"}
            </p>

            {agreement.receiverSigned ? (
              <img
                src={agreement.receiverSignature}
                className="h-20 rounded-lg border border-white/20 bg-white p-2"
              />
            ) : confirmedSignature ? (
              <div className="space-y-3">
                <img
                  src={confirmedSignature}
                  className="h-20 rounded-lg border border-white/20 bg-white p-2"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-950 py-2 text-white hover:bg-white/5"
                  >
                    Redo
                  </button>
                  <button
                    onClick={submitSignature}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 py-2 text-white"
                  >
                    Submit Signature
                  </button>
                </div>
              </div>
            ) : isReceiver ? (
              <Button onClick={() => setShowSignatureModal(true)}>
                Sign Now
              </Button>
            ) : (
              <p className="text-slate-500">Waiting for collaborator</p>
            )}
          </div>
        </div>

        {/* SIGNATURE MODAL */}
        {showSignatureModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowSignatureModal(false)}
          >
            <div
              className="w-130 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SignaturePad
                onSave={handleSignature}
                onCancel={() => setShowSignatureModal(false)}
              />
            </div>
          </div>
        )}

        {/* AGREEMENT VERIFICATION */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Agreement Verification
            </h3>

            <button
              onClick={verifyAgreement}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white"
            >
              <ShieldCheck size={16} />
              Verify Agreement
            </button>
          </div>

          {verification && (
            <div className="mt-4 rounded-lg border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Agreement ID: {verification.agreementId}
              </p>

              <p
                className={`mt-2 text-sm ${
                  verification.valid ? "text-green-400" : "text-red-400"
                }`}
              >
                {verification.valid
                  ? "✔ Agreement Verified"
                  : "❌ Agreement Modified"}
              </p>

              <p className="mt-2 font-mono text-xs break-all text-purple-400">
                {verification.storedHash}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
