import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug || slug.trim().length === 0) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Validate slug: alphanumeric, hyphens, underscores, dots only
  const slugRegex = /^[a-zA-Z0-9._-]{1,100}$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json(
      { available: false, error: "Invalid characters. Use letters, numbers, hyphens, underscores, or dots only." },
      { status: 200 }
    );
  }

  const existing = await prisma.shared_file.findUnique({
    where: { slug },
  });

  return NextResponse.json({ available: !existing });
}
