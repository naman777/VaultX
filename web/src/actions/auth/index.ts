"use server";
import bcrypt from "bcryptjs"; // Ensure you hash passwords before saving
import prisma from "@/lib/db";

const createUser = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) {
      return {
        success: false,
        message: "User already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred",
    };
  }
};

export {createUser};