import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const RawMaterialList = () => {
   const navigate = useNavigate();
const handleEdit = (id) => {
    navigate(`/update-raw-material/${id}`);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetch("https://inventary.chemtechengineers.in/backend/raw_material/list_raw_material.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mappedData = data.data.map((item, index) => ({
            id: item.id || index + 1,
            purchaseCode: item.purchase_code || "",
            rawMaterialCode: item.raw_material_code || "",
            productId: item.productId || "",             // this may or may not be present, keep as is
            rateLanded: parseFloat(item.rate_landed) || 0,
            dateIn: item.date_in || "",
            name: item.raw_material_name || "",
            category: item.category_id || "",            // or categoryName if you have it
            stock: `${item.quantity} ${item.quantity_unit}`.trim(),
            purchasePrice: parseFloat(item.purchase_price) || 0,
            supplier: item.supplier_id || ""             // or supplierName if you want
          }));
          setInventory(mappedData);
        }
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
      });
  }, []);


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;

    try {
      const response = await fetch(
        "https://inventary.chemtechengineers.in/backend/raw_material/delete_raw_material.php",
        {
          method: "POST", // using POST because you're sending JSON
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        // Remove deleted item from UI
        setInventory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting.");
    }
  };

  const filteredInventory = inventory.filter(item =>
    Object.values(item).some(
      value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Raw Material Inventory</h1>
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
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200">
              <FaPlus /> Add New
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Purchase Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Raw Material Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Rate Landed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Purchase Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.purchaseCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rawMaterialCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.rateLanded.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.dateIn}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900"  onClick={() => handleEdit(item.id)}>
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
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

        {/* Pagination would go here */}
      </div>
    </>

  );
};

export default RawMaterialList;