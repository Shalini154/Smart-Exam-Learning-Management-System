import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

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

        const attemptId = params.id;

        if (!mongoose.Types.ObjectId.isValid(attemptId)) {
            return NextResponse.json(
                { message: "Invalid result ID" },
                { status: 400 }
            );
        }

        const attempt = await Attempt.findById(attemptId);

        if (!attempt) {
            return NextResponse.json(
                { message: "Result not found" },
                { status: 404 }
            );
        }

        /* ---------- SECURITY CHECK ---------- */

        if (attempt.userId.toString() !== decoded.id) {
            return NextResponse.json(
                { message: "Access denied" },
                { status: 403 }
            );
        }

        return NextResponse.json(attempt);

    } catch (error) {
        console.error("RESULT FETCH ERROR:", error);
        return NextResponse.json(
            { message: "Failed to fetch result" },
            { status: 500 }
        );
    }
}