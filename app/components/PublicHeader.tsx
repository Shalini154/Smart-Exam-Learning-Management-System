import Image from "next/image";
import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-gray-800 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        
        {/* Logo */}
        <Image
          src="/technologo.png"
          alt="GFEC Logo"
          width={36}
          height={36}
        />

        {/* Title */}
        <Link href="/" className="text-lg font-semibold text-white">
          Techno Main
        </Link>
      </div>
    </header>
  );
}
