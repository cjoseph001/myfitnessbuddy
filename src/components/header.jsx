import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/authcontext";
import { Menu, X, Dumbbell } from "lucide-react";

export default function Header() {
  const { logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);

  return (
    <header className="bg-[#2563eb] text-white sticky top-0 z-50 shadow-md backdrop-blur-md bg-opacity-95 transition-all">
      <div className="max-w-6xl mx-auto px-4.5 py-2.25 flex justify-between items-center">
        <Link
          to="/home"
          className="flex items-center gap-1.5 hover:opacity-90 transition-all"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/15 backdrop-blur-sm shadow-inner">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide">
            MyFitness<span className="font-bold text-blue-100">Buddy</span>
          </h1>
        </Link>

        <nav className="hidden sm:flex items-center font-medium">
          {[
            { label: "Home", path: "/home" },
            { label: "Workouts", path: "/workouts" },
            { label: "Analytics", path: "/analytics" },
            { label: "Trends", path: "/trends" },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative text-sm  px-2.5 py-1.5 rounded-2xl transition-all hover:bg-white/15 hover:text-blue-50 active:scale-[0.98]"
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="ml-2.5 text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-2xl shadow-sm backdrop-blur-sm transition-all active:scale-[0.98]"
          >
            Logout
          </button>
        </nav>

        <button
          onClick={toggleMobileMenu}
          className="sm:hidden px-2 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
        >
          {mobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <div
        className={`sm:hidden transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="bg-[#1e4fd9] border-t border-white/10 px-2 pb-5 pt-2.5 space-y-2">
          {[
            { label: "Home", path: "/home" },
            { label: "Workouts", path: "/workouts" },
            { label: "Analytics", path: "/analytics" },
            { label: "Trends", path: "/trends" },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block py-1 px-3.5 rounded-md hover:bg-white/15 active:bg-white/25 transition-all"
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="mt-2 w-full bg-white/20 hover:bg-white/30 active:bg-white/40 px-3 py-2 rounded-xl text-white font-medium transition-all"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
