import React, { useState } from "react";
import { FaPlus, FaSearch, FaPrint, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

const batchesData = [
  {
    id: 1,
    batchName: "Cold Drink",
    batchDate: "2025-08-10",
    batchSize: "10 L",
    rawMaterialCount: 2,
    batchCost: 1250,
    status: "Completed"
  },
  {
    id: 2,
    batchName: "Cold Drink",
    batchDate: "2025-08-10",
    batchSize: "100 L",
    rawMaterialCount: 1,
    batchCost: 9800,
    status: "In Progress"
  },
  {
    id: 3,
    batchName: "Tea",
    batchDate: "2025-08-10",
    batchSize: "1 L",
    rawMaterialCount: 1,
    batchCost: 150,
    status: "Completed"
  },
  {
    id: 4,
    batchName: "Tea",
    batchDate: "2025-08-10",
    batchSize: "1 L",
    rawMaterialCount: 1,
    batchCost: 150,
    status: "Completed"
  },
  {
    id: 5,
    batchName: "Tea",
    batchDate: "2025-08-10",
    batchSize: "100 L",
    rawMaterialCount: 1,
    batchCost: 12500,
    status: "Pending"
  },
  {
    id: 6,
    batchName: "Tea",
    batchDate: "2025-08-10",
    batchSize: "100 L",
    rawMaterialCount: 0,
    batchCost: 0,
    status: "Draft"
  },
];

const statusStyles = {
  "Completed": "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Draft": "bg-gray-100 text-gray-800"
};

export default function ReCreatedBatchReport() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBatches = batchesData.filter((batch) =>
    batch.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (

    <>
      <Navbar />
       <div className="p-6 font-sans bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800">Product Batch Management</h2>
            <p className="text-gray-600 mt-1">
              View, manage, and track all your product batches
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
           <Link to="/batch-recreation">
  <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200">
    <FaPlus /> Create New Batch
  </button>
</Link>
          </div>
        </div>

        {/* Batch Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Materials
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No batches found matching your search criteria
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{batch.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {batch.batchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {batch.batchDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {batch.batchSize}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          batch.rawMaterialCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.rawMaterialCount} materials
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{batch.batchCost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusStyles[batch.status]
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          <button
                            title="Print"
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                          >
                            <FaPrint className="h-4 w-4" />
                          </button>
                          <button
                            title="View"
                            className="text-gray-500 hover:text-green-600 transition-colors"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            title="Edit"
                            className="text-gray-500 hover:text-orange-600 transition-colors"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            title="Delete"
                            className="text-gray-500 hover:text-red-600 transition-colors"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination and Summary */}
        <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <div className="mb-2 md:mb-0">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBatches.length}</span> of{' '}
            <span className="font-medium">{batchesData.length}</span> batches
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md bg-blue-600 text-white hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
   
  );
}