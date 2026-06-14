import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("cookie")
      ?.split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);

    await connectDB();

    const student = await Student.findById(decoded.id).select("-password");

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
