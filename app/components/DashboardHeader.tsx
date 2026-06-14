import Image from "next/image";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="border-b border-gray-800 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <Image
            src="/technologo.png"
            alt="GFEC Logo"
            width={36}
            height={36}
          />
          <Link href="/student/dashboard" className="text-lg font-semibold text-white">
            Techno Main Exam Portal
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/student/dashboard" className="text-gray-300 hover:text-white">
            Dashboard
          </Link>
          <Link href="/student/exams" className="text-gray-300 hover:text-white">
            Exams
          </Link>
          <Link href="/student/results" className="text-gray-300 hover:text-white">
            Results
          </Link>
          <Link href="/student/profile" className="text-gray-300 hover:text-white">
            Profile
          </Link>
        </nav>

      </div>
    </header>
  );
}
