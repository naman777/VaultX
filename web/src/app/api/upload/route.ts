import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const r2 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "auto", // Region is optional for R2,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      file.size > 5 * 1024 * 1024 &&
      session.user.email !== "namankundra6@gmail.com"
    ) {
      // 5 MB in bytes
      return NextResponse.json(
        { success: false, error: "File size exceeds 5 MB" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const params = {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: file.name,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read", // Make the file publicly accessible
    };

    const result = await r2.upload(params).promise();

    const f = await prisma.file.create({
      data: {
        name: file.name,
        url: result.Location,
        createdAt: new Date(),
        user_id: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        file: {
          id: f.id,
          name: f.name,
          url: f.url,
          createdAt: f.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
