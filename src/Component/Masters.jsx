// src/pages/Masters.jsx
import React, { useState } from 'react';
import Navbar from './Navbar';
import SuppliersManagement from './SuppliersManagement';
import CategoryManagement from './CategoryManagement';

const Masters = () => {
  const [activeTab, setActiveTab] = useState('suppliers');

  return (
    <>
     <Navbar />
      <div className="p-4 xl:ml-[17rem]">
      <h1 className="text-2xl font-bold mb-6">Masters</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === 'suppliers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('suppliers')}
        >
          Suppliers
        </button>
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === 'category'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('category')}
        >
          Category
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'suppliers' && <SuppliersComponent />}
        {activeTab === 'category' &&  <CategoryManagement />}
      </div>
    </div>
    </>
   
  );
};

// Suppliers Component
const SuppliersComponent = () => {
  return (
    <>
      <SuppliersManagement />
    </>
    
  );
};

export default Masters;