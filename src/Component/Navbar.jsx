import React, { useState } from "react";
import {
  FaHome,
  FaBox,
  FaFlask,
  FaRecycle,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp"; // Adjust the path as necessary

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Raw Material", icon: <FaBox />, path: "/raw-material-list" },
    { name: "Standard Batch", icon: <FaFlask />, path: "/standard-batch-report" },
    { name: "Batch Recreation", icon: <FaRecycle />, path: "/re-created-batch-report" },
    { name: "Masters", icon: <FaCog />, path: "/masters" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

   // Call this when logging out
  const handleLogout = () => {
    // Remove auth details if needed
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");

    // Navigate to home
    navigate("/");
  };

  return (
    <div className="font-sans">
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-2 right-4 z-50 p-1 bg-blue-600 rounded-lg text-white shadow-lg xl:hidden"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-40 z-40 xl:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 flex flex-col w-full max-w-[16rem] p-0 overflow-y-auto bg-gradient-to-br from-blue-200 to-indigo-100 border-r border-gray-200 shadow-xl z-50 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} xl:translate-x-0`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-300">
          <div className="flex items-center">
            
            <div className="ml-3">
              <img src={logo} alt="Chemtech Engineers Logo" className="h-14" />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group
                  ${location.pathname === item.path
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white">
                    {item.icon}
                  </div>
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-300">
          <a className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" size={18} />
            </div>
            <div className="ml-2">
              <p className="font-medium text-gray-800 capitalize">Admin</p>
              <p className="text-sm text-gray-600">Superuser</p>
            </div>
          </a>
          <div className="mt-8 mx-3">
            <button
               onClick={handleLogout}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Navbar;
