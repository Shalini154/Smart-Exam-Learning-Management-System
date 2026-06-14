import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";

/* ================= GET ALL EXAMS ================= */
export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let exams;

        if (status) {
            exams = await Exam.find({ status }).sort({ createdAt: -1 });
        } else {
            exams = await Exam.find().sort({ createdAt: -1 });
        }

        return NextResponse.json(exams);
    } catch (error) {
        console.error("GET EXAMS ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch exams" },
            { status: 500 }
        );
    }
}

/* ================= CREATE EXAM ================= */
export async function POST(req: Request) {
    try {
        await connectDB();

        const {
            title,
            subject,
            recommendationVideo,
            totalQuestions,
            duration,
        } = await req.json();

        /* -------- VALIDATION -------- */
        if (
            !title ||
            !subject ||
            !recommendationVideo ||
            !totalQuestions ||
            !duration
        ) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        if (totalQuestions <= 0 || duration <= 0) {
            return NextResponse.json(
                { message: "Invalid values" },
                { status: 400 }
            );
        }

        /* -------- CREATE -------- */
        const exam = await Exam.create({
            title,
            subject,
            recommendationVideo,
            totalQuestions,
            duration,
            status: "inactive",
        });

        return NextResponse.json({
            message: "Exam created successfully",
            exam,
        });
    } catch (error) {
        console.error("CREATE EXAM ERROR:", error);

        return NextResponse.json(
            { message: "Failed to create exam" },
            { status: 500 }
        );
    }
}