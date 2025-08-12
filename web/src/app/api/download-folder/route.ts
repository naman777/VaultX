import AWS from "aws-sdk";
import prisma from "@/lib/db";
import JSZip from "jszip";

const r2 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4",
});

export async function POST(req: Request) {
  const { folderId } = await req.json();

  if (!folderId) {
    return new Response("Folder ID is required", { status: 400 });
  }

  try {
    // 1. Get all files in the folder
    const files = await prisma.file.findMany({
      where: { folder_id: folderId },
    });

    if (files.length === 0) {
      return new Response("No files in folder", { status: 404 });
    }

    // 2. Create a ZIP
    const zip = new JSZip();

    for (const file of files) {
      const fileData = await r2
        .getObject({
          Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
          Key: file.name,
        })
        .promise();

      if (fileData.Body) {
        zip.file(file.name, fileData.Body as Buffer);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="folder-${folderId}.zip"`,
      },
    });
  } catch (error) {
    console.error("Error zipping folder:", error);
    return new Response("Failed to download folder", { status: 500 });
  }
}