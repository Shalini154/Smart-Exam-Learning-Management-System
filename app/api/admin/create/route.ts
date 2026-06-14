import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";

export async function GET() {
    try {

        await connectDB();

        const email = "richa@gmail.com";

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return NextResponse.json(
                { message: "Admin already exists" },
                { status: 200 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("admin", 10);

        // Create admin
        await Admin.create({
            name: "GFEC Admin",
            email,
            password: hashedPassword,
        });

        return NextResponse.json(
            { message: "Admin created successfully" },
            { status: 201 }
        );

    } catch (error) {

        console.error("Admin Seeder Error:", error);

        return NextResponse.json(
            { message: "Error creating admin" },
            { status: 500 }
        );

    }
}