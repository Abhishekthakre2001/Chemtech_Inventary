import React, { useState, useEffect } from 'react';
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const CategoryManagement = () => {
    // Sample initial categories
    const [categories, setCategories] = useState([]);

    // Fetch categories from API
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
    }, []);


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
                    name: currentCategory.name, // send only required field
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.success) {
                alert(data.message);
                // Reset form and close modal
                setCurrentCategory({ name: "" });
                setIsModalOpen(false);
                // Optionally refresh category list here
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error adding category:", error);
            alert("Something went wrong while adding the category.");
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
                alert(data.message);
                setCurrentCategory({ name: "" });
                setIsModalOpen(false);
                fetchCategories(); // refresh list after update
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error updating category:", error);
            alert("Something went wrong while updating the category.");
        }
    };

    // Delete category
    const deleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            const { data } = await axios.post(
                "https://inventary.chemtechengineers.in/backend/category/delete_category.php",
                { id }, // send category id
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (data.success) {
                alert(data.message);
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("Something went wrong while deleting the category.");
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
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
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
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
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
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
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="text-red-600 hover:text-red-900 p-1"
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
                                        className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
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