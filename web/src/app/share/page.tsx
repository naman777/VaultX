"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle,
  XCircle,
  Link,
  Copy,
  Loader2,
  File as FileIcon,
  Shield,
  Zap,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function SharePage() {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const checkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      // Auto-suggest a slug from filename
      const suggested = acceptedFiles[0].name
        .replace(/\.[^/.]+$/, "") // remove extension
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 50);
      setSlug(suggested);
      setSlugStatus("idle");
      setUploaded(false);
      setDownloadUrl("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => toast.error("File must be under 50 MB"),
  });

  // Debounced slug check
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      setSlugError("");
      return;
    }

    const slugRegex = /^[a-zA-Z0-9._-]{1,100}$/;
    if (!slugRegex.test(slug)) {
      setSlugStatus("invalid");
      setSlugError("Only letters, numbers, hyphens, underscores, dots allowed");
      return;
    }

    setSlugStatus("checking");
    setSlugError("");

    if (checkTimeout.current) clearTimeout(checkTimeout.current);
    checkTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/share/check?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.error) {
          setSlugStatus("invalid");
          setSlugError(data.error);
        } else {
          setSlugStatus(data.available ? "available" : "taken");
          if (!data.available) setSlugError("This name is already taken");
        }
      } catch {
        setSlugStatus("idle");
      }
    }, 500);

    return () => {
      if (checkTimeout.current) clearTimeout(checkTimeout.current);
    };
  }, [slug]);

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file");
    if (!slug) return toast.error("Please enter a unique name");
    if (slugStatus !== "available") return toast.error("Choose an available unique name");

    setUploading(true);
    setUploadProgress(0);

    // Animate progress (simulated)
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const res = await fetch("/api/share/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      const fullUrl = `${window.location.origin}/d/${slug}`;
      setDownloadUrl(fullUrl);
      setUploaded(true);
      toast.success("File uploaded! Share the link.");
    } catch {
      clearInterval(interval);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    toast.success("Link copied to clipboard!");
  };

  const reset = () => {
    setFile(null);
    setSlug("");
    setSlugStatus("idle");
    setSlugError("");
    setUploaded(false);
    setDownloadUrl("");
    setUploadProgress(0);
  };

  const slugStatusIcon = () => {
    switch (slugStatus) {
      case "checking":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case "available":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "taken":
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-hidden">
      {/* Ambient background */}
   

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
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Lock className="w-3 h-3" />
          No sign-up required
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-6">
              <Zap className="w-3 h-3" />
              Instant file sharing — no account needed
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60 mb-4 leading-tight">
              Share a File,<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
                Your Way
              </span>
            </h1>
            <p className="text-white/50 text-base">
              Upload any file, pick a memorable name, and share it instantly.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!uploaded ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                      ? "border-violet-500 bg-violet-500/10 scale-[1.02]"
                      : file
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <input {...getInputProps()} />
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <FileIcon className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                          <p className="text-white/40 text-sm mt-1">{formatBytes(file.size)}</p>
                        </div>
                        <p className="text-white/30 text-xs">Click or drag to replace</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="drop-prompt"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Upload className="w-7 h-7 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-white/80 font-medium">
                            {isDragActive ? "Drop it here!" : "Drag & drop your file"}
                          </p>
                          <p className="text-white/30 text-sm mt-1">
                            or click to browse · max 50 MB
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Slug input */}
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                  <label className="block text-sm font-medium text-white/60 mb-3">
                    Choose a unique name for your file
                  </label>
                  <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                    <span className="text-white/30 text-sm shrink-0 font-mono">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/d/`
                        : "vaultx.app/d/"}
                    </span>
                    <input
                      id="slug-input"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="my-awesome-file"
                      className="flex-1 bg-transparent text-white placeholder-white/20 outline-none font-mono text-sm min-w-0"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <div className="shrink-0">{slugStatusIcon()}</div>
                  </div>
                  <AnimatePresence>
                    {slugError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-red-400 text-xs mt-2"
                      >
                        {slugError}
                      </motion.p>
                    )}
                    {slugStatus === "available" && !slugError && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-emerald-400 text-xs mt-2"
                      >
                        ✓ This name is available!
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-white/25 text-xs mt-3">
                    Letters, numbers, hyphens, underscores, and dots only · 1–100 chars
                  </p>
                </div>

                {/* Upload progress */}
                <AnimatePresence>
                  {uploading && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white/[0.03] border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/60">Uploading...</span>
                        <span className="text-white/40 font-mono">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload button */}
                <button
                  id="upload-btn"
                  onClick={handleUpload}
                  disabled={uploading || !file || slugStatus !== "available"}
                  className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload & Get Link
                    </>
                  )}
                </button>

                {/* Info pills */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {["No sign-up", "50 MB limit", "Instant link", "Public access"].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-white/30 border border-white/10 rounded-full px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Success state */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">File Uploaded!</h2>
                  <p className="text-white/50 mb-8 text-sm">
                    Share this link — anyone with it can download your file.
                  </p>

                  {/* Link display */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 mb-4 text-left">
                    <Link className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="text-white/70 text-sm font-mono truncate flex-1">
                      {downloadUrl}
                    </span>
                    <button
                      id="copy-link-btn"
                      onClick={copyLink}
                      className="shrink-0 p-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-violet-300" />
                    </button>
                  </div>

                  <button
                    onClick={copyLink}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold transition-all mb-3 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>

                  <button
                    id="upload-another-btn"
                    onClick={reset}
                    className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all text-sm"
                  >
                    Upload another file
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
