import React, { useState, useEffect } from 'react';
import { 
  FaBox, FaFlask, FaUsers, FaChartLine, 
  FaShoppingCart, FaExclamationTriangle, 
  FaCalendarAlt, FaSearch, FaChevronUp, FaChevronDown
} from 'react-icons/fa';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    recentActivities: []
  });
  
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockData = {
          totalProducts: 245,
          lowStockItems: 12,
          pendingOrders: 5,
          recentActivities: [
            { id: 1, action: 'New batch created', date: '2023-05-15 09:30', user: 'Admin' },
            { id: 2, action: 'Raw material received', date: '2023-05-14 14:15', user: 'Manager' },
            { id: 3, action: 'Inventory checked', date: '2023-05-14 10:00', user: 'Staff' },
            { id: 4, action: 'Product dispatched', date: '2023-05-13 16:45', user: 'Admin' },
            { id: 5, action: 'New supplier added', date: '2023-05-13 11:20', user: 'Admin' },
            { id: 6, action: 'Monthly report generated', date: '2023-05-12 17:00', user: 'Manager' }
          ]
        };
        
        setStats(mockData);
        setGrowthPercentage(12);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate gradient colors for cards
  const cardGradients = [
    'from-blue-500 to-indigo-600',
    'from-red-500 to-orange-500',
    'from-amber-500 to-yellow-500',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600'
  ];

  // Generate chart data
  const generateChartData = () => {
    return Array.from({length: 12}, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      value: Math.floor(Math.random() * 100) + 30
    }));
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(item => item.value));

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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link to="/products" className={`bg-gradient-to-r ${cardGradients[0]} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mr-4">
                  <FaBox size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Products</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats.totalProducts}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="opacity-80">Last 30 days</span>
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full">+5%</span>
              </div>
            </Link>

            <Link to="/products?filter=low-stock" className={`bg-gradient-to-r ${cardGradients[1]} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mr-4">
                  <FaExclamationTriangle size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Low Stock Items</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats.lowStockItems}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="opacity-80">Needs attention</span>
              </div>
            </Link>

            <Link to="/orders" className={`bg-gradient-to-r ${cardGradients[2]} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mr-4">
                  <FaShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Pending Orders</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats.pendingOrders}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="opacity-80">Awaiting fulfillment</span>
              </div>
            </Link>

            <Link to="/reports" className={`bg-gradient-to-r ${cardGradients[3]} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
              <div className="flex items-center text-white">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mr-4">
                  <FaChartLine size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Monthly Growth</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : `+${growthPercentage}%`}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="opacity-80">Compared to last month</span>
              </div>
            </Link>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
                <Link to="/activities" className="text-sm text-indigo-600 hover:underline font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-start pb-3 pt-2">
                      <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  stats.recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 mr-3">
                        {activity.user === 'Admin' ? (
                          <FaUsers size={16} />
                        ) : activity.user === 'Manager' ? (
                          <FaFlask size={16} />
                        ) : (
                          <FaBox size={16} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{activity.action}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FaCalendarAlt className="mr-1" size={12} />
                          <span>{activity.date}</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-5 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/standard-batch"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all"
                >
                  <div className="p-2 rounded-lg bg-blue-500 text-white mr-3">
                    <FaFlask size={18} />
                  </div>
                  <span className="font-medium">Create New Batch</span>
                </Link>
                <Link
                  to="/products/add"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 transition-all"
                >
                  <div className="p-2 rounded-lg bg-emerald-500 text-white mr-3">
                    <FaBox size={18} />
                  </div>
                  <span className="font-medium">Add New Product</span>
                </Link>
                <Link
                  to="/orders/new"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 hover:from-amber-100 hover:to-amber-200 transition-all"
                >
                  <div className="p-2 rounded-lg bg-amber-500 text-white mr-3">
                    <FaShoppingCart size={18} />
                  </div>
                  <span className="font-medium">Create New Order</span>
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 transition-all"
                >
                  <div className="p-2 rounded-lg bg-purple-500 text-white mr-3">
                    <FaChartLine size={18} />
                  </div>
                  <span className="font-medium">Generate Report</span>
                </Link>
              </div>
              
              {/* Mini Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="font-medium text-gray-700 mb-3">Inventory Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Value</span>
                    <span className="font-medium text-gray-800">₹1,245,800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Stock Days</span>
                    <span className="font-medium text-gray-800">42 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Turnover</span>
                    <span className="font-medium text-gray-800">2.8x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Accuracy</span>
                    <span className="font-medium text-gray-800">98.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Inventory Trends</h2>
                <div className="text-sm text-gray-500">Last 12 months</div>
              </div>
              <div className="h-64">
                <div className="flex items-end h-48 gap-1 mt-4">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t"
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Stock Distribution</h2>
                <div className="text-sm text-gray-500">By Category</div>
              </div>
              <div className="h-64 flex flex-col justify-center">
                <div className="flex justify-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
                    <span className="text-sm">Chemicals</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full mr-2"></div>
                    <span className="text-sm">Packaging</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 rounded-full mr-2"></div>
                    <span className="text-sm">Equipment</span>
                  </div>
                </div>
                <div className="relative w-48 h-48 mx-auto">
                  <div className="absolute inset-0 rounded-full border-8 border-indigo-500"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-emerald-500 transform rotate-120"></div>
                  <div className="absolute inset-0 rounded-full border-8 border-amber-500 transform rotate-240"></div>
                  <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">100%</div>
                      <div className="text-xs text-gray-500">Total Inventory</div>
                    </div>
                  </div>
                </div>
              </div>
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