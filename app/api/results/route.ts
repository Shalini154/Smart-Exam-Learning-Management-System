import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
    try {
        await connectDB();

        /* ---------- AUTH ---------- */

        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;

        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        /* ---------- FETCH ATTEMPTS WITH EXAM NAME ---------- */

        const attempts = await Attempt.find({ userId: decoded.id })
            .populate("examId", "title subject") // 🔥 ADD THIS
            .sort({ createdAt: -1 });

        return NextResponse.json(attempts);

    } catch (error) {
        console.error("RESULT LIST ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch results" },
            { status: 500 }
        );
    }
}