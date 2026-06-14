"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    /* ---------------- THEME INIT ---------------- */

    useEffect(() => {
        const savedTheme = localStorage.getItem("admin_theme");
        if (savedTheme === "light") {
            setDarkMode(false);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    /* ---------------- LOGIN ---------------- */

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
            } else {
                router.push("/admin/dashboard");
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode
                ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
                : "bg-gradient-to-br from-gray-100 via-white to-gray-200 text-black"
                }`}
        >
            {/* Theme Toggle Button */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-6 right-6 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition bg-blue-600 text-white hover:bg-blue-700"
            >
                {darkMode ? "🌙 Dark" : "☀ Light"}
            </button>

            <div className="w-full max-w-md px-6">

                {/* Logo */}
                <div className="text-center mb-6">
                    <Image
                        src="/technologo.png"
                        alt="GFEC Logo"
                        width={90}
                        height={90}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold tracking-wide">
                        Techno Main Admin Panel
                    </h1>
                    <p className="text-sm opacity-70">
                        Examination Management System
                    </p>
                </div>

                {/* Login Card */}
                <form
                    onSubmit={handleLogin}
                    className={`rounded-2xl shadow-2xl p-8 backdrop-blur-lg transition ${darkMode
                        ? "bg-white/5 border border-gray-700"
                        : "bg-white border border-gray-300"
                        }`}
                >
                    <h2 className="text-lg font-semibold text-center mb-6">
                        Admin Login
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 text-sm rounded bg-red-500/10 text-red-500 border border-red-500">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label className="text-sm">Email</label>
                        <input
                            type="email"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${darkMode
                                ? "bg-gray-900 border-gray-700 focus:ring-blue-500"
                                : "bg-gray-100 border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="text-sm">Password</label>
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`w-full mt-2 p-3 rounded-lg border focus:outline-none focus:ring-2 transition ${darkMode
                                ? "bg-gray-900 border-gray-700 focus:ring-blue-500"
                                : "bg-gray-100 border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-xs mt-6 opacity-60">
                    © {new Date().getFullYear()}|| Developed by yasir tajwar, shalini kumari, vivek shaw, snehil pratik
                    
                </p>
            </div>
        </div>
    );
}