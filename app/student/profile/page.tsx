"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import DashboardHeader from "@/app/components/DashboardHeader";
import Footer from "@/app/components/Footer";

export default function StudentProfilePage() {
  const [student, setStudent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/student/profile")
      .then(res => res.json())
      .then(data => setStudent(data));
  }, []);
  const handleLogout = async () => {
    await fetch("/api/student/logout", {
      method: "POST",
    });
  
    router.push("/student/login");
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      
      <DashboardHeader />

      <section className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white">
              Student Profile
            </h1>
            <p className="mt-2 text-gray-400">
              Golden Future Education Centre – Exam Portal
            </p>
          </div>

          {/* Profile Card */}
          <div className="grid gap-8 md:grid-cols-3 mb-10">

            {/* Avatar */}
            <div className="rounded-xl bg-black/60 border border-gray-800 p-6 text-center">
              <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold text-white">
                {student?.name?.charAt(0) || "S"}
              </div>

              <h2 className="text-xl font-semibold text-white">
                {student?.name || "Student Name"}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {student?.email || "student@gfec.in"}
              </p>
            </div>

            {/* Details */}
            <div className="rounded-xl bg-black/60 border border-gray-800 p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">
                Academic Details
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
               
                <Info
                  label="Registered On"
                  value={
                    student?.createdAt
                      ? new Date(student.createdAt).toDateString()
                      : "—"
                  }
                />
                <Info label="Status" value="Active" highlight />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
  <button className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
    Edit Profile
  </button>

  <button
    onClick={handleLogout}
    className="px-8 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
  >
    Logout
  </button>
</div>


        </div>
      </section>

      <Footer />
    </main>
  );
}

/* -------- Helper Component -------- */

function Info({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p
        className={`font-medium ${
          highlight ? "text-green-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
