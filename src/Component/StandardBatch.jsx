import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import Navbar from "./Navbar";
import { Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function StandardBatch() {
  const [rawMaterialsList, setRawMaterialsList] = useState([]);

  const [batchName, setBatchName] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [batchSize, setBatchSize] = useState("");
  const [batchUnit, setBatchUnit] = useState("Liters");
  const [loading, setLoading] = useState(false);

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

    if (percentage < 1 || percentage > 100) {
      alert("Percentage must be between 1 and 100");
      return;
    }

    if (quantity < 1) {
      alert("Quantity must be at least 1");
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
    console.log("materials", materials);
    setLoading(true);

    // 1️⃣ Batch-level validation
    if (!batchName || !batchDate || !batchSize || materials.length === 0) {
      toast.error("Please fill all required batch information and add at least one material", {
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
      setLoading(false);
      return;
    }

    // 2️⃣ Materials validation
    for (let i = 0; i < materials.length; i++) {
      const { rawMaterial, quantity, percentage, unit } = materials[i];

      if (!rawMaterial || !quantity || !percentage || !unit) {
        toast.error(`Material ${i + 1}: Please fill all fields`, {
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
        setLoading(false);
        return;
      }

      if (percentage < 1 || percentage > 100) {
        toast.error(`Material ${i + 1}: Percentage must be between 1 and 100`, {
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
        setLoading(false);
        return;
      }

      if (quantity < 1) {
        toast.error(`Material ${i + 1}: Quantity must be at least 1`, {
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
        setLoading(false);
        return;
      }
    }

    // 3️⃣ Sum of percentages validation
    const totalPercentage = materials.reduce(
      (sum, item) => sum + Number(item.percentage),
      0
    );

    if (totalPercentage !== 100) {
      toast.error(`Total percentage must be exactly 100 (currently ${totalPercentage})`, {
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
      setLoading(false);
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
      const response = await fetch(
        "https://inventary.chemtechengineers.in/backend/batch/add_batch.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(batchData),
        }
      );

      const data = await response.json();
      setLoading(false);
      if (data.success) {
        toast.success("Batch submitted successfully!", {
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
        });
        handleCancel();
        // Reset form or redirect here
      } else {
        setLoading(false);
        toast.error(data.message || "Error submitting batch", {
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
      setLoading(false);
      toast.error(`Fetch error: ${error.message}`, {
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


  console.log("unit", unit);
  // Handle raw material change
  const handleRawMaterialChange = (e) => {
    const selectedName = e.target.value;
    setRawMaterial(selectedName);

    // Find the selected raw material object
    const selectedItem = rawMaterialsList.find(
      (item) => item.raw_material_name === selectedName
    );

    if (selectedItem) {
      setUnit(selectedItem.quantity_unit); // auto-set unit
    } else {
      setUnit(""); // reset if none
    }
  };


  return (
    <>
      <Navbar />
      <Toaster />
      <div className="mt-5 max-w-full mx-auto p-6 bg-white rounded-lg shadow-lg xl:ml-[17rem]">
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
                max={new Date().toISOString().split("T")[0]}
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
                  onKeyDown={(e) => {
                    // Block e, +, -, .
                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setBatchSize(e.target.value)}
                  className="no-spinner border border-gray-300 p-2 rounded-l w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onChange={handleRawMaterialChange}
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
                onKeyDown={(e) => {
                  // Block e, +, -, .
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setQuantity(e.target.value)}
                className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage *</label>
              <input
                type="number"
                placeholder="%"
                onKeyDown={(e) => {
                  // Block e, +, -, .
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => e.target.blur()}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
              {/* <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Unit</option>
                <option>Liters</option>
                <option>Kilograms</option>
                <option>Grams</option>
                <option>Milliliters</option>
              </select> */}
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddMaterial}
                className={`flex items-center justify-center w-full py-2 px-4 rounded ${editIndex !== null
                  ? " py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                  : " py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
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
            <thead className="bg-blue-200 text-black">
              <tr>
                <th className="p-3 text-left">Material</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Percentage</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-center">Update</th>
                <th className="p-3 text-center">Delete</th>
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

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => handleEdit(index)}
                      title="Edit"
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow-sm transition-all duration-200"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  </td>

                  {/* Delete Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => handleDelete(index)}
                      title="Delete"
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 shadow-sm transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
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
            className="py-2 px-4 gap-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
          >
            <FaTimes /> Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <FaCheck /> Submit Batch
              </>
            )}
          </button>
        </div>
      </div>
    </>

  );
}