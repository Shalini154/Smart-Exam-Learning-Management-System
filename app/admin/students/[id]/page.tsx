"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StudentAttemptsPage() {

    const { id } = useParams();

    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function fetchAttempts() {

            try {

                const res = await fetch(`/api/students/${id}/attempts`);
                const data = await res.json();

                setAttempts(data);

            } catch (error) {

                console.error("Attempt fetch error:", error);

            } finally {

                setLoading(false);

            }

        }

        fetchAttempts();

    }, [id]);

    return (

        <div className="p-8">

            <h1 className="text-3xl font-bold mb-8">
                Student Exam Attempts
            </h1>

            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">

                <table className="w-full text-left">

                    <thead className="bg-gray-700 text-gray-200">

                        <tr>
                            <th className="p-4">Exam</th>
                            <th className="p-4">Score</th>

                            <th className="p-4">Date</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading && (
                            <tr>
                                <td colSpan={4} className="p-6 text-center">
                                    Loading attempts...
                                </td>
                            </tr>
                        )}

                        {!loading && attempts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-6 text-center">
                                    No attempts found
                                </td>
                            </tr>
                        )}

                        {!loading && attempts.map((attempt: any) => (

                            <tr
                                key={attempt._id}
                                className="border-b border-gray-700 hover:bg-gray-750"
                            >

                                <td className="p-4">
                                    {attempt.examId?.title || "Unknown Exam"}
                                </td>

                                <td className="p-4">
                                    {attempt.score}
                                </td>



                                <td className="p-4 text-gray-400">
                                    {new Date(attempt.createdAt).toLocaleDateString()}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );
}