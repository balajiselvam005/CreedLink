"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (skill: string) => void;
}

export default function AddSkillModal({ open, onClose, onAdd }: Props) {
  const [skill, setSkill] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Add Skill</h3>
          <button onClick={onClose}>
            <X className="text-slate-400 hover:text-white" size={18} />
          </button>
        </div>

        {/* Input */}
        <input
          autoFocus
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="e.g Video Editing"
          className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
        />

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!skill.trim()) return;
              onAdd(skill);
              setSkill("");
              onClose();
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Add Skill
          </button>
        </div>
      </div>
    </div>
  );
}
