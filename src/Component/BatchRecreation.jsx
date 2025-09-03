import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaSearch, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";


const API_BASE_URL = import.meta.env.VITE_API_URL;

// Error handling utility
const handleApiError = (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || defaultMessage;
    // toast.error(message);
    toast.error(message, {
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
    throw new Error(message);
};

export default function BatchRecreation({ editMode = false }) {
    const { id } = useParams(); // Get the ID from the URL if in edit mode
    const navigate = useNavigate();
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
            // If in edit mode, load the existing batch recreation data
            if (editMode && id) {
                await fetchBatchRecreation(id);
            }
            setIsLoading(true);
            try {
                console.log('Fetching batches from:', `${API_BASE_URL}batch/get_batches.php`);
                // Fetch batches
                let batchesResponse;
                try {
                    console.log('Attempting to fetch batches without credentials...');
                    batchesResponse = await fetch(`${API_BASE_URL}batch/get_batches.php`, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Origin': window.location.origin
                        }
                    });

                    if (!batchesResponse.ok) {
                        const errorText = await batchesResponse.text();
                        console.error('Batches API Error Status:', batchesResponse.status);
                        console.error('Batches API Error Response:', errorText);
                        throw new Error(`Failed to fetch batches: ${batchesResponse.status} ${batchesResponse.statusText}`);
                    }

                    const batchesData = await batchesResponse.json();
                    console.log('Batches API Response:', batchesData);

                    // Handle both array and object responses
                    if (batchesData.success) {
                        const batchesArray = Array.isArray(batchesData.data) ? batchesData.data : [];
                        console.log('Setting batches:', batchesArray);
                        setBatches(batchesArray);
                    } else {
                        console.warn('Batches API returned success: false');
                        setBatches([]);
                    }
                } catch (batchError) {
                    console.error('Error in batches fetch:', batchError);
                    throw new Error(`Batches fetch failed: ${batchError.message}`);
                }

                // Fetch raw materials with credentials and proper headers
                console.log('Fetching raw materials from:', `${API_BASE_URL}raw_material/get_raw_materials_dropdown.php`);
                try {
                    console.log('Attempting to fetch raw materials...');
                    const materialsResponse = await fetch(`${API_BASE_URL}raw_material/get_raw_materials_dropdown.php`, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Origin': window.location.origin
                        }
                    });

                    // First check if the response is JSON
                    const responseText = await materialsResponse.text();
                    let materialsData;

                    try {
                        materialsData = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Failed to parse response as JSON. Response:', responseText.substring(0, 200));
                        throw new Error('Received non-JSON response from server. Please check the API endpoint.');
                    }

                    console.log('Raw Materials API Response:', materialsData);

                    if (!materialsResponse.ok) {
                        console.error('Raw Materials API Error Status:', materialsResponse.status);
                        console.error('Raw Materials API Error Response:', materialsData);
                        throw new Error(`Failed to fetch raw materials: ${materialsResponse.status} ${materialsResponse.statusText}`);
                    }
                    console.log("materialsData", materialsData)

                    if (materialsData && materialsData.success && Array.isArray(materialsData.data)) {
                        // Transform data to ensure consistent structure
                        const transformedMaterials = materialsData.data.map(item => ({
                            id: item.id || item.raw_material_id,
                            name: item.name || item.raw_material_name || `Material ${item.id}`,
                            // category: item.category || 'Uncategorized',
                            quantity: parseFloat(item.quantity) || 0,
                            quantity_unit: item.quantity_unit || 'kg'
                        }));
                        console.log('Setting materials:', transformedMaterials);
                        setMaterials(transformedMaterials);
                    } else {
                        console.warn('Raw Materials API returned unexpected format:', materialsData);
                        setMaterials([]);
                    }
                } catch (materialsError) {
                    console.error('Error in raw materials fetch:', materialsError);
                    // toast.error('Failed to load raw materials. Please check console for details.');
                    toast.error("Failed to load raw materials. Please check console for details.", {
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
                    setMaterials([]);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Failed to load initial data. Please refresh the page.', {
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
                setBatches([]);
                setMaterials([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch an existing batch recreation by id (edit mode)
    const fetchBatchRecreation = async (recreationId) => {
        setIsLoading(true);
        try {
            console.log('Fetching batch recreation by ID:', recreationId);
            const url = `${API_BASE_URL}batch_recreation/get_batch_recreation_by_id.php?id=${recreationId}`;
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                }
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse batch recreation response:', text.substring(0, 200));
                throw new Error('Received invalid JSON from batch recreation API');
            }

            if (!response.ok || !result.success || !result.data) {
                throw new Error(result?.message || 'Failed to load batch recreation');
            }

            const data = result.data;

            const formatDate = (dateString) => {
                if (!dateString) return '';
                if (String(dateString).match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateString;
                }
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
            };

            setSelectedBatchId(String(data.original_batch_id || ''));
            setBatchName(data.recreated_batch_name || '');
            setBatchDate(formatDate(data.recreated_batch_date));
            setBatchSize(data.recreated_batch_size || '');
            setBatchUnit(data.recreated_batch_unit || 'L');

            const processedMaterials = Array.isArray(data.materials) ? data.materials.map((m, index) => ({
                id: m.raw_material_id || (Date.now() + index),
                materialId: m.raw_material_id,
                materialName: m.name || `Material ${index + 1}`,
                percentage: parseFloat(m.percentage) || 0,
                weight: parseFloat(m.quantity_used || 0),
                unit: m.unit_used || 'kg',
                available: 0
            })) : [];

            setRawMaterials(processedMaterials);
        } catch (error) {
            handleApiError(error, 'Failed to load batch recreation');
            setRawMaterials([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadBatchData = async () => {
        if (!selectedBatchId) {
            // toast.error("Please select a batch first");
            toast.error("Please select a batch first", {
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
        setIsLoading(true);
        try {
            console.log('Fetching batch data for ID:', selectedBatchId);
            // Use the single-batch endpoint to fetch details for the selected batch
            const batchUrl = `${API_BASE_URL}batch/get_batch_byid.php?id=${selectedBatchId}`;
            const materialsUrl = `${API_BASE_URL}batch_recreation/get_batch_raw_materials.php?batch_id=${selectedBatchId}`;

            console.log('Batch URL:', batchUrl);
            console.log('Materials URL:', materialsUrl);

            const [batchResponse, materialsResponse] = await Promise.all([
                fetch(batchUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    }
                }),
                fetch(materialsUrl, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    }
                })
            ]);

            // Handle batch response
            const batchText = await batchResponse.text();
            let batchResult;
            try {
                batchResult = JSON.parse(batchText);
                console.log('Batch API Response:', batchResult);
            } catch (e) {
                console.error('Failed to parse batch response:', batchText.substring(0, 200));
                throw new Error('Received invalid JSON from batch API');
            }

            if (!batchResponse.ok || !batchResult.success) {
                console.error('Batch API Error:', {
                    status: batchResponse.status,
                    statusText: batchResponse.statusText,
                    response: batchResult
                });
                throw new Error(batchResult.message || 'Failed to load batch data');
            }

            // Handle both single object and array responses
            let batchData;
            if (batchResult.data) {
                batchData = Array.isArray(batchResult.data) ? batchResult.data[0] : batchResult.data;
            } else {
                // If data isn't nested in a data property, use the root object
                batchData = batchResult;
            }
            
            if (!batchData) throw new Error('No batch data found');
            console.log('Processed Batch Data:', batchData);

            // Process and format materials data
            let materialsData = [];
            if (materialsResponse.ok) {
                const materialsText = await materialsResponse.text();
                try {
                    const materialsResult = JSON.parse(materialsText);
                    if (materialsResult.success && Array.isArray(materialsResult.data)) {
                        materialsData = materialsResult.data;
                    }
                } catch (e) {
                    console.warn('Failed to parse materials response:', materialsText.substring(0, 200));
                    // Continue with empty materials if parsing fails
                }
            }

            // Format the date to YYYY-MM-DD to avoid invalid date issues
            const formatDate = (dateString) => {
                if (!dateString) return '';
                // Handle MySQL date format (YYYY-MM-DD)
                if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateString;
                }
                const date = new Date(dateString);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
            };

            // Set batch fields with fallbacks for different API response structures
            setBatchName(batchData.batchName || batchData.batch_name || batchData.name || '');
            setBatchDate(formatDate(batchData.batchDate || batchData.batch_date || batchData.date));
            setBatchSize(batchData.batchSize || batchData.batch_size || batchData.size || '');
            setBatchUnit(batchData.batchUnit || batchData.batch_unit || batchData.unit || 'L');

            // Process materials from batch_recreation endpoint, filteredMaterials, or batchData.materials
            let processedMaterials = [];
            
            // Check for filteredMaterials in the response
            const materialsSource = materialsData.filteredMaterials || materialsData;
            
            if (Array.isArray(materialsSource) && materialsSource.length > 0) {
                processedMaterials = materialsSource.map((item, index) => ({
                    id: item.id || item.raw_material_id || (Date.now() + index),
                    materialId: item.raw_material_id || item.id,
                    materialName: item.name || item.raw_material_name || `Material ${index + 1}`,
                    percentage: parseFloat(item.percentage) || 0,
                    weight: parseFloat((item.quantity_used || item.quantity || 0)),
                    unit: item.unit_used || item.unit || item.quantity_unit || 'kg',
                    available: parseFloat(item.available_quantity || item.quantity || 0)
                }));
            } else if (batchData.materials && Array.isArray(batchData.materials)) {
                // Fallback to batchData.materials if available
                processedMaterials = batchData.materials.map((item, index) => ({
                    id: item.id || (Date.now() + index),
                    materialId: item.raw_material_id || item.id,
                    materialName: item.name || item.raw_material_name || `Material ${index + 1}`,
                    percentage: parseFloat(item.percentage) || 0,
                    weight: parseFloat(item.quantity_used || item.quantity || 0),
                    unit: item.unit_used || item.unit || item.quantity_unit || 'kg',
                    available: parseFloat(item.available_quantity || item.quantity || 0)
                }));
            }
            
            console.log('Processed Materials:', processedMaterials);
            setRawMaterials(processedMaterials);
        } catch (error) {
            handleApiError(error, 'Failed to load batch data');
            setRawMaterials([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMaterial = () => {
        if (!newMaterialId) {
            // toast.error("Please select a material");
            toast.error("Please select a material", {
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

        if (!newPercentage) {
            // toast.error("Please enter a percentage");
            toast.error("Please enter a percentage", {
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

        const percentage = parseFloat(newPercentage);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            // toast.error("Percentage must be between 0.01 and 100");
            toast.error("Percentage must be between 0.01 and 100", {
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

        const materialExists = rawMaterials.some(
            (mat) => mat.materialId === parseInt(newMaterialId)
        );

        if (materialExists) {
            // toast.error("This material is already added");
            toast.error("This material is already added", {
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

        const selectedMaterial = materials.find(
            (m) => m.id === parseInt(newMaterialId)
        );

        if (!selectedMaterial) {
            // toast.error("Selected material not found");
            toast.error("Selected material not found", {
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

        const totalPercentage = rawMaterials.reduce(
            (sum, mat) => sum + mat.percentage,
            percentage
        );

        if (totalPercentage > 100) {
            // toast.error(`Total percentage cannot exceed 100% (current: ${totalPercentage.toFixed(2)}%)`);
            toast.error(`Total percentage cannot exceed 100% (current: ${totalPercentage.toFixed(2)}%)`, {
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
            // toast.error("Percentage must be between 0.01 and 100");
            toast.error("Percentage must be between 0.01 and 100", {
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
            return false;
        }
        return true;
    };

    const handleDeleteMaterial = (id) => {
        setRawMaterials(prev => prev.filter(mat => mat.id !== id));
        if (editingId === id) setEditingId(null);
        // toast.success('Material removed');
        toast.success("Material removed", {
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
    };

    const handlePercentageChange = (id, newPerc) => {
        setRawMaterials(prev =>
            prev.map(mat => {
                if (mat.id === id) {
                    const weight = (parseFloat(batchSize || 0) * parseFloat(newPerc)) / 100;
                    return { ...mat, percentage: parseFloat(newPerc), weight };
                }
                return mat;
            })
        );
    };

    const calculateTotalPercentage = (materials) => {
        return materials.reduce((sum, mat) => sum + parseFloat(mat.percentage || 0), 0);
    };

    const handleSaveEdit = (id) => {
        // Find the material being edited
        const materialToUpdate = rawMaterials.find(mat => mat.id === id);
        if (!materialToUpdate) return;

        // Validate percentage
        const percentage = parseFloat(materialToUpdate.percentage || 0);
        if (isNaN(percentage) || percentage <= 0) {
            // toast.error('Please enter a valid percentage');
            toast.error('Please enter a valid percentage', {
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

        // Calculate total percentage including this edit
        const totalPercentage = rawMaterials.reduce((sum, mat) => {
            if (mat.id === id) return sum + percentage;
            return sum + parseFloat(mat.percentage || 0);
        }, 0);

        if (totalPercentage > 100) {
            // toast.error('Total percentage cannot exceed 100%');
            toast.error('Total percentage cannot exceed 100%', {
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

        // Update the material's edit state
        setRawMaterials(prev =>
            prev.map(mat =>
                mat.id === id
                    ? { ...mat, isEditing: false }
                    : mat
            )
        );

        setEditingId(null);
        // toast.success('Material updated successfully');
        toast.success("Material updated successfully", {
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
            // toast.warning("Please fill in all required fields");
            toast.error("Please fill in all required fields", {
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

        if (editMode && !id) {
            // toast.error("Invalid batch recreation ID");
            toast.error("Invalid batch recreation ID", {
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

        if (rawMaterials.length === 0) {
            // toast.warning("Please add at least one material");
            toast.error("Please add at least one material", {
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

        const totalPercentage = calculateTotalPercentage(rawMaterials);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            // toast.warning("Total percentage must be exactly 100%");
            toast.error("Total percentage must be exactly 100%", {
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

        const batchData = {
            original_batch_id: parseInt(selectedBatchId),
            recreated_batch_name: batchName,
            recreated_batch_date: batchDate || new Date().toISOString().split('T')[0],
            recreated_batch_size: parseFloat(batchSize),
            recreated_batch_unit: batchUnit,
            materials: rawMaterials.map((mat, index) => ({
                id: mat.id || (index + 1), // Use existing ID if in edit mode
                raw_material_id: mat.materialId,
                quantity_used: mat.weight,
                unit_used: mat.unit,
                percentage: mat.percentage,
                notes: ''
            }))
        };

        // If in edit mode, add the ID to the request
        if (editMode) {
            batchData.id = parseInt(id);
        }

        setIsSaving(true);
        try {
            const endpoint = editMode ? 'update_batch_recreation' : 'add_batch_recreation';
            // Use POST for both create and update to avoid servers that block PUT
            const method = 'POST';

            const response = await fetch(`${API_BASE_URL}batch_recreation/${endpoint}.php`, {
                method,
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify(batchData)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save batch recreation');
            }

        
            toast.success("Batch recreation saved successfully!", {
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
            navigate('/re-created-batch-report');

            // Reset form
            setSelectedBatchId("");
            setBatchName("");
            setBatchSize("");
            setBatchUnit("L");
            setRawMaterials([]);
        } catch (error) {
            toast.error("Something went wrong while saving batch recreation", {
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

    console.log("filteredMaterials", filteredMaterials);

    // if (isLoading) {
    //     return (
    //         <div className="flex justify-center items-center min-h-screen">
    //             <div className="flex flex-col items-center">
    //                 <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
    //                 <p className="text-gray-600">Loading data, please wait...</p>
    //             </div>
    //         </div>
    //     );
    // }

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
                                    className="no-spinner border border-gray-300 p-2 rounded-l w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    onKeyDown={(e) => {
                                        // Block e, +, -, .
                                        if (["e", "E", "+", "-"].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onWheel={(e) => e.target.blur()}
                                    disabled={isLoading}
                                />
                                <select
                                    disabled
                                    className="cursor-not-allowed border border-gray-300 border-l-0 rounded-r px-2 bg-gray-100 text-gray-700"
                                    value={batchUnit}
                                    onChange={(e) => setBatchUnit(e.target.value)}

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
                                    {filteredMaterials.length > 0 ? (
                                        filteredMaterials.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} {m.quantity ? `(${m.quantity} ${m.quantity_unit})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No materials found</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%) *</label>
                                <input
                                    type="number"
                                    onKeyDown={(e) => {
                                        // Block e, +, -, .
                                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    onWheel={(e) => e.target.blur()}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    placeholder="0-100"
                                    className="no-spinner border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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