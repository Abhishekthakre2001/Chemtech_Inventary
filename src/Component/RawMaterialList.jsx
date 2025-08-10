import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import Navbar from "./Navbar";

export default function RawMaterialList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rawMaterials, setRawMaterials] = useState([
    {
      purchaseCode: "test",
      rawMaterialCode: "hj",
      productId: 5,
      rateLanded: 3.0,
      dateIn: "2025-08-09",
      name: "test",
      category: "Pranay Bobade",
      stock: "73.00 L",
      purchasePrice: 55.0,
      supplier: "ram store",
    },
  ]);

  const filteredData = rawMaterials.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
    <Navbar />
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Raw Material List</h1>
          <p className="text-gray-500">View and manage your raw material data</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200">
          <FaPlus /> Add New
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <label className="block text-gray-600 font-medium mb-1">Search</label>
        <input
          type="text"
          placeholder="Search raw materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Purchase Code</th>
              <th className="px-6 py-3">Raw Material Code</th>
              <th className="px-6 py-3">Product ID</th>
              <th className="px-6 py-3">Rate Landed</th>
              <th className="px-6 py-3">Date In</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Purchase Price</th>
              <th className="px-6 py-3">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-3">{item.purchaseCode}</td>
                <td className="px-6 py-3">{item.rawMaterialCode}</td>
                <td className="px-6 py-3">{item.productId}</td>
                <td className="px-6 py-3">{item.rateLanded}</td>
                <td className="px-6 py-3">{item.dateIn}</td>
                <td className="px-6 py-3">{item.name}</td>
                <td className="px-6 py-3">{item.category}</td>
                <td className="px-6 py-3">{item.stock}</td>
                <td className="px-6 py-3">{item.purchasePrice}</td>
                <td className="px-6 py-3">{item.supplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
    
  );
}
