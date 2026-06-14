import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import mongoose from "mongoose";

export async function GET() {
    await connectDB();

    try {
        const token = cookies().get("token")?.value;

        if (!token) {
            return NextResponse.json([], { status: 200 }); // ✅ safe
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as { id: string };

        const userId = decoded.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json([], { status: 200 });
        }

        const attempts = await Attempt.find({
            userId: new mongoose.Types.ObjectId(userId),
        }).lean();

        return NextResponse.json(attempts);
    } catch (error) {
        console.error("ATTEMPT ERROR:", error);
        return NextResponse.json([], { status: 200 });
    }
}