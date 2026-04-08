"use client";

import { Check, Trash2 } from "lucide-react";
import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface Props {
  onSave: (signature: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: Props) {
  const sigRef = useRef<SignatureCanvas | null>(null);

  const clear = () => {
    sigRef.current?.clear();
  };

  const save = () => {
    if (sigRef.current?.isEmpty()) {
      alert("Please provide a signature");
      return;
    }

    const dataUrl = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");

    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Sign Document</h1>

      <p className="text-sm text-slate-400">Untitled Agreement</p>

      <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm text-indigo-200">
        By signing this document, you agree that your electronic signature is
        legally binding and has the same effect as a handwritten signature.
      </div>

      <SignatureCanvas
        ref={sigRef}
        penColor="black"
        canvasProps={{
          className:
            "w-full h-[200px] bg-white rounded-lg border border-white/20",
        }}
      />

      <div className="flex justify-end">
        <button
          onClick={clear}
          className="flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700"
        >
          <Trash2 size={16} />
          Clear
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="w-full rounded-lg bg-slate-700 px-4 py-2 text-white"
        >
          Cancel
        </button>

        <button
          onClick={save}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          <Check size={16} />
          Confirm Signature
        </button>
      </div>
    </div>
  );
}
