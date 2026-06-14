import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {

        await connectDB();

        const attempts = await Attempt.find({
            userId: params.id
        })
            .populate("examId")
            .sort({ createdAt: -1 });

        return NextResponse.json(attempts);

    } catch (error) {

        console.error("Attempts fetch error:", error);

        return NextResponse.json(
            { message: "Failed to fetch attempts" },
            { status: 500 }
        );

    }
}