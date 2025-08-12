"use client";

import { X } from "lucide-react";

export default function QRCodeModal({ qr, onClose }: { qr: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg relative w-[350px] text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Scan to Download</h2>
        <img src={qr} alt="QR Code" className="mx-auto rounded-lg border border-gray-300" />
        <p className="text-sm text-gray-500 mt-3">Scan this QR code to download directly</p>
      </div>
    </div>
  );
}