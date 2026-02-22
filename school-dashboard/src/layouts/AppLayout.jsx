import { NavLink, Outlet } from "react-router-dom";
import { TbLayoutDashboard } from "react-icons/tb";
import { PiStudentFill } from "react-icons/pi";
import { GiBookshelf } from "react-icons/gi";
import { MdReportGmailerrorred } from "react-icons/md";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-5 py-4 text-base font-semibold transition-colors ${
    isActive
      ? "bg-slate-800 text-blue-200"
      : "text-slate-200 hover:bg-slate-800"
  }`;

export default function AppLayout() {
  return (
    <div className="h-screen bg-slate-100">
      <div className="flex h-full">
        <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-slate-200">
          <div className="px-6 py-7  border-b border-slate-800">
            <h2 className="text-3xl font-bold text-white ml-7">Al-Aqmar </h2>
          </div>

          <nav className="p-5 space-y-3">
            <NavLink to="/dashboard" className={linkClass}>
              <TbLayoutDashboard size={20} /> Dashboard
            </NavLink>

            <NavLink to="/students" className={linkClass}>
              <PiStudentFill size={20} /> Students
            </NavLink>

            <NavLink to="/lectures" className={linkClass}>
              <GiBookshelf size={20} /> Lectures
            </NavLink>

            <NavLink to="/reports" className={linkClass}>
              <MdReportGmailerrorred size={20} /> Reports
            </NavLink>
          </nav>

          <div className="mt-auto p-5 border-t border-slate-800 space-y-3">
            <button className="w-full rounded-xl px-5 py-4 text-left text-base font-semibold bg-slate-800/40 hover:bg-slate-800 transition-colors">
              My profile
            </button>

            <button className="w-full rounded-xl px-5 py-4 text-left text-base font-semibold bg-slate-800/40 hover:bg-slate-800 transition-colors">
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 bg-gray-200 text-base">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
