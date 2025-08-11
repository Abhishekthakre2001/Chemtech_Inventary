import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaSearch } from "react-icons/fa";
import Navbar from "./Navbar";

const batchesMock = [
    { id: 1, name: "Batch 1", description: "Standard Production Batch" },
    { id: 2, name: "Batch 2", description: "Special Formula Batch" },
    { id: 3, name: "Batch 3", description: "Experimental Mix" },
];

const materialsMock = [
    { id: 1, name: "Material A", category: "Base" },
    { id: 2, name: "Material B", category: "Additive" },
    { id: 3, name: "Material C", category: "Preservative" },
    { id: 4, name: "Material D", category: "Colorant" },
    { id: 5, name: "Material E", category: "Fragrance" },
];

export default function BatchRecreation() {
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [batchName, setBatchName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [rawMaterials, setRawMaterials] = useState([]);
    const [newMaterialId, setNewMaterialId] = useState("");
    const [newPercentage, setNewPercentage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadBatchData = () => {
        if (!selectedBatchId) {
            alert("Please select a batch first");
            return;
        }

        // Simulate API call
        const batch = batchesMock.find(b => b.id === parseInt(selectedBatchId));
        if (!batch) return;

        setBatchName(batch.name);

        // Simulate different batch data
        if (selectedBatchId === "1") {
            setQuantity("100");
            setRawMaterials([
                { id: 1, materialId: 1, materialName: "Material A", percentage: 50, weight: 50 },
                { id: 2, materialId: 2, materialName: "Material B", percentage: 50, weight: 50 },
            ]);
        } else if (selectedBatchId === "2") {
            setQuantity("200");
            setRawMaterials([
                { id: 3, materialId: 3, materialName: "Material C", percentage: 100, weight: 200 },
            ]);
        } else {
            setQuantity("150");
            setRawMaterials([
                { id: 4, materialId: 4, materialName: "Material D", percentage: 70, weight: 105 },
                { id: 5, materialId: 5, materialName: "Material E", percentage: 30, weight: 45 },
            ]);
        }
    };

    const handleAddMaterial = () => {
        if (!newMaterialId || !newPercentage) {
            alert("Please select material and enter percentage");
            return;
        }

        if (parseFloat(newPercentage) <= 0 || parseFloat(newPercentage) > 100) {
            alert("Percentage must be between 0 and 100");
            return;
        }

        const materialExists = rawMaterials.some(
            (mat) => mat.materialId === parseInt(newMaterialId)
        );
        if (materialExists) {
            alert("This material is already added");
            return;
        }

        const material = materialsMock.find(
            (m) => m.id === parseInt(newMaterialId)
        );

        const totalWeight = (parseFloat(quantity) * parseFloat(newPercentage)) / 100;

        const newMaterial = {
            id: Date.now(),
            materialId: parseInt(newMaterialId),
            materialName: material.name,
            percentage: parseFloat(newPercentage),
            weight: totalWeight,
            category: material.category,
        };

        setRawMaterials([...rawMaterials, newMaterial]);
        setNewMaterialId("");
        setNewPercentage("");
    };

    const handleDeleteMaterial = (id) => {
        setRawMaterials(rawMaterials.filter((mat) => mat.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const handlePercentageChange = (id, newPerc) => {
        setRawMaterials((materials) =>
            materials.map((mat) => {
                if (mat.id === id) {
                    const weight = (parseFloat(quantity) * parseFloat(newPerc)) / 100;
                    return { ...mat, percentage: parseFloat(newPerc), weight };
                }
                return mat;
            })
        );
    };

    const startEditing = (id) => {
        setEditingId(id);
    };

    const stopEditing = () => {
        setEditingId(null);
    };

    const handleSaveEdit = (id) => {
        // Validation could be added here
        stopEditing();
    };

    const handleSave = () => {
        if (!batchName || !quantity || rawMaterials.length === 0) {
            alert("Please fill all required fields and add at least one material");
            return;
        }

        const totalPercentage = rawMaterials.reduce((sum, mat) => sum + mat.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            alert(`Total percentage must equal 100% (currently ${totalPercentage.toFixed(2)}%)`);
            return;
        }

        const batchData = {
            batchId: selectedBatchId,
            batchName,
            quantity,
            rawMaterials,
            totalWeight: rawMaterials.reduce((sum, mat) => sum + mat.weight, 0),
            totalPercentage,
        };

        console.log("Batch Data to save:", batchData);
        alert("Batch saved successfully! Check console for details.");
    };

    const filteredMaterials = materialsMock.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
        <Navbar />
         <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow-xl xl:ml-[17rem] ">
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
                        >
                            <option value="">Select a batch...</option>
                            {batchesMock.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name} - {b.description}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            className="py-2 px-4 gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                            onClick={loadBatchData}
                        >
                            <FaSearch /> Load Batch
                        </button>
                    </div>
                </div>
            </div>

            {/* Batch Details */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name/ID *</label>
                    <input
                        type="text"
                        placeholder="Enter batch name"
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity (kg) *</label>
                    <input
                        type="number"
                        placeholder="Enter quantity"
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={quantity}
                        onChange={(e) => {
                            setQuantity(e.target.value);
                            // Update all weights when total quantity changes
                            setRawMaterials(materials =>
                                materials.map(mat => ({
                                    ...mat,
                                    weight: (parseFloat(e.target.value || 0) * mat.percentage / 100)
                                }))
                            )
                        }}
                    />
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
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                    <FaCheck /> Save Batch Recreation
                </button>
            </div>
        </div>
        </>
       
    );
}