import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const SuppliersManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ declared at top

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
    }, []);




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

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // setLoading(true);
        // setError("");
        // setSuccess("");

        try {
            const res = await axios.post("https://inventary.chemtechengineers.in/backend/supplier/add_supplier.php", formData, {
                headers: { "Content-Type": "application/json" }
            });

            if (res.data.success) {
                setSuccess("Data saved successfully!");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setError(res.data.message || "Something went wrong");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    // Update existing supplier
    const handleUpdate = async (e) => {
        e.preventDefault();
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
                alert("Supplier updated successfully!");
                //   refreshSuppliers();
                setIsModalOpen(false);
            } else {
                alert(res.data.message || "Failed to update supplier");
            }
        } catch (error) {
            console.error("Error updating supplier:", error);
            alert("Something went wrong while updating supplier");
        } finally {
            setLoading(false);
        }
    };


    // Delete supplier
    const deleteSupplier = async (id) => {
        if (!window.confirm("Are you sure you want to delete this supplier?")) {
            return;
        }

        try {
            const res = await axios.post(
                "https://inventary.chemtechengineers.in/backend/supplier/delete_supplier.php",
                { id }
            );

            if (res.data.success) {
                alert("Supplier deleted successfully!");
                setSuppliers(suppliers.filter((s) => s.id !== id)); // update state after success
            } else {
                alert(res.data.message || "Failed to delete supplier");
            }
        } catch (error) {
            console.error("Error deleting supplier:", error);
            alert("Something went wrong while deleting supplier");
        }
    };


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Suppliers Management</h1>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        <FaPlus /> Add Supplier
                    </button>
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openEditModal(supplier)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => deleteSupplier(supplier.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
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
                                                Address
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
                                        className="px-4 py-2 border rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        {editingId ? 'Update Supplier' : 'Save Supplier'}
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