import React, { useState, useEffect  } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import Navbar from "./Navbar";

export default function StandardBatch() {
  const [rawMaterialsList, setRawMaterialsList] = useState([]);

  const [batchName, setBatchName] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [batchSize, setBatchSize] = useState("");
  const [batchUnit, setBatchUnit] = useState("Liters");

  const [rawMaterial, setRawMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [percentage, setPercentage] = useState("");
  const [unit, setUnit] = useState("");

  const [materials, setMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleAddMaterial = () => {
    if (!rawMaterial || !quantity || !percentage || !unit) {
      alert("Please fill all material fields");
      return;
    }

    const newMaterial = { rawMaterial, quantity, percentage, unit };

    if (editIndex !== null) {
      const updated = [...materials];
      updated[editIndex] = newMaterial;
      setMaterials(updated);
      setEditIndex(null);
    } else {
      setMaterials([...materials, newMaterial]);
    }

    // Reset fields
    setRawMaterial("");
    setQuantity("");
    setPercentage("");
    setUnit("");
  };

  const handleEdit = (index) => {
    const mat = materials[index];
    setRawMaterial(mat.rawMaterial);
    setQuantity(mat.quantity);
    setPercentage(mat.percentage);
    setUnit(mat.unit);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

const handleSubmit = async () => {
  if (!batchName || !batchDate || !batchSize || materials.length === 0) {
    alert("Please fill all required batch information and add at least one material");
    return;
  }

  const batchData = {
    batchName,
    batchDate,
    batchSize,
    batchUnit,
    materials,
  };

  try {
    const response = await fetch('https://inventary.chemtechengineers.in/backend/batch/add_batch.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(batchData),
    });
    const data = await response.json();
    if (data.success) {
      alert("Batch submitted successfully!");
      // reset form or redirect
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    alert("Fetch error: " + error.message);
  }
};


  const handleCancel = () => {
    setBatchName("");
    setBatchDate("");
    setBatchSize("");
    setBatchUnit("Liters");
    setMaterials([]);
    setRawMaterial("");
    setQuantity("");
    setPercentage("");
    setUnit("");
    setEditIndex(null);
  };

  useEffect(() => {
    fetch("https://inventary.chemtechengineers.in/backend/raw_material/list_raw_material.php")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRawMaterialsList(data.data);
        }
      })
      .catch(err => console.error("Error fetching raw materials:", err));
  }, []);


  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Create New Product Batch
        </h2>

        {/* Batch Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Batch Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
              <input
                type="text"
                placeholder="Enter batch name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Date *</label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size *</label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="Enter size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="border border-gray-300 p-2 rounded-l w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={batchUnit}
                  onChange={(e) => setBatchUnit(e.target.value)}
                  className="border border-gray-300 border-l-0 p-2 rounded-r bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Liters</option>
                  <option>Kilograms</option>
                  <option>Grams</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Materials */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Raw Materials</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
              <select
                value={rawMaterial}
                onChange={e => setRawMaterial(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Material</option>
                {rawMaterialsList.map((item) => (
                  <option key={item.id} value={item.raw_material_name}>
                    {item.raw_material_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage *</label>
              <input
                type="number"
                placeholder="%"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Unit</option>
                <option>Liters</option>
                <option>Kilograms</option>
                <option>Grams</option>
                <option>Milliliters</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddMaterial}
                className={`flex items-center justify-center w-full py-2 px-4 rounded ${editIndex !== null
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
              >
                {editIndex !== null ? (
                  <>
                    <FaCheck className="mr-2" /> Update
                  </>
                ) : (
                  <>
                    <FaPlus className="mr-2" /> Add
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Materials Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3 text-left">Material</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Percentage</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                >
                  <td className="p-3 border-b border-gray-200">{mat.rawMaterial}</td>
                  <td className="p-3 border-b border-gray-200 text-right">{mat.quantity}</td>
                  <td className="p-3 border-b border-gray-200 text-right">{mat.percentage}%</td>
                  <td className="p-3 border-b border-gray-200">{mat.unit}</td>
                  <td className="p-3 border-b border-gray-200 flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No materials added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            <FaTimes /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            <FaCheck /> Submit Batch
          </button>
        </div>
      </div>
    </>

  );
}