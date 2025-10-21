export default function Footer() {
  return (
    <footer className="bg-[#2563eb]; text-white shadow-inner">
      <div className="max-w-8xl mx-auto px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-sm space-y-3 sm:space-y-0">
        <p className="text-gray-100 text-center sm:text-left">
          © 2025 <span className="font-semibold">MyFitnessBuddy</span>. All
          rights reserved.
        </p>

        <div className="flex flex-wrap justify-center sm:justify-end gap-4">
          <a
            href="#"
            className="hover:text-gray-200 transition-transform duration-150 hover:scale-105"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-gray-200 transition-transform duration-150 hover:scale-105"
          >
            Terms
          </a>
          <a
            href="#"
            className="hover:text-gray-200 transition-transform duration-150 hover:scale-105"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
