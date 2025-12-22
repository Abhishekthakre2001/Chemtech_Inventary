import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const RawMaterialList = () => {
  const navigate = useNavigate();
  const handleEdit = (id) => {
    navigate(`/update-raw-material/${id}`);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true); // start loading before fetch
    fetch(`${API_BASE_URL}raw_material/list_raw_material.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mappedData = data.data.map((item, index) => ({
            id: item.id || index + 1,
            purchaseCode: item.purchase_code || "",
            rawMaterialCode: item.raw_material_code || "",
            productId: item.productId || "",
            rateLanded: parseFloat(item.rate_landed) || 0,
            dateIn: item.date_in || "",
            name: item.raw_material_name || "",
            category: item.category_id || "",
            stock: `${item.quantity} ${item.quantity_unit}`.trim(),
            purchasePrice: parseFloat(item.purchase_price) || 0,
            supplier: item.supplier_id || "",
          }));
          setInventory(mappedData);
        }
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
      })
      .finally(() => {
        setLoading(false); // stop loading after fetch (success or error)
      });
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}raw_material/delete_raw_material.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Raw material deleted successfully!", {
          position: "top-center",
          style: {
            borderRadius: "12px",
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "500",
            padding: "14px 20px",
            border: "2px solid #ffffff",
            boxShadow: `
                        0 4px 6px -1px rgba(76, 175, 80, 0.2),
                        0 2px 4px -1px rgba(76, 175, 80, 0.06),
                        0 0 0 3px rgba(255, 255, 255, 0.4)
                    `,
            letterSpacing: "0.5px",
            textShadow: "0 1px 1px rgba(0,0,0,0.1)",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#4CAF50",
          },
          duration: 3000,
          ariaProps: {
            role: "alert",
            "aria-live": "polite",
          },
        });

        setInventory((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(result.message || "Failed to delete raw material!", {
          position: "top-center",
          style: {
            borderRadius: "12px",
            background: "#FF4D4F",
            color: "#fff",
            fontWeight: "500",
            padding: "14px 20px",
            border: "2px solid #ffffff",
            boxShadow: `
            0 4px 6px -1px rgba(255, 77, 79, 0.2),
            0 2px 4px -1px rgba(255, 77, 79, 0.06),
            0 0 0 3px rgba(255, 255, 255, 0.4)
          `,
            letterSpacing: "0.5px",
            textShadow: "0 1px 1px rgba(0,0,0,0.1)",
          },
          iconTheme: {
            primary: "#ffffff",
            secondary: "#FF4D4F",
          },
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong while deleting!", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#FF4D4F",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
          border: "2px solid #ffffff",
          boxShadow: `
          0 4px 6px -1px rgba(255, 77, 79, 0.2),
          0 2px 4px -1px rgba(255, 77, 79, 0.06),
          0 0 0 3px rgba(255, 255, 255, 0.4)
        `,
          letterSpacing: "0.5px",
          textShadow: "0 1px 1px rgba(0,0,0,0.1)",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#FF4D4F",
        },
        duration: 3000,
      });
    }
  };

  const filteredInventory = inventory.filter(item =>
    Object.values(item).some(
      value => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  return (
    <>
      <Navbar />
      <Toaster />
      <div className="p-6 max-w-7xl mx-auto xl:ml-[17rem] ">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Raw Material</h1>
          <p className="text-gray-600">View and manage your product data</p>
        </div>

        {/* Search and Add New */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Link to="/create-raw-material">
            <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center p-4">
              <FaPlus />  Add New
            </button>
          </Link>
        </div>

        {/* Table */}
        {/* <div className="bg-white rounded-xl shadow max-h-[70vh] overflow-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-200 text-black sticky top-0 z-20">
                <tr>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sr. No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Purchase Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Raw Material Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Rate Landed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Date In</th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">Supplier</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-nowrap">Update</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-nowrap">Delete</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.purchaseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rawMaterialCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.rateLanded.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dateIn}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{item.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleEdit(item.id)}
                          title="Edit"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow-sm transition-all duration-200"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 shadow-sm transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div> */}
        {/* Table */}
        <div className="bg-white rounded-xl shadow max-h-[70vh] overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">

            {/* Sticky Header */}
            <thead className="bg-blue-200 sticky top-0 z-30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Sr. No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Purchase Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Raw Material Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Rate Landed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Date In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Purchase Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-nowrap">
                  Supplier
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
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold text-nowrap text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">{item.purchaseCode}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">{item.rawMaterialCode}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">₹{item.rateLanded.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">
                      {item.dateIn
                        ? new Date(item.dateIn).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 text-sm text-nowrap">{item.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-nowrap">{item.stock}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">₹{item.purchasePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-nowrap">{item.supplier}</td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>


        {/* Pagination would go here */}
      </div>
    </>

  );
};

export default RawMaterialList;