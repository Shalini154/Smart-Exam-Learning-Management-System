import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Question from "@/models/Question";

export async function POST(req: Request) {
    try {
        await connectDB();

        const { examId, questions } = await req.json();

        const formatted = questions.map((q: any) => ({
            examId: new mongoose.Types.ObjectId(examId),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            subTopic: q.subTopic,
            difficulty: q.difficulty,
            tags: q.tags,
            explanation: q.explanation,
            resourceLinks: q.resourceLinks,
            marks: q.marks,
            estimatedTime: q.estimatedTime,
            learningObjective: q.learningObjective,
        }));

        await Question.insertMany(formatted);

        return NextResponse.json({ message: "Questions added" });

    } catch (error) {
        console.error("BULK INSERT ERROR:", error);

        return NextResponse.json(
            { message: "Failed to add questions" },
            { status: 500 }
        );
    }
}