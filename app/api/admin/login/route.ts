import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function POST(req: Request) {

    try {

        const body = await req.json();
        const { email, password } = body;

        // validation
        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password required" },
                { status: 400 }
            );
        }

        // connect database
        await connectDB();

        // find admin
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // compare password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // get secret safely
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            console.error("JWT_SECRET not defined in .env.local");
            return NextResponse.json(
                { message: "Server configuration error" },
                { status: 500 }
            );
        }

        // generate token
        const token = jwt.sign(
            { id: admin._id, role: "admin" },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const response = NextResponse.json({
            message: "Admin login successful",
        });

        // set cookie
        response.cookies.set("admin_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );

    }

}