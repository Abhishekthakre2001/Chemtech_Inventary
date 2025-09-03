import React, { useState, useEffect } from 'react';
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { Pencil, Trash2 } from "lucide-react";

const SuppliersManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true); // ✅ declared at top





    // State for form and modal
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        contactPerson: '',
        contactNumber: '',
        email: '',
        address: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        products: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);

    // Filter suppliers based on search term
    const filteredSuppliers = suppliers.filter(supplier =>
        Object.values(supplier).some(
            value => value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Fetch bank details when IFSC code changes
    const fetchBankDetails = async (ifsc) => {
        if (!ifsc) return;

        try {
            const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
            const data = await response.json();
            setBankDetails(data);

            // Auto-fill bank details if available
            if (data.BANK) {
                setFormData(prev => ({
                    ...prev,
                    bankName: data.BANK,
                    branch: data.BRANCH || '',
                    city: data.CITY || '',
                    state: data.STATE || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching bank details:', error);
            setBankDetails(null);
        }
    };

    // Handle IFSC code blur (when user leaves the field)
    const handleIfscBlur = () => {
        fetchBankDetails(formData.ifscCode);
    };

    // Open modal for adding new supplier
    const openAddModal = () => {
        setFormData({
            id: '',
            name: '',
            contactPerson: '',
            contactNumber: '',
            email: '',
            address: '',
            accountNumber: '',
            bankName: '',
            ifscCode: '',
            products: ''
        });
        setEditingId(null);
        setIsModalOpen(true);
    };

    // Open modal for editing existing supplier
    const openEditModal = (supplier) => {
        setFormData(supplier);
        setEditingId(supplier.id);
        setIsModalOpen(true);
    };


    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (isSubmitting) return;

    //     setIsSubmitting(true);
    //     setLoading(true);
    //     // setError("");
    //     // setSuccess("");

    //     try {
    //         const res = await axios.post("https://inventary.chemtechengineers.in/backend/supplier/add_supplier.php", formData, {
    //             headers: { "Content-Type": "application/json" }
    //         });

    //         if (res.data.success) {
    //             // Close the popup
    //             setIsModalOpen(false);

    //             // Show a styled success toast
    //             toast.success(editingId ? 'Supplier updated successfully!' : 'Supplier added successfully!', {
    //                 position: "top-center",
    //                 style: {
    //                     borderRadius: "12px",
    //                     background: "#4CAF50",
    //                     color: "#fff",
    //                     fontWeight: "500",
    //                     padding: "14px 20px",
    //                     border: "2px solid #ffffff", // White border
    //                     boxShadow: `
    //         0 4px 6px -1px rgba(76, 175, 80, 0.2),
    //         0 2px 4px -1px rgba(76, 175, 80, 0.06),
    //         0 0 0 3px rgba(255, 255, 255, 0.4) // Glow effect
    //     `,
    //                     letterSpacing: "0.5px",
    //                     textShadow: "0 1px 1px rgba(0,0,0,0.1)",
    //                 },
    //                 iconTheme: {
    //                     primary: "#ffffff",
    //                     secondary: "#4CAF50",
    //                 },
    //                 duration: 3000,
    //                 className: "toast-success",
    //                 ariaProps: {
    //                     role: "alert",
    //                     "aria-live": "polite",
    //                 },
    //             });

    //             setFormData({ name: "", email: "", message: "" });
    //         } else {
    //             toast.error(res.data.message || "Something went wrong", {
    //                 position: "top-center",
    //                 style: {
    //                     borderRadius: "8px",
    //                     background: "#ff4d4d",
    //                     color: "#fff",
    //                     fontWeight: "500",
    //                     padding: "12px 16px",
    //                 },
    //             });
    //         }
    //     } catch (err) {
    //         toast.error(err.response?.data?.message || "Server error", {
    //             position: "top-center",
    //             style: {
    //                 borderRadius: "8px",
    //                 background: "#ff4d4d",
    //                 color: "#fff",
    //                 fontWeight: "500",
    //                 padding: "12px 16px",
    //             },
    //         });
    //     } finally {
    //         setLoading(false);
    //         setIsSubmitting(false);
    //     }
    // };

    // Update existing supplier
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Basic validations before API call
        if (!/^[0-9]+$/.test(formData.accountNumber)) {
            toast.error("Account Number must be a positive integer", { position: "top-center",  style: {
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "12px 16px",
                    }, });
            return;
        }

        if (!formData.contactPerson || !/^[a-zA-Z\s]+$/.test(formData.contactPerson)) {
            toast.error("Contact Person must contain letters only", { position: "top-center", style: {
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "12px 16px",
                    }, });
            return;
        }

        if (formData.bankName && !/^[a-zA-Z\s]+$/.test(formData.bankName)) {
            toast.error("Bank Name must contain letters only", { position: "top-center", style: {
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "12px 16px",
                    }, });
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
            toast.error("Contact Number must be a 10-digit positive number", { position: "top-center", style: {
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "12px 16px",
                    }, });
            return;
        }

        setIsSubmitting(true);
        setLoading(true);

        try {
            const res = await axios.post(
                "https://inventary.chemtechengineers.in/backend/supplier/add_supplier.php",
                formData,
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.data.success) {
                setIsModalOpen(false);

                toast.success(editingId ? "Supplier updated successfully!" : "Supplier added successfully!", {
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

                setFormData({
                    name: "",
                    email: "",
                    message: "",
                    accountNumber: "",
                    contactPerson: "",
                    bankName: "",
                    contactNumber: "",
                });
            } else {
                toast.error(res.data.message || "Something went wrong", {
                    position: "top-center",
                    style: {
                        borderRadius: "8px",
                        background: "#ff4d4d",
                        color: "#fff",
                        fontWeight: "500",
                        padding: "12px 16px",
                    },
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Server error", {
                position: "top-center",
                style: {
                    borderRadius: "8px",
                    background: "#ff4d4d",
                    color: "#fff",
                    fontWeight: "500",
                    padding: "12px 16px",
                },
            });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            const payload = {
                id: editingId,
                supplierName: formData.name, // backend expects supplierName
                contactPerson: formData.contactPerson,
                contactNumber: formData.contactNumber,
                email: formData.email,
                address: formData.address,
                bankAccount: formData.accountNumber, // backend expects bankAccount
                bankName: formData.bankName,
                ifscCode: formData.ifscCode,
                provideproduct: formData.products // backend expects provideproduct
            };

            const res = await axios.post(
                "https://inventary.chemtechengineers.in/backend/supplier/edit_supplier.php",
                payload
            );

            if (res.data.success) {
                // Close modal
                setIsModalOpen(false);

                // Show styled success toast for update
                toast.success("Supplier updated successfully!", {
                    position: "top-center",
                    style: {
                        borderRadius: "12px",
                        background: "#2196F3", // Blue for update
                        color: "#fff",
                        fontWeight: "500",
                        padding: "14px 20px",
                        border: "2px solid #ffffff", // White border
                        boxShadow: `
                        0 4px 6px -1px rgba(33, 150, 243, 0.2),
                        0 2px 4px -1px rgba(33, 150, 243, 0.06),
                        0 0 0 3px rgba(255, 255, 255, 0.4) // Glow effect
                    `,
                        letterSpacing: "0.5px",
                        textShadow: "0 1px 1px rgba(0,0,0,0.1)",
                    },
                    iconTheme: {
                        primary: "#ffffff",
                        secondary: "#2196F3",
                    },
                    duration: 3000,
                    className: "toast-success",
                    ariaProps: {
                        role: "alert",
                        "aria-live": "polite",
                    },
                });

                // refreshSuppliers(); // Uncomment if you need to reload list
            } else {
                toast.error(res.data.message || "Failed to update supplier", {
                    position: "top-center",
                    style: {
                        borderRadius: "12px",
                        background: "#F44336",
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
                        secondary: "#F44336",
                    },
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error updating supplier:", error);
            toast.error("Something went wrong while updating supplier", {
                position: "top-center",
                style: {
                    borderRadius: "12px",
                    background: "#F44336",
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
                    secondary: "#F44336",
                },
                duration: 3000,
            });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    // Delete supplier
    const deleteSupplier = async (id) => {
        // if (!window.confirm("Are you sure you want to delete this supplier?")) {
        //     return;
        // }

        try {
            const res = await axios.post(
                "https://inventary.chemtechengineers.in/backend/supplier/delete_supplier.php",
                { id }
            );

            if (res.data.success) {
                // Remove from state
                setSuppliers(suppliers.filter((s) => s.id !== id));

                // Show delete success toast
                toast.success("Supplier deleted successfully!", {
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
            } else {
                toast.error(res.data.message || "Failed to delete supplier", {
                    position: "top-center",
                    style: {
                        borderRadius: "12px",
                        background: "#F44336",
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
                        secondary: "#F44336",
                    },
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error deleting supplier:", error);
            toast.error("Something went wrong while deleting supplier", {
                position: "top-center",
                style: {
                    borderRadius: "12px",
                    background: "#F44336",
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
                    secondary: "#F44336",
                },
                duration: 3000,
            });
        }
    };

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const res = await axios.get(
                    "https://inventary.chemtechengineers.in/backend/supplier/list_suppliers.php"
                );

                if (res.data.success && Array.isArray(res.data.data)) {
                    const mappedSuppliers = res.data.data.map((item) => ({
                        id: parseInt(item.id),
                        name: item.supplierName,
                        contactPerson: item.contactPerson,
                        contactNumber: item.contactNumber,
                        email: item.email,
                        address: item.address,
                        accountNumber: item.bankAccount,
                        bankName: item.bankName,
                        ifscCode: item.ifscCode,
                        products: item.provideproduct
                    }));

                    setSuppliers(mappedSuppliers);
                } else {
                    console.error("Unexpected API response", res.data);
                }
            } catch (error) {
                console.error("Error fetching suppliers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, [isModalOpen]);

    return (
        <div className="p-6 max-w-7xl mx-auto ">
            <Toaster />
            <div className="flex flex-col lg:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 text-nowrap mr-4">Suppliers Management</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0 w-full">
                    {/* Search Box */}
                    <div className="relative w-full md:w-auto flex-1">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Add Supplier Button */}
                    <button
                        onClick={openAddModal}
                        className="w-full md:w-auto text-nowrap text-sm px-4 py-2 gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        <FaPlus /> Add Supplier
                    </button>
                </div>

            </div>

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden ">
                <div className="overflow-x-auto ">
                    <table className="min-w-full divide-y divide-gray-200 ">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delete</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No suppliers found
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactPerson}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.contactNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.bankName}</td>
                                        {/* Edit Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(supplier)}
                                                className="flex items-center justify-center p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition duration-200 shadow-sm"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </td>

                                        {/* Delete Column */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => deleteSupplier(supplier.id)}
                                                className="flex items-center justify-center p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition duration-200 shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Supplier Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-25 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
                                    {editingId ? 'Edit Supplier' : 'Add New Supplier'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={editingId ? handleUpdate : handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-700">Basic Information</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Supplier Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contact Person *
                                            </label>
                                            <input
                                                type="text"
                                                name="contactPerson"
                                                value={formData.contactPerson}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Contact Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="contactNumber"
                                                value={formData.contactNumber}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Bank Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-gray-700">Bank Information</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Account Number
                                            </label>
                                            <input
                                                type="text"
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bank Name
                                            </label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                value={formData.bankName}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                IFSC Code
                                            </label>
                                            <input
                                                type="text"
                                                name="ifscCode"
                                                value={formData.ifscCode}
                                                onChange={handleChange}
                                                onBlur={handleIfscBlur}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                        {bankDetails && (
                                            <div className="bg-gray-50 p-3 rounded-md text-sm">
                                                <p><strong>Branch:</strong> {bankDetails.BRANCH}</p>
                                                <p><strong>City:</strong> {bankDetails.CITY}</p>
                                                <p><strong>State:</strong> {bankDetails.STATE}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Products Provided
                                            </label>
                                            <input
                                                type="text"
                                                name="products"
                                                value={formData.products}
                                                onChange={handleChange}
                                                className="w-full border rounded-md p-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="py-2 px-4 gap-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {editingId ? 'Updating...' : 'Saving...'}
                                            </>
                                        ) : (
                                            editingId ? 'Update Supplier' : 'Save Supplier'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersManagement;