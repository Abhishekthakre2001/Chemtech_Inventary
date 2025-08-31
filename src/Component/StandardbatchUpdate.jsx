import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck } from "react-icons/fa";
import { Pencil, Trash2 } from "lucide-react";
import Navbar from "./Navbar";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

export default function StandardbatchUpdate() {
  const { id } = useParams();

  // State for batch data
  const [batch, setBatch] = useState({
    id: "",
    batchDate: "",
    batchName: "",
    batchSize: "",
    batchUnit: "Liters",
    materials: [],
  });
  const [rawMaterialsList, setRawMaterialsList] = useState([]);

  // State for Raw Material Form
  const [materialForm, setMaterialForm] = useState({
    formId: null,            // local unique id for React rendering/editing
    rawMaterialId: "",        // actual raw material id from DB
    name: "",
    quantity: "",
    percentage: "",
    unit: "Kg",
  });

  const [isEditing, setIsEditing] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const response = await axios.get(
          `https://inventary.chemtechengineers.in/backend/batch/get_batch_byid.php?id=${id}`
        );
        if (response.data.success) {
          setBatch(response.data.data);
        } else {
          console.error("Failed to fetch batch data");
        }
      } catch (error) {
        console.error("Error fetching batch data:", error);
      }
    };

    if (id) fetchBatchData();
  }, [id]);

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

  // Handle input changes for batch info
  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setBatch((prev) => ({ ...prev, [name]: value }));
  };

  // Handle raw material form change
  const handleMaterialFormChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add or Update material
  const handleAddOrUpdateMaterial = () => {
    // Validation
    if (!materialForm.name.trim()) {
      // alert("Please select a material.");
      toast.error("Please select a material.", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#F44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#F44336",
        },
      });
      return;
    }
    if (!materialForm.quantity || Number(materialForm.quantity) < 1) {
      // alert("Quantity must be at least 1.");
      toast.error("Quantity must be at least 1.", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#F44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#F44336",
        },
      });
      return;
    }
    if (!materialForm.percentage || Number(materialForm.percentage) < 1 || Number(materialForm.percentage) > 100) {
      // alert("Percentage must be between 1 and 100.");
      toast.error("Percentage must be between 1 and 100.", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#F44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#F44336",
        },
      });
      return;
    }
    if (!materialForm.unit.trim()) {
      alert("Unit is required.");
      toast.error("Unit is required.", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#F44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#F44336",
        },
      });
      return;
    }

    if (isEditing) {
      setBatch((prev) => ({
        ...prev,
        materials: prev.materials.map((m) =>
          m.formId === materialForm.formId ? { ...materialForm } : m
        ),
      }));
      setIsEditing(false);
    } else {
      setBatch((prev) => ({
        ...prev,
        materials: [
          ...prev.materials,
          { ...materialForm, id: Date.now() }, // ✅ unique UI id
        ],
      }));
    }

    // Reset form
    setMaterialForm({
      formId: null,
      rawMaterialId: "",
      name: "",
      quantity: "",
      percentage: "",
      unit: "Kg",
    });
  };


  // Delete material from table
  const handleDeleteMaterial = (materialId) => {
    setBatch((prev) => ({
      ...prev,
      materials: prev.materials.filter((m) => m.id !== materialId),
    }));
  };

  // Edit material (load into form)
  const handleEditMaterial = (materialId) => {
    const material = batch.materials.find((m) => m.id === materialId);
    if (material) {
      setMaterialForm(material);
      setIsEditing(true);
    }
  };

  // Submit batch
  const handleSubmit = async () => {
    // Validation for required batch fields
    if (!batch.id) {
      toast.error("Batch ID is required", { position: "top-center" });
      return;
    }

    if (!batch.batchName.trim()) {
      toast.error("Batch Name is required", { position: "top-center" });
      return;
    }

    if (!batch.batchDate) {
      toast.error("Batch Date is required", { position: "top-center" });
      return;
    }

    if (!batch.batchSize || Number(batch.batchSize) <= 0) {
      toast.error("Batch Size must be greater than 0", { position: "top-center" });
      return;
    }

    if (!batch.batchUnit.trim()) {
      toast.error("Batch Unit is required", { position: "top-center" });
      return;
    }

    // Validation for materials
    if (!batch.materials || batch.materials.length === 0) {
      toast.error("At least one material is required", { position: "top-center" });
      return;
    }

    // Ensure total percentage = 100
    const totalPercentage = batch.materials.reduce(
      (sum, mat) => sum + Number(mat.percentage || 0),
      0
    );

    if (totalPercentage !== 100) {
      toast.error("Total material percentage must be exactly 100%", {
        position: "top-center",
      });
      return;
    }

    // If all good → submit payload
    const formattedData = {
      id: batch.id,
      batchDate: batch.batchDate,
      batchName: batch.batchName,
      batchSize: batch.batchSize,
      batchUnit: batch.batchUnit,
      materials: batch.materials,
    };

    console.log("Final Payload:", JSON.stringify(formattedData, null, 2));

    try {
      const response = await axios.post(
        "https://inventary.chemtechengineers.in/backend/batch/update_batch.php",
        formattedData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        toast.success("Batch updated successfully!", {
          position: "top-center",
          style: {
            borderRadius: "12px",
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "500",
            padding: "14px 20px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        });
        console.log("API Response:", response.data);
      } else {
        toast.error(response.data.message || "Failed to update batch", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("API Error:", error?.response?.data?.message);
      toast.error(error?.response?.data?.message || "Something went wrong!", {
        position: "top-center",
      });
    }
  };

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="mt-5 max-w-full mx-auto p-6 bg-white rounded-lg shadow-lg xl:ml-[17rem]">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Update Standard Batch
        </h2>

        {/* Batch Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Batch Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                name="batchName"
                value={batch.batchName}
                onChange={handleBatchChange}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Date *
              </label>
              <input
                type="date"
                name="batchDate"
                value={batch.batchDate}
                onChange={handleBatchChange}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size *
              </label>
              <div className="flex">
                <input
                  type="number"
                  name="batchSize"
                  value={batch.batchSize}
                  onChange={handleBatchChange}
                  className="no-spinner border border-gray-300 p-2 rounded-l w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  name="batchUnit"
                  value={batch.batchUnit}
                  onChange={handleBatchChange}
                  className="border border-gray-300 border-l-0 p-2 rounded-r bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Liters">Liters</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Grams">Grams</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Raw Materials Form */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Raw Materials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
            {/* Material Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material *
              </label>
              <select
                value={materialForm.rawMaterialId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedItem = rawMaterialsList.find(item => item.id == selectedId);

                  setMaterialForm((prev) => ({
                    ...prev,
                    rawMaterialId: selectedId,   // ✅ store real id
                    name: selectedItem ? selectedItem.raw_material_name : ""
                  }));
                }}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Material</option>
                {rawMaterialsList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.raw_material_name}
                  </option>
                ))}
              </select>


            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={materialForm.quantity}
                onChange={handleMaterialFormChange}
                placeholder="Qty"
                className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Percentage *
              </label>
              <input
                type="number"
                name="percentage"
                value={materialForm.percentage}
                onChange={handleMaterialFormChange}
                placeholder="%"
                className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                name="unit"
                value={materialForm.unit}
                onChange={handleMaterialFormChange}
                className="border border-gray-300 p-2 rounded w-full bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Add / Update Button */}
            <div className="flex items-end">
              <button
                onClick={handleAddOrUpdateMaterial}
                type="button"
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                {isEditing ? "Update" : (
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
                <th className="p-3 text-center">Edit</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {batch.materials && batch.materials.length > 0 ? (
                batch.materials.map((material) => (
                  <tr
                    key={material.id}
                    className="hover:bg-gray-100 even:bg-white odd:bg-gray-50"
                  >
                    <td className="p-3 border-b border-gray-200">
                      {material.name}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-right">
                      {material.quantity}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-right">
                      {material.percentage}%
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditMaterial(material.id)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 shadow-sm transition-all duration-200"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 shadow-sm transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-4 text-center text-gray-500"
                  >
                    No materials added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button className="py-2 px-4 gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center">
            <FaTimes /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-4 gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
          >
            <FaCheck /> Update Batch
          </button>
        </div>
      </div>
    </>
  );
}
