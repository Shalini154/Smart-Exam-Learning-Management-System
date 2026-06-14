import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";

export async function GET() {
  try {
    await connectDB();

    const exams = await Exam.find({ status: "active" }).sort({
      createdAt: -1,
    });

    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
