import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const CategoryManagement = () => {
    // Sample initial categories
    const [categories, setCategories] = useState([]);

    // Fetch categories from API



    // State for modal and form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: '', name: '' });
    const [searchTerm, setSearchTerm] = useState('');

    // Filter categories based on search term
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Open modal for adding new category
    const openAddModal = () => {
        setCurrentCategory({ id: '', name: '' });
        setIsModalOpen(true);
    };

    // Open modal for editing category
    const openEditModal = (category) => {
        console.log("category",category)
        setCurrentCategory(category);
        setIsModalOpen(true);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "https://inventary.chemtechengineers.in/backend/category/add_category.php",
                {
                    name: currentCategory.name,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.success) {
                toast.success("Category added successfully!", {
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

                setCurrentCategory({ name: "" });
                setIsModalOpen(false);
                // Optionally refresh category list here
            } else {
                toast.error(data.message || "Failed to add category", {
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
            }
        } catch (error) {
            console.error("Error adding category:", error);
            toast.error("Something went wrong while adding the category.", {
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
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const { data } = await axios.post(
                "https://inventary.chemtechengineers.in/backend/category/edit_category.php",
                {
                    id: currentCategory.id,
                    name: currentCategory.name,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.success) {
                toast.success("Category updated successfully!", {
                    position: "top-center",
                    style: {
                        borderRadius: "12px",
                        background: "#2196F3", // Blue for update
                        color: "#fff",
                        fontWeight: "500",
                        padding: "14px 20px",
                        border: "2px solid #ffffff",
                        boxShadow: `
                        0 4px 6px -1px rgba(33, 150, 243, 0.2),
                        0 2px 4px -1px rgba(33, 150, 243, 0.06),
                        0 0 0 3px rgba(255, 255, 255, 0.4)
                    `,
                        letterSpacing: "0.5px",
                        textShadow: "0 1px 1px rgba(0,0,0,0.1)",
                    },
                    iconTheme: {
                        primary: "#ffffff",
                        secondary: "#2196F3",
                    },
                    duration: 3000,
                });

                setCurrentCategory({ name: "" });
                setIsModalOpen(false);
                fetchCategories();
            } else {
                toast.error(data.message || "Failed to update category", {
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
            }
        } catch (error) {
            console.error("Error updating category:", error);
            toast.error("Something went wrong while updating the category.", {
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
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        try {
            const { data } = await axios.post(
                "https://inventary.chemtechengineers.in/backend/category/delete_category.php",
                { id },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.success) {
                toast.success("Category deleted successfully!", {
                    position: "top-center",
                    style: {
                        borderRadius: "12px",
                        background: "#F44336", // Red for delete
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

                setCategories((prev) => prev.filter((cat) => cat.id !== id));
            } else {
                toast.error(data.message || "Failed to delete category", {
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
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error("Something went wrong while deleting the category.", {
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
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(
                "https://inventary.chemtechengineers.in/backend/category/list_categories.php"
            );

            if (data.success && Array.isArray(data.data)) {
                setCategories(data.data);
            } else {
                console.error("Invalid API response:", data);
                setCategories([]); // fallback to empty list
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            setCategories([]); // fallback to empty list
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [isModalOpen]);


    console.log("currentCategory",currentCategory)

    return (
        <div className="p-6 w-full mx-auto ">
            <Toaster />
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 ">
                <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0 md:w-64">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={openAddModal}
                        className="text-nowrap py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        <FaPlus /> Add Category
                    </button>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR. NO.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY NAME</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UPDATE</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">DELETE</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((category, index) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex justify-center space-x-3">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => openEditModal(category)}
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
                                                onClick={() => deleteCategory(category.id)}
                                                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
                                    {currentCategory.id ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (currentCategory.id) {
                                        console.log("Updating category:", currentCategory); // category with ID
                                        handleUpdate(e);
                                    } else {
                                        console.log("Adding category:", currentCategory); // new category
                                        handleSubmit(e);
                                    }
                                }}
                            >
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={currentCategory.name}
                                        onChange={(e) =>
                                            setCurrentCategory({ ...currentCategory, name: e.target.value })
                                        }
                                        className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter category name"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="py-2 px-4 gap-4  bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="py-2 px-4 gap-4  bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                                    >
                                        {currentCategory.id ? <FaSave /> : <FaPlus />}
                                        {currentCategory.id ? "Update Category" : "Add Category"}
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

export default CategoryManagement;