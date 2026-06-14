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

        console.log("FETCH examId:", params.examId);

        const questions = await Question.find({
            examId: new mongoose.Types.ObjectId(params.examId), // ✅ FIX
        });

        console.log("FOUND QUESTIONS:", questions.length);

        return NextResponse.json(questions);

    } catch (error) {
        console.error("FETCH ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch questions" },
            { status: 500 }
        );
    }
}