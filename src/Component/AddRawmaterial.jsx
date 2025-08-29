import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaEdit, FaSave, FaPlus, FaRedo } from "react-icons/fa";
import { Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const AddRawmaterial = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    purchaseCode: "",
    rawMaterial: "",
    rawMaterialCode: "",
    rateLanded: "",
    dateIn: "",
    expiryDate: "",
    category: "",
    quantity: "",
    quantityUnit: "",
    purchasePrice: "",
    supplier: "",
  });

  useEffect(() => {
    axios
      .get("https://inventary.chemtechengineers.in/backend/category/list_categories.php")
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://inventary.chemtechengineers.in/backend/supplier/list_suppliers.php")
      .then((res) => {
        if (res.data.success) {
          setSuppliers(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  const [materials, setMaterials] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name || 'category']: value, // Fallback to 'category' if no name is given
    }));
  };


  const handleAddMaterial = () => {
    // Validate required fields
    if (!formData.purchaseCode || !formData.rawMaterial || !formData.rawMaterialCode ||
      !formData.rateLanded || !formData.dateIn || !formData.category ||
      !formData.quantity || !formData.quantityUnit || !formData.purchasePrice ||
      !formData.supplier) {
      alert("Please fill all required fields");
      return;
    }

    if (editIndex !== null) {
      const updated = [...materials];
      updated[editIndex] = formData;
      setMaterials(updated);
      setEditIndex(null);
    } else {
      setMaterials([...materials, formData]);
    }
    setFormData({
      purchaseCode: "",
      rawMaterial: "",
      rawMaterialCode: "",
      rateLanded: "",
      dateIn: "",
      expiryDate: "",
      category: "",
      quantity: "",
      quantityUnit: "",
      purchasePrice: "",
      supplier: "",
    });
  };

  const handleEdit = (index) => {
    setFormData(materials[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (materials.length === 0) {
      toast.error("Please add at least one material before saving", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#f44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
          border: "2px solid #ffffff",
          boxShadow: `
          0 4px 6px -1px rgba(244, 67, 54, 0.2),
          0 2px 4px -1px rgba(244, 67, 54, 0.06),
          0 0 0 3px rgba(255, 255, 255, 0.4)
        `,
          letterSpacing: "0.5px",
          textShadow: "0 1px 1px rgba(0,0,0,0.1)",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#f44336",
        },
        duration: 3000,
      });
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/raw_material/add_raw_material.php`,
        { data: materials }
      );
      console.log(res.data);

      toast.success("Data saved successfully!", {
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

      setMaterials([]);
      navigate("/raw-material-list");
    } catch (err) {
      console.error(err);
      toast.error("Error saving data", {
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#f44336",
          color: "#fff",
          fontWeight: "500",
          padding: "14px 20px",
          border: "2px solid #ffffff",
          boxShadow: `
          0 4px 6px -1px rgba(244, 67, 54, 0.2),
          0 2px 4px -1px rgba(244, 67, 54, 0.06),
          0 0 0 3px rgba(255, 255, 255, 0.4)
        `,
          letterSpacing: "0.5px",
          textShadow: "0 1px 1px rgba(0,0,0,0.1)",
        },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#f44336",
        },
        duration: 3000,
      });
    }
  };

  const handleReset = () => {
    if (materials.length > 0 && !window.confirm("Are you sure you want to reset all data?")) {
      return;
    }
    setFormData({
      purchaseCode: "",
      rawMaterial: "",
      rawMaterialCode: "",
      rateLanded: "",
      dateIn: "",
      expiryDate: "",
      category: "",
      quantity: "",
      quantityUnit: "",
      purchasePrice: "",
      supplier: "",
    });
    setMaterials([]);
    setEditIndex(null);
  };

  return (
    <>
      <Navbar />
      <Toaster />
      <div className="p-4 max-w-7xl mx-auto xl:ml-[17rem] ">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Purchase Raw Material</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editIndex !== null ? "Edit Material" : "Add New Material"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Form Fields */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Purchase Code *</label>
              <input
                name="purchaseCode"
                placeholder="PUR-001"
                value={formData.purchaseCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Raw Material *</label>
              <input
                name="rawMaterial"
                placeholder="Material Name"
                value={formData.rawMaterial}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Raw Material Code *</label>
              <input
                name="rawMaterialCode"
                placeholder="RM-001"
                value={formData.rawMaterialCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Rate Landed *</label>
              <input
                type="number"
                name="rateLanded"
                placeholder="0.00"
                value={formData.rateLanded}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Date In *</label>
              <input
                type="date"
                name="dateIn"
                value={formData.dateIn}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                name="quantity"
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Quantity Unit *</label>
              <select
                name="quantityUnit"
                value={formData.quantityUnit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Unit</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="pieces">Pieces</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Purchase Price *</label>
              <input
                type="number"
                name="purchasePrice"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Supplier *
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplierName}
                  </option>
                ))}
              </select>
            </div>

             <div className="mt-6">
            <button
              onClick={handleAddMaterial}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${editIndex !== null
                ? " py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                : " py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                }`}
            >
              {editIndex !== null ? (
                <>
                  <FaEdit /> Update Material
                </>
              ) : (
                <>
                  <FaPlus /> Add Raw Material
                </>
              )}
            </button>
          </div>
          </div>

          {/* Add/Update Button */}
         
        </div>

        {/* Materials Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Purchased Materials</h2>

          {materials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Purchase Code",
                      "Raw Material",
                      "Code",
                      "Rate",
                      "Date In",
                      "Expiry",
                      "Category",
                      "Quantity",
                      "Unit",
                      "Price",
                      "Supplier",
                      "Update", "Delete"
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materials.map((mat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mat.purchaseCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mat.rawMaterial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.rawMaterialCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(mat.rateLanded).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.dateIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.expiryDate || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mat.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.quantityUnit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{parseFloat(mat.purchasePrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mat.supplier}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-sm"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-3">
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No materials added yet. Add materials using the form above.
            </div>
          )}

          {/* Action Buttons */}
          {materials.length > 0 && (
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FaRedo /> Reset All
              </button>
              <button
                onClick={handleSave}
               className=" px-4 py-2 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <FaSave /> Save All Materials
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddRawmaterial;