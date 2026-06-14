"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/PublicHeader";
import Footer from "@/app/components/Footer";

export default function StudentRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
      } else {
        setMessage("Registration successful! Redirecting to login...");

        setTimeout(() => {
        router.push("/student/login");
        }, 2000);

        setForm({ name: "", email: "", password: "" });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      
      <Header />

      <section className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-white text-center">
            Student Registration
          </h2>

          <p className="mt-2 text-center text-gray-400 text-sm">
            GFEC Online MCQ Examination Portal
          </p>

          {/* Success / Error Message */}
          {message && (
            <p className="mt-4 text-green-400 text-sm text-center">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-600"
            />

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-600"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-green-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
