import { Link } from "react-router-dom";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
         <nav className="fixed top-0 left-0 w-full bg-blue-600 text-white px-6 py-3 shadow-md flex gap-6 z-50">
        <Link to="/admissions" className="hover:text-gray-200 transition">Admissions</Link>
        <Link to="/patients" className="hover:text-gray-200 transition">Patients</Link>
        <Link to="/doctors" className="hover:text-gray-200 transition">Doctors</Link>
        
        
        <Link to="/appStatus" className="hover:text-gray-200 transition">Status</Link>
         <Link to="/signup" className="hover:text-gray-200 transition">sign Up</Link>

      </nav>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
