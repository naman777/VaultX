import QRCode from "qrcode";

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(url);
    return new Response(JSON.stringify({ qr: qrDataUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("QR code generation error:", error);
    return new Response("Failed to generate QR code", { status: 500 });
  }
}