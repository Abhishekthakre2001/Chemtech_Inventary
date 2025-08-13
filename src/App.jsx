import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Category from './Component/Category';
import StandardBatch from './Component/StandardBatch';
import BatchRecreation from './Component/BatchRecreation';
import StandardBatchReport from './Component/StandardBatchReport';
import ReCreatedBatchReport from './Component/ReCreatedBatchReport';
import CreateRawMaterial from './Component/AddRawmaterial';
import RawMaterialList from './Component/RawMaterialList';
import Masters from './Component/Masters';
import UpdateRawMaterial from './Component/UpdateRawMaterial';
import Dashboard from './Component/Dashboard';
import Login from './Component/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/standard-batch" element={<StandardBatch />} />
        <Route path="/batch-recreation" element={<BatchRecreation />} />
        <Route path="/batch-recreation/edit/:id" element={<BatchRecreation editMode={true} />} />
        <Route path="/standard-batch-report" element={<StandardBatchReport />} />
        <Route path="/re-created-batch-report" element={<ReCreatedBatchReport />} />
        <Route path="/create-raw-material" element={<CreateRawMaterial />} />
        <Route path="/raw-material-list" element={<RawMaterialList />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/update-raw-material/:id" element={<UpdateRawMaterial />} />
        <Route path="/" element={<Login />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  )
}

export default App
