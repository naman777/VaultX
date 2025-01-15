import AWS from "aws-sdk";

const r2 = new AWS.S3({
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "auto",
  signatureVersion: "v4", // Ensure SigV4 is used

});

export async function POST(req: Request) {
  const { fileName } = await req.json();

  if (!fileName) {
    return new Response("File name is required", { status: 400 });
  }

  try {
    const signedUrl = r2.getSignedUrl("getObject", {
      Bucket: process.env.CLOUDFLARE_R2_BUCKET,
      Key: fileName, // File key in the bucket
      Expires: 60 * 5, // URL validity (e.g., 5 minutes)
    });

    return new Response(JSON.stringify({ url: signedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return new Response("Failed to generate signed URL", { status: 500 });
  }
}
