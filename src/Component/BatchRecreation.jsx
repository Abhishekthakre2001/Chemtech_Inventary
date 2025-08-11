import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaSearch, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";

const API_BASE_URL = 'https://inventary.chemtechengineers.in/backend';

// Error handling utility
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || error.message || defaultMessage;
  toast.error(message);
  throw new Error(message);
};

export default function BatchRecreation() {
    const [batches, setBatches] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [batchName, setBatchName] = useState("");
    const [batchDate, setBatchDate] = useState("");
    const [batchSize, setBatchSize] = useState("");
    const [batchUnit, setBatchUnit] = useState("L");
    const [rawMaterials, setRawMaterials] = useState([]);
    const [newMaterialId, setNewMaterialId] = useState("");
    const [newPercentage, setNewPercentage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch initial data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch batches
                const batchesResponse = await fetch(`${API_BASE_URL}/batch/get_batches.php`);
                if (!batchesResponse.ok) throw new Error('Failed to fetch batches');
                const batchesData = await batchesResponse.json();
                
                // Handle both array and object responses
                if (batchesData.success) {
                    setBatches(Array.isArray(batchesData.data) ? batchesData.data : []);
                } else {
                    setBatches([]);
                }

                // Fetch raw materials
                const materialsResponse = await fetch(`${API_BASE_URL}/raw_material/get_raw_materials_dropdown.php`);
                if (!materialsResponse.ok) {
                    console.warn('Failed to fetch raw materials dropdown');
                    setMaterials([]);
                } else {
                    const materialsData = await materialsResponse.json();
                    if (materialsData.success && Array.isArray(materialsData.data)) {
                        setMaterials(materialsData.data);
                    } else {
                        setMaterials([]);
                    }
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Failed to load initial data. Please refresh the page.');
                setBatches([]);
                setMaterials([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const loadBatchData = async () => {
        if (!selectedBatchId) {
            toast.error("Please select a batch first");
            return;
        }

        setIsLoading(true);
        try {
            // Fetch batch details
            const response = await fetch(`${API_BASE_URL}/batch/get_batch.php?id=${selectedBatchId}`);
            if (!response.ok) throw new Error('Failed to fetch batch details');
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to load batch data');
            }

            // Check if we got a single batch or an array of batches
            const batchData = Array.isArray(result.data) ? result.data[0] : result.data;
            
            if (!batchData) {
                throw new Error('No batch data found');
            }

            // Format the date to YYYY-MM-DD to avoid invalid date issues
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
            };

            setBatchName(batchData.batchName || batchData.batch_name || '');
            setBatchDate(formatDate(batchData.batchDate || batchData.batch_date));
            setBatchSize(batchData.batchSize || batchData.batch_size || '');
            setBatchUnit(batchData.batchUnit || batchData.batch_unit || 'L');

            // Process materials if they exist in the response
            if (batchData.materials && Array.isArray(batchData.materials)) {
                const formattedMaterials = batchData.materials.map((item, index) => ({
                    id: item.id || Date.now() + index,
                    materialId: item.id || item.raw_material_id,
                    materialName: item.name || item.raw_material_name,
                    percentage: parseFloat(item.percentage) || 0,
                    weight: parseFloat(item.quantity || item.quantity_used || 0),
                    unit: item.unit || item.unit_used || 'kg',
                    available: item.quantity || 0
                }));
                setRawMaterials(formattedMaterials);
            } else {
                setRawMaterials([]);
            }
        } catch (error) {
            handleApiError(error, 'Failed to load batch data');
            setRawMaterials([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMaterial = () => {
        if (!newMaterialId) {
            toast.error("Please select a material");
            return;
        }

        if (!newPercentage) {
            toast.error("Please enter a percentage");
            return;
        }

        const percentage = parseFloat(newPercentage);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            toast.error("Percentage must be between 0.01 and 100");
            return;
        }

        const materialExists = rawMaterials.some(
            (mat) => mat.materialId === parseInt(newMaterialId)
        );
        
        if (materialExists) {
            toast.error("This material is already added");
            return;
        }

        const selectedMaterial = materials.find(
            (m) => m.id === parseInt(newMaterialId)
        );

        if (!selectedMaterial) {
            toast.error("Selected material not found");
            return;
        }

        const totalPercentage = rawMaterials.reduce(
            (sum, mat) => sum + mat.percentage, 
            percentage
        );

        if (totalPercentage > 100) {
            toast.error(`Total percentage cannot exceed 100% (current: ${totalPercentage.toFixed(2)}%)`);
            return;
        }

        const weight = (parseFloat(batchSize || 0) * percentage) / 100;

        const newMaterial = {
            id: Date.now(),
            materialId: parseInt(newMaterialId),
            materialName: selectedMaterial.raw_material_name || selectedMaterial.name,
            percentage: percentage,
            weight: weight,
            unit: selectedMaterial.quantity_unit || 'kg',
            available: selectedMaterial.quantity || 0
        };

        setRawMaterials([...rawMaterials, newMaterial]);
        setNewMaterialId("");
        setNewPercentage("");
    };

    const calculateMaterialWeight = (percentage) => {
        if (!batchSize) return 0;
        return (parseFloat(batchSize) * parseFloat(percentage)) / 100;
    };

    const validatePercentage = (percentage) => {
        const value = parseFloat(percentage);
        if (isNaN(value) || value <= 0 || value > 100) {
            toast.error("Percentage must be between 0.01 and 100");
            return false;
        }
        return true;
    };

    const calculateTotalPercentage = (materials) => {
        return materials.reduce((sum, mat) => sum + parseFloat(mat.percentage || 0), 0);
    };

    const handleDeleteMaterial = (id) => {
        setRawMaterials(rawMaterials.filter((mat) => mat.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const handlePercentageChange = (id, newPerc) => {
        setRawMaterials((materials) =>
            materials.map((mat) => {
                if (mat.id === id) {
                    const weight = (parseFloat(batchSize || 0) * parseFloat(newPerc)) / 100;
                    return { ...mat, percentage: parseFloat(newPerc), weight };
                }
                return mat;
            })
        );
    };

    const startEditing = (id) => {
        const material = rawMaterials.find(mat => mat.id === id);
        if (material) {
            setNewMaterialId(material.materialId.toString());
            setNewPercentage(material.percentage.toString());
            setEditingId(id);
        }
    };

    const stopEditing = () => {
        setEditingId(null);
        setNewMaterialId("");
        setNewPercentage("");
    };

    const handleSaveBatch = async () => {
        if (!batchName || !batchSize) {
            toast.warning("Please fill in all required fields");
            return;
        }

        if (rawMaterials.length === 0) {
            toast.warning("Please add at least one material");
            return;
        }

        const totalPercentage = calculateTotalPercentage(rawMaterials);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            toast.warning("Total percentage must be exactly 100%");
            return;
        }

        const batchData = {
            original_batch_id: parseInt(selectedBatchId),
            recreated_batch_name: batchName,
            recreated_batch_date: new Date().toISOString().split('T')[0],
            recreated_batch_size: parseFloat(batchSize),
            recreated_batch_unit: batchUnit,
            materials: rawMaterials.map(mat => ({
                raw_material_id: mat.materialId,
                quantity_used: mat.weight,
                unit_used: mat.unit,
                percentage: mat.percentage,
                notes: ''
            }))
        };

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/batch_recreation/add_batch_recreation.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(batchData)
            });

            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save batch recreation');
            }

            toast.success("Batch recreated successfully!");
            // Reset form
            setSelectedBatchId("");
            setBatchName("");
            setBatchSize("");
            setBatchUnit("L");
            setRawMaterials([]);
        } catch (error) {
            handleApiError(error, 'Failed to save batch recreation');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculate total percentage for validation
    const totalPercentage = rawMaterials.reduce((sum, mat) => sum + mat.percentage, 0);
    const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;

    // Filter materials based on search term
    const filteredMaterials = materials.filter(material => {
        if (!material) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
            (material.raw_material_name || material.name || '').toLowerCase().includes(searchLower) ||
            (material.quantity_unit || '').toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center">
                    <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
                    <p className="text-gray-600">Loading data, please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <Navbar />
            <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow-xl xl:ml-[17rem]">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                    Batch Recreation System
                </h1>

                {/* Batch Selection */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Select Batch to Recreate</h2>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                            <select
                                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="">Select a batch...</option>
                                {batches.map((b) => {
                                    // Helper function to safely format date
                                    const formatDate = (dateString) => {
                                        if (!dateString) return 'No date';
                                        try {
                                            const date = new Date(dateString);
                                            return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString('en-IN');
                                        } catch (e) {
                                            return 'Invalid date';
                                        }
                                    };
                                    
                                    const displayDate = formatDate(b.batch_date || b.batchDate);
                                    const displayName = b.batch_name || b.batchName || `Batch ${b.id}`;
                                    
                                    return (
                                        <option key={b.id} value={b.id}>
                                            {displayName} - {displayDate}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                className="py-2 px-4 gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={loadBatchData}
                                disabled={!selectedBatchId || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <FaSearch className="mr-2" />
                                        Load Batch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Batch Details */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name *</label>
                        <input
                            type="text"
                            placeholder="Enter batch name"
                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size *</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Enter size"
                                    className="border border-gray-300 p-2 rounded-l w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={batchSize}
                                    onChange={(e) => {
                                        const newSize = e.target.value;
                                        setBatchSize(newSize);
                                        // Update all weights when batch size changes
                                        setRawMaterials(materials =>
                                            materials.map(mat => ({
                                                ...mat,
                                                weight: (parseFloat(newSize || 0) * mat.percentage) / 100
                                            }))
                                        );
                                    }}
                                    disabled={isLoading}
                                />
                                <select
                                    className="border border-gray-300 border-l-0 rounded-r px-2 bg-gray-100 text-gray-700"
                                    value={batchUnit}
                                    onChange={(e) => setBatchUnit(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="L">L</option>
                                    <option value="ml">ml</option>
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                </select>
                            </div>
                        </div>
                    
                </div>
            </div>

            {/* Raw Materials Section */}
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Raw Materials Composition</h2>

                {/* Materials Table */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-blue-200 text-black">
                            <tr>
                                <th className="p-3 text-left">Material</th>
                                <th className="p-3 text-left">Category</th>
                                <th className="p-3 text-right">Percentage (%)</th>
                                <th className="p-3 text-right">Weight (kg)</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No materials added yet
                                    </td>
                                </tr>
                            ) : (
                                rawMaterials.map((mat) => (
                                    <tr
                                        key={mat.id}
                                        className={`${mat.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                                    >
                                        <td className="p-3 border-b border-gray-200">{mat.materialName}</td>
                                        <td className="p-3 border-b border-gray-200">{mat.category}</td>
                                        <td className="p-3 border-b border-gray-200">
                                            {editingId === mat.id ? (
                                                <input
                                                    type="number"
                                                    value={mat.percentage}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    className="border border-gray-300 p-1 rounded w-20 text-right"
                                                    onChange={(e) => handlePercentageChange(mat.id, e.target.value)}
                                                />
                                            ) : (
                                                <div className="text-right">{mat.percentage.toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="p-3 border-b border-gray-200 text-right">{mat.weight.toFixed(2)}</td>
                                        <td className="p-3 border-b border-gray-200">
                                            <div className="flex justify-center gap-2">
                                                {editingId === mat.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveEdit(mat.id)}
                                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                                                            title="Save"
                                                        >
                                                            <FaCheck />
                                                        </button>
                                                        <button
                                                            onClick={stopEditing}
                                                            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
                                                            title="Cancel"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(mat.id)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteMaterial(mat.id)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
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
                        {rawMaterials.length > 0 && (
                            <tfoot className="bg-gray-100 font-semibold">
                                <tr>
                                    <td className="p-3" colSpan={2}>Total</td>
                                    <td className="p-3 text-right">
                                        {rawMaterials.reduce((sum, mat) => sum + mat.percentage, 0).toFixed(2)}%
                                    </td>
                                    <td className="p-3 text-right">
                                        {rawMaterials.reduce((sum, mat) => sum + mat.weight, 0).toFixed(2)} kg
                                    </td>
                                    <td className="p-3"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Add Material Form */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-md font-medium mb-3 text-gray-700">Add New Material</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Material</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search materials..."
                                    className="border border-gray-300 p-2 rounded w-full pl-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="absolute left-2 top-3 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Material *</label>
                            <select
                                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newMaterialId}
                                onChange={(e) => setNewMaterialId(e.target.value)}
                            >
                                <option value="">Select material</option>
                                {filteredMaterials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.category})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%) *</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                placeholder="0-100"
                                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={newPercentage}
                                onChange={(e) => setNewPercentage(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAddMaterial}
                               className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                            >
                                <FaPlus /> Add Material
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                    onClick={() => {
                        setSelectedBatchId("");
                        setBatchName("");
                        setQuantity("");
                        setRawMaterials([]);
                        setNewMaterialId("");
                        setNewPercentage("");
                        setEditingId(null);
                    }}
                    className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                    <FaTimes /> Reset Form
                </button>
                <button
                    onClick={handleSaveBatch}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                    <FaCheck /> Save Batch Recreation
                </button>
            </div>
        </div>
        </>
       
    );
}