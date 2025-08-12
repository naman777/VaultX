import AWS from "aws-sdk";
import prisma from "@/lib/db";

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
    const files = await prisma.file.findMany({
      where: { folder_id: folderId },
    });

    const urls = files.map((file) => ({
      name: file.name,
      url: r2.getSignedUrl("getObject", {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        Key: file.name,
        Expires: 60 * 5,
      }),
    }));

    return new Response(JSON.stringify({ urls }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating folder URLs:", error);
    return new Response("Failed to get folder URLs", { status: 500 });
  }
}