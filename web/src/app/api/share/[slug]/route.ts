import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import prisma from "@/lib/db";

const r2 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4",
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const record = await prisma.shared_file.findUnique({ where: { slug } });

  if (!record) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const signedUrl = r2.getSignedUrl("getObject", {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: record.storage_key,
      Expires: 60 * 10, // 10 minutes
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(record.original_name)}"`,
    });

    // Return file info + signed URL for the download page to use
    return NextResponse.json({
      url: signedUrl,
      originalName: record.original_name,
      mimeType: record.mime_type,
      size: record.size,
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link" },
      { status: 500 }
    );
  }
}
