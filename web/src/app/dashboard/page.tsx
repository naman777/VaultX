"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Download, Copy, Upload, File, FolderPlus, Folder, Trash, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BeatLoader, ClipLoader } from "react-spinners";
import { getFiles, createFolder, deleteFile, deleteFolder, uploadFile } from "@/actions/data";
import QRCodeModal from "@/components/QrCodeModal";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;
    const res = await getFiles(session.user.email, currentFolder || undefined);
    if (res.success) {
      setFiles(res.files);
      setFolders(res.folders);
    }
  }, [session, currentFolder]);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }
    setLoading(false);
    if (!session) {
      router.push("/signin");
      return;
    }
    fetchData();
  }, [session, status, fetchData]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return toast.error("Folder name required");
    const res = await createFolder(session.user.email, folderName, currentFolder || undefined);
    if (res.success) {
      toast.success("Folder created");
      setFolderName("");
      fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!session?.user?.email) {
        toast.error("You must be logged in to upload files");
        return;
      }

      setFileUploading(true);
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }

          const data = await response.json();
          if (!data?.file.url) {
            toast.error(`Upload failed: No URL returned for ${file.name}`);
            continue;
          }

          const res = await uploadFile(
            session.user.email,
            file.name,
            data.file.url,
            currentFolder || undefined
          );

          if (res.success) {
            toast.success(`${file.name} uploaded`);
          } else {
            toast.error(res.message);
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error(`Error uploading ${file.name}`);
        }
      }
      setFileUploading(false);
      fetchData();
    },
    [session, currentFolder, fetchData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDeleteFile = async (id: string) => {
    const res = await deleteFile(id);
    if (res.success) {
      toast.success("File deleted");
      fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    const res = await deleteFolder(id);
    if (res.success) {
      toast.success("Folder deleted");
      fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const handleDownload = async (fileName: string) => {
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch the signed URL");
      }

      const { url } = await response.json();

      // Trigger file download
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download the file.");
    }
  };

  const showQR = async (url: string) => {
    const res = await fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    setQrCode(data.qr);
  };

  // For file QR
  const handleFileQR = async (fileName: string) => {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName }),
    });
    const data = await res.json();
    if (data.url) {
      showQR(data.url);
    }
  };

  // For folder QR (ZIP)
  const handleFolderQR = async (folderId: string) => {
    const zipUrl = `${window.location.origin}/api/download-folder?folderId=${folderId}`;
    showQR(zipUrl);
  };

  if (loading) {
    return (
      <div className="bg-[rgba(0,0,0,0.5)] flex justify-center items-center h-screen w-screen fixed top-0 left-0">
        <BeatLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          {currentFolder ? "Folder Contents" : "Your Files"}
        </h1>
        <Button size="lg" onClick={() => signOut()} variant="destructive">
          Sign Out
        </Button>
      </div>

      {/* Create Folder */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="px-3 py-2 rounded bg-gray-700 text-white"
        />
        <Button onClick={handleCreateFolder}>
          <FolderPlus className="h-4 w-4 mr-2" /> Create Folder
        </Button>
      </div>

      {/* Upload */}
      <motion.div
        {...getRootProps({})}
        className={`border-2 border-dashed rounded-2xl p-12 mb-12 text-center cursor-pointer transition-all ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-16 w-16 text-blue-400 mb-6" />
        {isDragActive ? <p>Drop files here...</p> : <p>Drag & drop or click to upload</p>}
      </motion.div>

      {fileUploading && (
        <div className="bg-gray-800 rounded-2xl p-4 mb-8 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-400" />
          <p>Uploading files...</p>
          <ClipLoader color="#0BAADD" size={20} />
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 bg-gray-800 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-700"
              >
                <div onClick={() => setCurrentFolder(folder.id)} className="flex items-center gap-2">
                  <Folder className="text-yellow-400" />
                  {folder.name}
                </div>
                <Trash
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDeleteFolder(folder.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {/* Table */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Date Created</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Folders */}
            {folders.length > 0 &&
              folders.map((folder) => (
                <tr key={folder.id} className="border-b border-gray-700">
                  <td
                    className="p-3 flex items-center cursor-pointer"
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <Folder className="h-5 w-5 mr-2 text-yellow-400" />
                    {folder.name}
                  </td>
                  <td className="p-3">
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentFolder(folder.id)}
                      className="text-black"
                    >
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFolder(folder.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>



                    <Button
                      size="sm"
                      onClick={async () => {
                        const res = await fetch("/api/download-folder", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ folderId: folder.id }),
                        });
                        if (res.ok) {
                          const blob = await res.blob();
                          const link = document.createElement("a");
                          link.href = URL.createObjectURL(blob);
                          link.download = `${folder.name}.zip`;
                          link.click();
                        } else {
                          toast.error("Failed to download folder");
                        }
                      }}
                    >
                      Download ZIP
                    </Button>


                    <Button size="sm" onClick={() => handleFolderQR(folder.id)}>
                      <QrCode className="h-4 w-4 mr-2" /> QR
                    </Button>
                  </td>
                </tr>
              ))}

            {/* Files */}
            {files.length > 0 &&
              files.map((file) => (
                <tr key={file.id} className="border-b border-gray-700">
                  <td className="p-3 flex items-center">
                    <File className="h-5 w-5 mr-2 text-blue-400" />
                    {file.name}
                  </td>
                  <td className="p-3">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">

                    <Button size="sm" onClick={() => handleFileQR(file.name)}>
                      <QrCode className="h-4 w-4 mr-2" /> QR
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      onClick={() => handleDownload(file.name)} // Pass the file name
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}

            {/* Empty State */}
            {folders.length === 0 && files.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-3">
                  No folders or files found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {qrCode && <QRCodeModal qr={qrCode} onClose={() => setQrCode(null)} />}
    </div>
  );
}