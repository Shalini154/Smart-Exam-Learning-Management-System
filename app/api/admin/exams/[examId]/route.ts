import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";

/* ================= GET SINGLE EXAM ================= */

export async function GET(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        await connectDB();

        const { examId } = await params;

        const exam = await Exam.findById(examId);

        if (!exam) {
            return NextResponse.json(
                { message: "Exam not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(exam);
    } catch (error) {
        console.error("GET EXAM ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch exam" },
            { status: 500 }
        );
    }
}

/* ================= UPDATE EXAM ================= */

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        await connectDB();

        const { examId } = await params;

        const {
            title,
            subject,
            recommendationVideo,
            duration,
            totalQuestions,
        } = await req.json();

        if (
            !title ||
            !subject ||
            !duration ||
            !totalQuestions
        ) {
            return NextResponse.json(
                { message: "All fields are required" },
                { status: 400 }
            );
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            {
                title,
                subject,
                recommendationVideo,
                duration,
                totalQuestions,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedExam) {
            return NextResponse.json(
                { message: "Exam not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Exam updated successfully",
            exam: updatedExam,
        });
    } catch (error) {
        console.error("UPDATE EXAM ERROR:", error);

        return NextResponse.json(
            { message: "Failed to update exam" },
            { status: 500 }
        );
    }
}

/* ================= TOGGLE STATUS ================= */

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        await connectDB();

        const { examId } = await params;

        const { status } = await req.json();

        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            { status },
            { new: true }
        );

        if (!updatedExam) {
            return NextResponse.json(
                { message: "Exam not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedExam);
    } catch (error) {
        console.error("PATCH EXAM ERROR:", error);

        return NextResponse.json(
            { message: "Failed to update status" },
            { status: 500 }
        );
    }
}

/* ================= DELETE EXAM ================= */

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        await connectDB();

        const { examId } = await params;

        const deletedExam = await Exam.findByIdAndDelete(
            examId
        );

        if (!deletedExam) {
            return NextResponse.json(
                { message: "Exam not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Exam deleted successfully",
        });
    } catch (error) {
        console.error("DELETE EXAM ERROR:", error);

        return NextResponse.json(
            { message: "Failed to delete exam" },
            { status: 500 }
        );
    }
}