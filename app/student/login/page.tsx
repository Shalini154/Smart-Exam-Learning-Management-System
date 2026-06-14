"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/PublicHeader";
import Footer from "@/app/components/Footer";

export default function StudentLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
      } else {
        // ✅ STORE USER DATA (VERY IMPORTANT)
        localStorage.setItem("user", JSON.stringify(data.user));

        // Optional: if you return token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        router.push("/student/dashboard");
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
        <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-black/60 backdrop-blur-md shadow-2xl p-8">

          <h2 className="text-2xl font-bold text-white text-center">
            Student Login
          </h2>

          <p className="mt-2 text-center text-gray-400 text-sm">
            Tmsl online portal
          </p>

          {error && (
            <p className="mt-4 text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}