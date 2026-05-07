import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import prisma from "@/lib/db";

const r2 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "auto",
});

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB for anonymous uploads

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!slug || slug.trim().length === 0) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    // Validate slug
    const slugRegex = /^[a-zA-Z0-9._-]{1,100}$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug. Use letters, numbers, hyphens, underscores, or dots only." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50 MB limit" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.shared_file.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "This name is already taken. Please choose another." },
        { status: 409 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store with a prefixed key to avoid collisions with auth uploads
    const storageKey = `shared/${slug}`;

    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: storageKey,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    };

    await r2.upload(params).promise();

    await prisma.shared_file.create({
      data: {
        slug,
        storage_key: storageKey,
        original_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
      },
    });

    return NextResponse.json(
      {
        success: true,
        slug,
        downloadUrl: `/d/${slug}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Share upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
