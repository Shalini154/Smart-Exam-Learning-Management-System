import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function POST(req: Request) {
  try {
    const { name, email, password, course, batch } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All required fields missing" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      email,
      password: hashedPassword,
      course,
      batch,
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
