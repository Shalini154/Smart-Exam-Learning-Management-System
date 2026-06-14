import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Exam from "@/models/Exam";
import Attempt from "@/models/Attempt";

export async function GET() {
    try {

        await connectDB();

        const [students, exams, attempts] = await Promise.all([
            Student.countDocuments(),
            Exam.countDocuments(),
            Attempt.countDocuments()
        ]);

        // latest activity
        const latestStudent = await Student.findOne().sort({ createdAt: -1 });
        const latestExam = await Exam.findOne().sort({ createdAt: -1 });
        const latestAttempt = await Attempt.findOne().sort({ createdAt: -1 });

        return NextResponse.json({
            students,
            exams,
            attempts,
            activities: [
                latestStudent
                    ? { text: `New student registered (${latestStudent.name})` }
                    : null,

                latestExam
                    ? { text: `Exam "${latestExam.title}" created` }
                    : null,

                latestAttempt
                    ? { text: `Student completed exam` }
                    : null,
            ].filter(Boolean)
        });

    } catch (error) {

        console.error("Dashboard API Error:", error);

        return NextResponse.json(
            { message: "Failed to fetch dashboard data" },
            { status: 500 }
        );

    }
}