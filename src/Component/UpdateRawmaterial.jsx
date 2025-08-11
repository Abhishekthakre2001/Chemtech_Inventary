import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import { FaEdit, FaTrash, FaSave, FaPlus, FaRedo } from "react-icons/fa";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const UpdateRawmaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    id: id,
    purchaseCode: "",
    rawMaterialName: "",
    rawMaterialCode: "",
    rateLanded: "",
    dateIn: "",
    expiryDate: "",
    categoryId: "",
    quantity: "",
    quantityUnit: "",
    purchasePrice: "",
    supplierId: "",
  });

  // Fetch initial data
  useEffect(() => {
    // Fetch categories
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

    // Fetch suppliers
    axios
      .get("https://inventary.chemtechengineers.in/backend/supplier/list_suppliers.php")
      .then((res) => {
        if (res.data.success) {
          setSuppliers(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching suppliers:", err));

    // Fetch existing raw material data if in edit mode
    if (id) {
      axios
        .get(`https://inventary.chemtechengineers.in/backend/raw_material/get_raw_materials_dropdown.php?id=${id}`)
        .then((res) => {
          if (res.data.success) {
            const data = res.data.data;
            setFormData({
              id: data.id,
              purchaseCode: data.purchase_code,
              rawMaterialName: data.raw_material_name,
              rawMaterialCode: data.raw_material_code,
              rateLanded: data.rate_landed,
              dateIn: data.date_in,
              expiryDate: data.expiry_date || "",
              categoryId: data.category_id,
              quantity: data.quantity,
              quantityUnit: data.quantity_unit,
              purchasePrice: data.purchase_price,
              supplierId: data.supplier_id,
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching raw material:", err);
          alert("Failed to load raw material data");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("formData", formData);

  // Validate required fields
  if (
    !formData.purchaseCode ||
    !formData.rawMaterialName ||
    !formData.rawMaterialCode ||
    !formData.rateLanded ||
    !formData.dateIn ||
    (formData.categoryId === null || formData.categoryId === undefined || formData.categoryId === "") ||
    !formData.quantity ||
    !formData.quantityUnit ||
    !formData.purchasePrice ||
    (formData.supplierId === null || formData.supplierId === undefined || formData.supplierId === "")
  ) {
    toast.error("Please fill all required fields", {
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
    return;
  }

  try {
    const response = await axios.post(
      "https://inventary.chemtechengineers.in/backend/raw_material/edit_raw_material.php",
      formData
    );

    if (response.data.success) {
      toast.success("Raw material updated successfully!", {
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

      navigate("/raw-material-list");
    } else {
      throw new Error(response.data.message || "Failed to update raw material");
    }
  } catch (err) {
    console.error("Error updating raw material:", err);
    toast.error(err.message || "Error updating raw material", {
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
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all changes?")) {
      // Reload the form data
      axios
        .get(`https://inventary.chemtechengineers.in/backend/raw_material/get_raw_material.php?id=${id}`)
        .then((res) => {
          if (res.data.success) {
            const data = res.data.data;
            setFormData({
              id: data.id,
              purchaseCode: data.purchase_code,
              rawMaterialName: data.raw_material_name,
              rawMaterialCode: data.raw_material_code,
              rateLanded: data.rate_landed,
              dateIn: data.date_in,
              expiryDate: data.expiry_date || "",
              categoryId: data.category_id,
              quantity: data.quantity,
              quantityUnit: data.quantity_unit,
              purchasePrice: data.purchase_price,
              supplierId: data.supplier_id,
            });
          }
        })
        .catch((err) => {
          console.error("Error fetching raw material:", err);
          alert("Failed to reset form data");
        });
    }
  };

  return (
    <>
      <Navbar />
        <Toaster />
      <div className="p-4 max-w-7xl mx-auto mt-10 xl:ml-[17rem]">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {id ? "Update Raw Material" : "Add New Raw Material"}
        </h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Form Fields */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Code *
                </label>
                <input
                  name="purchaseCode"
                  placeholder="PUR-001"
                  value={formData.purchaseCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Raw Material Name *
                </label>
                <input
                  name="rawMaterialName"
                  placeholder="Material Name"
                  value={formData.rawMaterialName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Raw Material Code *
                </label>
                <input
                  name="rawMaterialCode"
                  placeholder="RM-001"
                  value={formData.rawMaterialCode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Rate Landed *
                </label>
                <input
                  type="number"
                  name="rateLanded"
                  placeholder="0.00"
                  value={formData.rateLanded}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Date In *
                </label>
                <input
                  type="date"
                  name="dateIn"
                  value={formData.dateIn}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
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
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity Unit *
                </label>
                <select
                  name="quantityUnit"
                  value={formData.quantityUnit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                <label className="block text-sm font-medium text-gray-700">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Supplier *
                </label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <FaRedo /> Reset
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FaSave /> {id ? "Update Material" : "Save Material"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateRawmaterial;