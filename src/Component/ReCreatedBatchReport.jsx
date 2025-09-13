import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaPrint, FaEye, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import Navbar from "./Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || `${API_BASE_URL}`;

const statusStyles = {
  "Completed": "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Draft": "bg-gray-100 text-gray-800"
};

export default function ReCreatedBatchReport() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle print functionality
  const handlePrint = (batchId) => {
    // Implement print functionality
    console.log('Print batch:', batchId);
    // You can open a print dialog or navigate to a print view
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}batch_recreation/get_batch_recreations.php`);
      console.log('Batch recreations response:', response.data); // Debug log
      if (response.data && response.data.success === true) {
        setBatches(response.data.data || []);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error('Error fetching batch recreations:', err);
      setError('Failed to load batch recreations. Please try again later.');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete functionality
  const handleDelete = async (batchId) => {
    if (window.confirm('Are you sure you want to delete this batch recreation?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}batch_recreation/delete_batch_recreation.php?id=${batchId}`);
        // Refresh the list after deletion
        setBatches(batches.filter(batch => batch.id !== batchId));
      } catch (err) {
        // console.error('Error deleting batch recreation:', err);
        // setError('Failed to delete batch recreation. Please try again.');
        fetchBatches();
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = batches.filter((batch) =>
    batch.recreated_batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.original_batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="p-6 font-sans bg-gray-50 min-h-screen mt-10 xl:ml-[17rem]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800">
                Batch Recreation
              </h2>
              <p className="text-gray-600 mt-1">
                View, manage, and track all your batch recreations
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button onClick={() => navigate('/batch-recreation')} className="py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center">
                <FaPlus />Recreated Batch
              </button>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-blue-500 text-2xl mr-2" />
              <span>Loading batch recreations...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-200 text-black">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Recreated Batch
                      </th>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Original Batch
                      </th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Materials
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Print
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Update
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBatches.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          {searchTerm ? 'No matching batch recreations found' : 'No batch recreations available'}
                        </td>
                      </tr>
                    ) : (
                      filteredBatches.map((batch) => (
                        <tr
                          key={batch.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{batch.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                            {batch.recreated_batch_name}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.original_batch_name || 'N/A'}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(batch.recreated_batch_date).toLocaleDateString("en-GB")}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {batch.recreated_batch_size} {batch.recreated_batch_unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.raw_material_count > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {batch.raw_material_count || 0} raw materials
                            </span>
                          </td>

                          {/* Print Column */}
                          <td className="p-3 border-b border-gray-200 text-center">
                            <button
                              onClick={() => handlePrint(batch.id)}
                              title="Print"
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow-sm transition-all duration-200"
                            >
                              <FaPrint className="h-4 w-4" />
                            </button>
                          </td>

                          {/* Edit Column */}
                          <td className="p-3 border-b border-gray-200 text-center">
                            <button
                              onClick={() => navigate(`/batch-recreation/edit/${batch.id}`)}
                              title="Edit"
                              className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-800 shadow-sm transition-all duration-200"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </td>

  {/* Delete Column */}
                        <td className="p-3 border-b border-gray-200 text-center">
                          <button
                           onClick={() => handleDelete(batch.id)}
                            title="Delete"
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 shadow-sm transition-all duration-200"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </td>


                        
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination and Summary */}
        </div>
      </div>
    </>
  );
}
