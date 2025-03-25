"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Download, Copy, Upload, File, Router } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BeatLoader, ClipLoader } from "react-spinners";
import { getFiles } from "@/actions/data";

interface File {
  id: string;
  name: string;
  url?: string;
  createdAt: Date;
  updatedAt?: Date;
  user_id?: string;
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9), // Temporary ID
      name: file.name,
      createdAt: new Date(),
    }));
    // @ts-ignore
    setFiles((prevFiles) => [...newFiles, ...prevFiles]); // Temporarily add files for UI feedback

    setFileUploading(true);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      //@ts-ignore
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name
                ? { ...f, id: data.id, url: data.url } // Replace temporary entry with uploaded file details
                : f
            )
          );
          toast.success("File uploaded successfully!");
        } else {
          toast.error(`Failed to upload ${file.name}.`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}. ${error}`);
      }
    }

    setFileUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    //@ts-ignore
    onDrop,
  });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("The file URL has been copied to your clipboard.");
  };

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    setLoading(false);
    if (!session) {
      // toast.error("You need to be logged in to access this page.");
      router.push("/signin");
      return;
    } else {
      const fetchData = async () => {
        const res = await getFiles(session.user.email);
        if (res.success) {
          setFiles(res.files?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || []);

        }
      };

      fetchData();
      return;
    }
  }, [session, status]);

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

  if (loading) {
    return (
      <>
        <div className="bg-[rgba(0,0,0,0.5)] flex justify-center items-center h-screen w-screen fixed top-0 left-0">
      <BeatLoader  />
    </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Your Files
        </h1>

        <div>
          <Button
            size="lg"
            onClick={() => {
              signOut();
            }}
            variant="destructive"
          >
            Sign Out
          </Button>
        </div>
      </div>
      {/*@ts-ignore*/}
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 mb-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 hover:border-gray-500"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background:
            "linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(30,41,59,0.3) 100%)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          backdropFilter: "blur(4px)",
        }}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-16 w-16 text-blue-400 mb-6" />
        {isDragActive ? (
          <p className="text-xl font-semibold text-blue-400">
            Drop the files here ...
          </p>
        ) : (
          <p className="text-xl font-semibold">
            Drag 'n' drop some files here, or click to select files
          </p>
        )}
      </motion.div>

      {fileUploading && (
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl p-4 mb-8">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-400" />
            <p className="font-medium">Uploading files...</p>
            <ClipLoader color="#0BAADD" size={20} />
          </div>
        </div>
      )}

      <div
        className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background:
            "linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 100%)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300" key={1}>
                Name
              </TableHead>
              <TableHead className="text-gray-300" key={2}>
                Date Uploaded
              </TableHead>
              <TableHead className="text-gray-300" key={3}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files &&
              files.length > 0 &&
              files.map((file) => (
                <TableRow
                  key={file.id}
                  className="hover:bg-gray-700/50 transition-colors"
                >
                  <TableCell className="font-medium flex items-center">
                    <File className="h-5 w-5 mr-2 text-blue-400" />
                    {file.name}
                  </TableCell>
                  <TableCell>{file.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                        onClick={() => handleDownload(file.name)} // Pass the file name
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        onClick={() =>
                          //@ts-ignore
                          copyToClipboard(file.url)
                        }
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

            {(!files || files.length === 0) && (
              <TableRow key={0}>
                <TableCell colSpan={3} className="text-center">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
