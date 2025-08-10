import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Category from './Component/Category';
import StandardBatch from './Component/StandardBatch';
import BatchRecreation from './Component/BatchRecreation';
import StandardBatchReport from './Component/StandardBatchReport';
import ReCreatedBatchReport from './Component/ReCreatedBatchReport';
import CreateRawMaterial from './Component/AddRawmaterial';
import RawMaterialList from './Component/RawMaterialList';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Category />} />
        <Route path="/standard-batch" element={<StandardBatch />} />
        <Route path="/batch-recreation" element={<BatchRecreation />} />
        <Route path="/standard-batch-report" element={<StandardBatchReport />} />
        <Route path="/re-created-batch-report" element={<ReCreatedBatchReport />} />
        <Route path="/create-raw-material" element={<CreateRawMaterial />} />
        <Route path="/raw-material-list" element={<RawMaterialList />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App
