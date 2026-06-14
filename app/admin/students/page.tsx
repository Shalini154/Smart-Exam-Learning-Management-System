"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Student {
    _id: string;
    name: string;
    email: string;
    course?: string;
    createdAt: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        async function fetchStudents() {
            try {
                const res = await fetch("/api/students");
                const data: Student[] = await res.json();

                setStudents(data);
                setFilteredStudents(data);
            } catch (error) {
                console.error("Student fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, []);

    // Search filter
    useEffect(() => {
        const filtered = students.filter((student) =>
            student.name?.toLowerCase().includes(search.toLowerCase()) ||
            student.email?.toLowerCase().includes(search.toLowerCase()) ||
            student.course?.toLowerCase().includes(search.toLowerCase())
        );

        setFilteredStudents(filtered);
    }, [search, students]);

    return (
        <div className="p-8 space-y-8 text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">
                    👨‍🎓 Students Management
                </h1>

                <div className="text-gray-300">
                    Total Students:{" "}
                    <span className="font-semibold text-white">
                        {students.length}
                    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow">
                <input
                    type="text"
                    placeholder="Search by name, email or course..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Students Table */}
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left text-white">
                    <thead className="bg-gray-700 text-gray-200">
                        <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Registered</th>
                            <th className="p-4">Attempts</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-white">
                                    Loading students...
                                </td>
                            </tr>
                        )}

                        {!loading && filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                    No students found
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            filteredStudents.map((student) => (
                                <tr
                                    key={student._id}
                                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                                >
                                    {/* Student Name + Avatar */}
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                            {student.name?.charAt(0).toUpperCase()}
                                        </div>

                                        <span className="text-white">
                                            {student.name}
                                        </span>
                                    </td>

                                    <td className="p-4 text-white">
                                        {student.email}
                                    </td>

                                    <td className="p-4 text-gray-300">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="p-4">
                                        <button
                                            onClick={() =>
                                                router.push(`/admin/students/${student._id}`)
                                            }
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm"
                                        >
                                            View Attempts
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}