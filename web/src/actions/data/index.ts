"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getFiles = async (email: string, folderId?: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return { success: false, message: "User not found" };

    const folders = await prisma.folder.findMany({
      where: {
        user_id: user.id,
        parent_id: folderId || null,
      },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });

    const files = await prisma.file.findMany({
      where: {
        user_id: user.id,
        folder_id: folderId || null,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, folders, files };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to fetch files" };
  }
};


export const createFolder = async (
  email: string,
  name: string,
  parentId?: string
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return { success: false, message: "User not found" };

    const folder = await prisma.folder.create({
      data: {
        name,
        user_id: user.id,
        parent_id: parentId || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, folder };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to create folder" };
  }
};

// Upload file
export const uploadFile = async (
  email: string,
  name: string,
  url: string,
  folderId?: string
) => {
  if (!email || !name || !url) {
    throw new Error("Missing required parameters for uploadFile");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return { success: false, message: "User not found" };

    const file = await prisma.file.create({
      data: {
        name,
        url,
        user_id: user.id,
        folder_id: folderId || null,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, file };
  } catch (error) {
    console.error("Upload file error:", error);
    return { success: false, message: "Failed to upload file" };
  }
};

// Delete file
export const deleteFile = async (fileId: string) => {
  try {
    await prisma.file.delete({ where: { id: fileId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete file" };
  }
};

// Delete folder (and its contents)
export const deleteFolder = async (folderId: string) => {
  try {
    // Delete files in folder
    await prisma.file.deleteMany({ where: { folder_id: folderId } });
    // Delete subfolders recursively
    await prisma.folder.delete({ where: { id: folderId } });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete folder" };
  }
};