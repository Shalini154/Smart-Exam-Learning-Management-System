import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import Attempt from "@/models/Attempt";

export async function GET(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await connectDB();

    const userId = req.headers.get("user-id"); // 🔥 from frontend

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* -------- Find Exam -------- */
    const exam = await Exam.findById(
      new mongoose.Types.ObjectId(params.examId)
    );

    if (!exam || exam.status !== "active") {
      return NextResponse.json(
        { message: "Exam not available" },
        { status: 403 }
      );
    }

    /* -------- Check Attempt -------- */
    const attempt = await Attempt.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      examId: new mongoose.Types.ObjectId(params.examId),
    });

    if (attempt) {
      return NextResponse.json(
        { message: "You already attempted this exam" },
        { status: 403 }
      );
    }

    /* -------- Return Exam -------- */
    return NextResponse.json(exam);

  } catch (error) {
    console.error("FETCH EXAM ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}