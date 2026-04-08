/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import AgreementEditor from "../../components/AgreementEditor";
import {
  Badge,
  Calendar,
  FileText,
  Hash,
  NotepadText,
  PenTool,
  Settings,
  User,
} from "lucide-react";
import SignaturePad from "../../components/SignaturePad";
import Image from "next/image";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";

const collaboratorRoles = [
  "Creator",
  "Editor",
  "Motion Designer",
  "Sound Engineer",
  "Producer",
  "Artist",
  "Contractor",
];

export default function CreateAgreement() {
  const [content, setContent] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleSignature = (sig: string) => {
    setSignature(sig);
    setShowSignatureModal(false);
  };

  async function handleSaveDraft() {
    try {
      const data = await apiFetch("/api/agreements", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          receiverEmail: collaboratorEmail,
          role,
        }),
      });

      alert("Draft saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save draft");
    }
  }

  async function handleSubmit() {
    try {
      const data = await apiFetch("/api/agreements", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          receiverEmail: collaboratorEmail,
          role,
          signature,
        }),
      });
      router.push("/my-agreements");
    } catch (err) {
      console.error(err);
      alert("Failed to send agreement");
    }
  }

  return (
    <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex justify-between p-10">
        <div>
          <h1 className="text-xl font-bold text-white">Create Agreement</h1>
          <p className="text-sm text-slate-400">
            Draft a new collaboration agreement
          </p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs text-white">
            <Settings size={14} />
            Manage Templates
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-linear-to-br from-blue-500 to-indigo-700 px-4 py-2 text-xs text-white">
            <NotepadText size={14} />
            Use Template
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 p-10">
        {/* LEFT MAIN SECTION */}
        <div className="col-span-2 space-y-6">
          {/* AGREEMENT CARD */}
          <div className="space-y-8 rounded-3xl border border-white/10 bg-slate-900 p-7 shadow-2xl">
            <div>
              <label className="text-slate-300">Agreement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Content Collaboration Agreement"
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white"
              />
            </div>

            <AgreementEditor
              content={content}
              onChange={(val) => setContent(val)}
            />

            <hr className="border-white/10" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-slate-300">Collaborator Email</label>
                <input
                  type="text"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300">Collaborator Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white"
                >
                  <option value="">Select role</option>
                  {collaboratorRoles.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SIGNATURE */}
            <div
              onClick={() => setShowSignatureModal(true)}
              className="cursor-pointer rounded-xl border border-purple-500/30 bg-purple-500/10 p-6 text-center text-purple-300 hover:bg-purple-500/20"
            >
              {signature ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={signature}
                    alt="Signature"
                    className="h-16 rounded-md border border-white/20 bg-white p-1"
                  />
                  <span className="text-sm text-green-400">
                    Signature Added ✓
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <PenTool />
                  <h3>Click to Sign Document</h3>
                  <p className="text-xs text-slate-400">
                    Required before sending
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleSaveDraft}
                className="rounded-lg border border-white/20 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Save Draft
              </button>

              <button
                onClick={handleSubmit}
                disabled={
                  !title ||
                  !content ||
                  !collaboratorEmail ||
                  !role ||
                  !signature
                }
                className={`rounded-lg px-5 py-2 text-sm font-medium ${
                  title && content && collaboratorEmail && role && signature
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "cursor-not-allowed bg-slate-700 text-slate-400"
                }`}
              >
                Send for Signature
              </button>
            </div>
          </div>
          {showSignatureModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              onClick={() => setShowSignatureModal(false)}
            >
              {" "}
              <div
                className="w-130 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {" "}
                <SignaturePad
                  onSave={handleSignature}
                  onCancel={() => setShowSignatureModal(false)}
                />{" "}
              </div>{" "}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* METADATA */}
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <h3 className="mb-6 text-lg font-semibold text-white">
              Agreement Metadata
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Created Date</p>
                  <p className="text-sm font-medium text-white">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Hash className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <div className="mt-1 inline-flex justify-center self-center rounded-lg border border-yellow-500/30 px-2 py-1 text-yellow-400">
                    {signature ? "Signed - Ready to Send" : "Draft"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <User className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Version</p>
                  <p className="text-sm font-medium text-white">1.0</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-orange-500/10 p-2">
                  <FileText className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Word Count</p>
                  <p className="text-sm font-medium text-white">
                    {
                      content
                        .replace(/<[^>]*>/g, " ")
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length
                    }{" "}
                    words
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-7">
            <h4 className="mb-2 text-sm font-semibold text-white">
              Tips for Great Agreements
            </h4>

            <ul className="space-y-2 text-xs text-slate-300">
              <li>• Be clear about deliverables</li>
              <li>• Include timeline</li>
              <li>• Define payment terms</li>
              <li>• Address IP rights</li>
              <li>• Include dispute process</li>
              <li>• Review before signing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
