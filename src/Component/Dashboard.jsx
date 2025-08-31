import React, { useState, useEffect } from 'react';
import {
  FaBox, FaFlask, FaUsers, FaChartLine,
  FaShoppingCart, FaExclamationTriangle,
  FaCalendarAlt, FaSearch
} from 'react-icons/fa';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    lowStockList: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔎 Filter the list
  const filteredList = stats.lowStockList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.purchase_code?.toLowerCase().includes(query) ||
      item.raw_material_name?.toLowerCase().includes(query) ||
      item.date_in?.toLowerCase().includes(query) ||
      String(item.quantity).toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://inventary.chemtechengineers.in/backend/dashboard/summary.php");
        const data = await res.json();

        if (data.status === "success") {
          setStats({
            totalProducts: parseInt(data.total_count),
            lowStockItems: parseInt(data.low_stock_count),
            pendingOrders: 0, // You can replace with your own API logic
            lowStockList: data.low_stock_list
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardGradients = [
    'from-blue-500 to-indigo-600',
    'from-red-500 to-orange-500',
    'from-amber-500 to-yellow-500'
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 xl:ml-[17rem]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
            </div>
            <div className="mt-4 md:mt-0 relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className={`bg-gradient-to-r ${cardGradients[0]} p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 mr-4">
                  <FaBox size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Products</p>
                  <p className="text-2xl font-bold mt-4">{isLoading ? '...' : stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${cardGradients[1]} p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 mr-4">
                  <FaExclamationTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Low Stock Items</p>
                  <p className="text-2xl font-bold mt-4">{isLoading ? '...' : stats.lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-r ${cardGradients[2]} p-4 rounded-xl shadow-lg`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 mr-4">
                  <FaShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Available Stock</p>
                  <p className="text-2xl font-bold mt-4">{isLoading ? '...' : stats.totalProducts - stats.lowStockItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Material Table */}
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Low Stock Raw Materials</h2>
              <Link to="/raw-material-list" className="text-sm text-indigo-600 hover:underline font-medium">View All</Link>
            </div>
          {/* Table */}
      <div className="overflow-x-auto mt-3">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-200 text-black">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Sr. No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Purchase Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Raw Material Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date In</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{item.purchase_code}</td>
                  <td className="px-6 py-4">{item.raw_material_name}</td>
                  <td className="px-6 py-4">
                    {item.quantity} {item.quantity_unit}
                  </td>
                  <td className="px-6 py-4">{item.date_in}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No low stock items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>Inventory Management System • Updated just now</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
