'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Download, Copy, Upload, File, Router } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BeatLoader } from "react-spinners";


// Mock data based on the provided model
const mockFiles = [
  { id: '1', name: 'document.pdf', url: 'https://example.com/document.pdf', createdAt: new Date('2023-01-01') },
  { id: '2', name: 'image.jpg', url: 'https://example.com/image.jpg', createdAt: new Date('2023-01-02') },
  { id: '3', name: 'spreadsheet.xlsx', url: 'https://example.com/spreadsheet.xlsx', createdAt: new Date('2023-01-03') },
]

export default function Dashboard() {
  const [files, setFiles] = useState(mockFiles);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Here you would typically upload the files to your backend
    // For this example, we'll just add them to the list with mock URLs
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      createdAt: new Date()
    }))
    setFiles(prevFiles => [...newFiles, ...prevFiles])
    // toast({
    //   title: "Files uploaded",
    //   description: `${acceptedFiles.length} file(s) have been uploaded successfully.`,
    // })
    toast.success(`${acceptedFiles.length} file(s) have been uploaded successfully.`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    // toast({
    //   title: "URL Copied",
    //   description: "The file URL has been copied to your clipboard.",
    // })

    toast.success("The file URL has been copied to your clipboard.")
  }

  const {data:session, status} = useSession();
  const router = useRouter();
  useEffect(()=>{

    if(status === "loading"){
        setLoading(true);
        return;
    }

    setLoading(false);
    if(!session){
        toast.error("You need to be logged in to access this page.")
        router.push("/signin")
        return;
    }
  },[session,status])

  if(loading){
    return <>
        <div className="bg-[rgba(0,0,0,0.5)] flex justify-center items-center h-screen w-screen fixed top-0 left-0">
      <BeatLoader color="#0BAADD" />
    </div>
    </>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        Your Files
      </h1>
      {/*@ts-ignore*/ }
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 mb-12 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: 'linear-gradient(145deg, rgba(30,41,59,0.7) 0%, rgba(30,41,59,0.3) 100%)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-16 w-16 text-blue-400 mb-6" />
        {isDragActive ? (
          <p className="text-xl font-semibold text-blue-400">Drop the files here ...</p>
        ) : (
          <p className="text-xl font-semibold">Drag 'n' drop some files here, or click to select files</p>
        )}
      </motion.div>

      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl" 
           style={{
             background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 100%)',
             boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
             backdropFilter: 'blur(4px)',
           }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Date Uploaded</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id} className="hover:bg-gray-700/50 transition-colors">
                <TableCell className="font-medium flex items-center">
                  <File className="h-5 w-5 mr-2 text-blue-400" />
                  {file.name}
                </TableCell>
                <TableCell>{file.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                            onClick={() => {
                                
                            }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" 
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                            onClick={() => copyToClipboard(file.url)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-12 bg-gray-800 rounded-2xl p-6 shadow-2xl" 
           style={{
             background: 'linear-gradient(145deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.6) 100%)',
             boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
             backdropFilter: 'blur(4px)',
           }}>
        <h2 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Storage Usage
        </h2>
      </div>
    </div>
  )
}

