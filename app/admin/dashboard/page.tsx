"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {

    const router = useRouter();

    const [stats, setStats] = useState({
        students: 0,
        exams: 0,
        attempts: 0,
    });

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Logout function
    const handleLogout = () => {

        localStorage.removeItem("token"); // remove login token
        router.push("/admin/login"); // redirect to login page

    };

    useEffect(() => {

        async function fetchDashboard() {

            try {

                const res = await fetch("/api/dashboard");
                const data = await res.json();

                setStats({
                    students: data.students || 0,
                    exams: data.exams || 0,
                    attempts: data.attempts || 0,
                });

                setActivities(data.activities || []);

            } catch (error) {

                console.error("Dashboard fetch error:", error);

            } finally {

                setLoading(false);

            }

        }

        fetchDashboard();

    }, []);

    return (
        <div className="w-full flex flex-col items-center space-y-12 p-8">

            {/* HEADER */}
            <div className="w-full max-w-6xl flex justify-between items-center">

                <div className="flex items-center gap-4">

                    <Image
                        src="/technologo.png"
                        alt="techno logo"
                        width={70}
                        height={70}
                    />

                    <div>
                        <h2 className="text-3xl font-bold">
                            Dashboard Overview
                        </h2>

                        <p className="text-gray-400">
                            Welcome to Techno Main Examination Management System
                        </p>
                    </div>

                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                >
                    🚪 Logout
                </button>

            </div>


            {/* STATS */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Students */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl text-center">
                    <span className="text-4xl">👨‍🎓</span>
                    <h3 className="text-white text-lg mt-2">Total Students</h3>
                    <p className="text-4xl font-bold text-white mt-4">
                        {loading ? "..." : stats.students}
                    </p>
                </div>

                {/* Exams */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 shadow-xl text-center">
                    <span className="text-4xl">📝</span>
                    <h3 className="text-white text-lg mt-2">Total Exams</h3>
                    <p className="text-4xl font-bold text-white mt-4">
                        {loading ? "..." : stats.exams}
                    </p>
                </div>

                {/* Attempts */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-xl text-center">
                    <span className="text-4xl">📊</span>
                    <h3 className="text-white text-lg mt-2">Total Attempts</h3>
                    <p className="text-4xl font-bold text-white mt-4">
                        {loading ? "..." : stats.attempts}
                    </p>
                </div>

            </div>


            {/* RECENT ACTIVITY */}
            <div className="w-full max-w-4xl bg-gray-800 rounded-2xl p-8 shadow-lg">

                <h3 className="text-xl font-semibold mb-6 text-center">
                    Recent Activity
                </h3>

                <div className="space-y-4 text-sm text-gray-300">

                    {activities.length === 0 && (
                        <p className="text-center text-gray-500">
                            No recent activity
                        </p>
                    )}

                    {activities.map((activity: any, index) => (
                        <div
                            key={index}
                            className="flex justify-between border-b border-gray-700 pb-3"
                        >
                            <span>{activity.text}</span>
                            <span className="text-gray-500">Recently</span>
                        </div>
                    ))}

                </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">

                <button
                    onClick={() => router.push("/admin/exams")}
                    className="p-6 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white font-semibold shadow-lg"
                >
                    ➕ Create New Exam
                </button>

                <button
                    onClick={() => router.push("/admin/students")}
                    className="p-6 rounded-xl bg-green-600 hover:bg-green-700 transition text-white font-semibold shadow-lg"
                >
                    👨‍🎓 View Students
                </button>

                <button
                    onClick={() => router.push("/admin/reports")}
                    className="p-6 rounded-xl bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg"
                >
                    📊 View Reports
                </button>

            </div>

        </div>
    );
}