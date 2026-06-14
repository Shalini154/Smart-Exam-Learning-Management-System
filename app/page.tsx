"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {

  useEffect(() => {
     const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];

    s1.async = true;
    s1.src = "https://embed.tawk.to/69d753b76839171c36f07891/1jlohu2ds";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    if (s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">

      {/* HEADER */}
      <header className="border-b border-gray-800 bg-black/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Image
            src="/technologo.png"
            alt="GFEC Logo"
            width={40}
            height={40}
            className="rounded"
          />
          <h1 className="text-lg font-semibold text-white">
            Techno Main
          </h1>
        </div>
      </header>

      {/* MAIN */}
      <section className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-md shadow-2xl p-8 text-center">

          <div className="flex justify-center mb-6">
            <Image
              src="/technologo.png"
              alt="GFEC Logo"
              width={90}
              height={90}
              className="rounded-full border border-gray-700"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Techno Main
          </h2>

          <p className="mt-3 text-gray-400 text-lg">
            Online MCQ Examination Portal
          </p>

          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/student/login"
              className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Student Login
            </Link>

            <Link
              href="/student/register"
              className="px-8 py-3 rounded-lg border border-blue-600 text-blue-400 font-semibold hover:bg-blue-600 hover:text-white transition"
            >
              Student Register
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Practice • Assess • Improve
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Techno Main
        </p>
        <p className="mt-1">
          Developed by{" "}
          <span className="text-gray-300 font-medium">
             Yasir Tajwar, Shalini Kumari, Vivek Shaw, Snehil Pratik, Saquib Raza
          </span>
        </p>
      </footer>

    </main>
  );
}