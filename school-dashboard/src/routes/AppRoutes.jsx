import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Lectures from "../pages/Lectures";
import Reports from "../pages/Reports";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="lectures" element={<Lectures />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
