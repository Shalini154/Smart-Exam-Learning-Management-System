import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await connectDB();

    const questions = await Question.find({
      examId: new mongoose.Types.ObjectId(params.examId),
    }).select("-correctAnswer -explanation -resourceLinks");

    return NextResponse.json(questions);
  } catch (error) {
    console.error("FETCH QUESTIONS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}