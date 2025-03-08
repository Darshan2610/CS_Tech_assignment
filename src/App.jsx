import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import Lists from "./pages/Lists";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/agents" replace />} />
          <Route path="agents" element={<Agents />} />
          <Route path="lists" element={<Lists />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
