import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaSearch, FaPrint, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";


const statusStyles = {
  "Completed": "bg-green-100 text-green-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Draft": "bg-gray-100 text-gray-800"
};

export default function ProductBatch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [errorBatch, setErrorBatch] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ new loading state

  const [batchesData, setBatchesData] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://inventary.chemtechengineers.in/backend/batch/get_batches.php")
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          const transformed = res.data.data.map((batch) => {
            const batchSizeWithUnit = `${parseFloat(batch.batchSize)} ${batch.batchUnit}`;
            const rawMaterialCount = batch.materials ? batch.materials.length : 0;
            const batchCost = 0;
            const status = "Completed";

            return {
              id: batch.id,
              batchName: batch.batchName,
              batchDate: batch.batchDate,
              batchSize: batchSizeWithUnit,
              rawMaterialCount,
              batchCost,
              status,
            };
          });

          setBatchesData(transformed);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch batches", err);
      })
      .finally(() => {
        setLoading(false); // ✅ stop loader when done
      });
  }, []);


  const filteredBatches = batchesData.filter((batch) =>
    batch.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = async (batchId) => {
    try {
      const res = await axios.get(`https://inventary.chemtechengineers.in/backend/batch/get_batch_byid.php?id=${batchId}`);
      if (res.data.success) {
        const batch = res.data.data;

        const content = `
        <html>
        <head>
          <title>Batch Report - ${batch.batchName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #eee; }
          </style>
        </head>
        <body>
          <h1>Batch Report</h1>
          <p><strong>Batch ID:</strong> ${batch.id}</p>
          <p><strong>Name:</strong> ${batch.batchName}</p>
          <p><strong>Date:</strong> ${batch.batchDate}</p>
          <p><strong>Size:</strong> ${batch.batchSize} ${batch.batchUnit}</p>
          <p><strong>Status:</strong> ${batch.status || 'N/A'}</p>

          <h2>Materials</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${batch.materials && batch.materials.length > 0
            ? batch.materials.map(mat => `
                      <tr>
                        <td>${mat.name || 'N/A'}</td>
                        <td>${mat.quantity}</td>
                        <td>${mat.unit}</td>
                        <td>${mat.percentage}</td>
                      </tr>
                    `).join('')
            : `<tr><td colspan="4" style="text-align:center;">No materials available</td></tr>`
          }
            </tbody>
          </table>
        </body>
        </html>
      `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();

      } else {
        alert('Failed to fetch batch data for printing');
      }
    } catch (err) {
      console.error("Error fetching batch for print:", err);
      alert('Error occurred while fetching batch data');
    }
  };

  const fetchBatchById = async (batchId) => {
    setLoadingBatch(true);
    setErrorBatch(null);
    try {
      const response = await axios.get(
        `https://inventary.chemtechengineers.in/backend/batch/get_batch_byid.php?id=${batchId}`
      );
      if (response.data.success) {
        // assuming response.data.data is an object of batch details with materials array
        setSelectedBatch(response.data.data);
        setShowModal(true);
      } else {
        setErrorBatch("Failed to fetch batch details");
        setSelectedBatch(null);
      }
    } catch (err) {
      setErrorBatch("Error fetching batch details");
      setSelectedBatch(null);
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;

    try {
      const response = await axios.delete('https://inventary.chemtechengineers.in/backend/batch/delete_batch.php', {
        data: { id: batchId } // sending id in body
      });

      if (response.data.success) {
        alert('Batch deleted successfully!');
        // Refresh batch list after deletion
        fetchBatches(); // your method to reload batch list
      } else {
        alert('Delete failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting batch: ' + error.message);
    }
  };



  return (
    <>
      <Navbar />
      <div className="mt-6 p-6 font-sans bg-gray-50 min-h-screen xl:ml-[17rem]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800">Standard Batch</h2>
              <p className="text-gray-600 mt-1">
                View, manage, and track all your standard product batches
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
              <Link to="/standard-batch">
                <button className="w-full py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center">
                  <FaPlus /> Create standard Batch
                </button>
              </Link>
            </div>
          </div>

          {/* Batch Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-200 text-black">
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
                    {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Cost
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      Print
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                      View
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
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-6 text-center text-gray-600">
                        <div className="flex justify-center items-center space-x-2">
                         
                          <span className="text-sm font-medium">Loading batches...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.rawMaterialCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {batch.rawMaterialCount} materials
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{batch.batchCost.toLocaleString()}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[batch.status]
                            }`}>
                            {batch.status}
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

                        {/* View Column */}
                        <td className="p-3 border-b border-gray-200 text-center">
                          <button
                            onClick={() => fetchBatchById(batch.id)}
                            title="View"
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 shadow-sm transition-all duration-200"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                        </td>

                        {/* Edit Column */}
                        <td className="p-3 border-b border-gray-200 text-center">
                          <button
                            onClick={() => handleEdit(batch.id)}
                            title="Edit"
                            className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-800 shadow-sm transition-all duration-200"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </td>

                        {/* Delete Column */}
                        <td className="p-3 border-b border-gray-200 text-center">
                          <button
                            onClick={() => handleDeleteBatch(batch.id)}
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

        </div>
      </div>

      {showModal && (
        <BatchModal
          batch={selectedBatch}
          onClose={() => setShowModal(false)}
          loading={loadingBatch}
          error={errorBatch}
        />
      )}


    </>

  );
}

function BatchModal({ batch, onClose, loading, error }) {
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Batch Report - {batch.batchName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            &times;
          </button>
        </div>

        <p><strong>Batch ID:</strong> {batch.id}</p>
        <p><strong>Name:</strong> {batch.batchName}</p>
        <p><strong>Date:</strong> {batch.batchDate}</p>
        <p><strong>Size:</strong> {batch.batchSize} {batch.batchUnit}</p>
        <p><strong>Status:</strong> {batch.status || "N/A"}</p>

        <h3 className="mt-4 mb-2 font-semibold">Materials</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-1 text-left">Name</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Quantity</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Unit</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {batch.materials && batch.materials.length > 0 ? (
              batch.materials.map((mat) => (
                <tr key={mat.id}>
                  <td className="border border-gray-300 px-2 py-1">{mat.name || "N/A"}</td>
                  <td className="border border-gray-300 px-2 py-1">{mat.quantity}</td>
                  <td className="border border-gray-300 px-2 py-1">{mat.unit}</td>
                  <td className="border border-gray-300 px-2 py-1">{mat.percentage}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  No materials available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
