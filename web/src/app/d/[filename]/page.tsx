"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileIcon,
  AlertCircle,
  Shield,
  Loader2,
  CheckCircle,
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type State = "loading" | "ready" | "downloading" | "done" | "error";

export default function DownloadPage() {
  const params = useParams();
  const slug = params?.filename as string;

  const [state, setState] = useState<State>("loading");
  const [fileInfo, setFileInfo] = useState<{
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchInfo = async () => {
      try {
        const res = await fetch(`/api/share/${encodeURIComponent(slug)}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error || "File not found");
          setState("error");
          return;
        }

        setFileInfo(data);
        setState("ready");

        // Auto-trigger download
        triggerDownload(data.url, data.originalName);
      } catch {
        setErrorMsg("Something went wrong. Please try again.");
        setState("error");
      }
    };

    fetchInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const triggerDownload = (url: string, name: string) => {
    setState("downloading");
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setState("done"), 1000);
  };

  const handleManualDownload = () => {
    if (!fileInfo) return;
    triggerDownload(fileInfo.url, fileInfo.originalName);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      {/* Ambient bg */}
      

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">
            VaultX
          </span>
        </a>
        <a
          href="/share"
          className="text-xs text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 rounded-full px-4 py-1.5"
        >
          Share your own file →
        </a>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Loading */}
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="w-9 h-9 text-white/40 animate-spin" />
                </div>
                <p className="text-white/40">Fetching your file...</p>
              </motion.div>
            )}

            {/* Ready / Downloading */}
            {(state === "ready" || state === "downloading" || state === "done") && fileInfo && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                {/* File card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 mb-6">
                  <motion.div
                    animate={
                      state === "downloading"
                        ? { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.8 } }
                        : {}
                    }
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-6"
                  >
                    {state === "done" ? (
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                    ) : (
                      <FileIcon className="w-10 h-10 text-violet-400" />
                    )}
                  </motion.div>

                  <h1 className="text-xl font-bold text-white mb-1 truncate px-2">
                    {fileInfo.originalName}
                  </h1>
                  <p className="text-white/40 text-sm mb-2">{formatBytes(fileInfo.size)}</p>
                  <span className="inline-block text-xs bg-white/[0.06] border border-white/10 rounded-full px-3 py-1 text-white/40 font-mono">
                    {slug}
                  </span>
                </div>

                {state === "done" ? (
                  <div className="space-y-3">
                    <p className="text-emerald-400 text-sm mb-4">
                      ✓ Download started successfully
                    </p>
                    <button
                      id="download-again-btn"
                      onClick={handleManualDownload}
                      className="w-full py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download again
                    </button>
                    <a
                      href="/share"
                      className="block w-full py-3 rounded-xl text-white/40 hover:text-white/60 transition-colors text-sm text-center"
                    >
                      Share your own file →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/40 text-sm">
                      {state === "downloading"
                        ? "Starting download..."
                        : "Your download should start automatically."}
                    </p>
                    <button
                      id="manual-download-btn"
                      onClick={handleManualDownload}
                      disabled={state === "downloading"}
                      className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {state === "downloading" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download File
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Error */}
            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">File Not Found</h1>
                <p className="text-white/50 mb-2 text-sm">{errorMsg}</p>
                <p className="text-white/30 text-xs mb-8 font-mono">/{slug}</p>

                <a
                  href="/share"
                  className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold transition-all text-sm"
                >
                  Share a file instead
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/20 text-xs border-t border-white/5">
        Powered by VaultX · Secure file sharing
      </footer>
    </div>
  );
}
