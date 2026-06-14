import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";

export async function GET() {
    try {

        await connectDB();

        const students = await Student.find().sort({ createdAt: -1 });

        return NextResponse.json(students);

    } catch (error) {

        console.error("Student Fetch Error:", error);

        return NextResponse.json(
            { message: "Failed to fetch students" },
            { status: 500 }
        );
    }
}