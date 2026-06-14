export default function Footer() {
    return (
      <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        <p>
          © {new Date().getFullYear()} Techno Main
        </p>
        <p className="mt-1">
          Developed by{" "}
          <span className="text-gray-300 font-medium">
            Yasir Tajwar, Shalini Kumari, Vivek Shaw, Snehil Pratik
          </span>
        </p>
      </footer>
    );
  }
  