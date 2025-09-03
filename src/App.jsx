import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Component/ProtectedRoute";

import Dashboard from "./Component/Dashboard";
import StandardBatch from "./Component/StandardBatch";
import BatchRecreation from "./Component/BatchRecreation";
import StandardBatchReport from "./Component/StandardBatchReport";
import ReCreatedBatchReport from "./Component/ReCreatedBatchReport";
import CreateRawMaterial from "./Component/AddRawmaterial";
import RawMaterialList from "./Component/RawMaterialList";
import Masters from "./Component/Masters";
import UpdateRawMaterial from "./Component/UpdateRawmaterial";
import Login from "./Component/Login";
import StandardbatchUpdate from './Component/StandardbatchUpdate';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/standard-batch"
            element={
              <ProtectedRoute>
                <StandardBatch />
              </ProtectedRoute>
            }
          />
           <Route
            path="/standard-batch-update/:id"
            element={
              <ProtectedRoute>
                <StandardbatchUpdate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch-recreation"
            element={
              <ProtectedRoute>
                <BatchRecreation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch-recreation/edit/:id"
            element={
              <ProtectedRoute>
                <BatchRecreation editMode={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/standard-batch-report"
            element={
              <ProtectedRoute>
                <StandardBatchReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/re-created-batch-report"
            element={
              <ProtectedRoute>
                <ReCreatedBatchReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-raw-material"
            element={
              <ProtectedRoute>
                <CreateRawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/raw-material-list"
            element={
              <ProtectedRoute>
                <RawMaterialList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters"
            element={
              <ProtectedRoute>
                <Masters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-raw-material/:id"
            element={
              <ProtectedRoute>
                <UpdateRawMaterial />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
