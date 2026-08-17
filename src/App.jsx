import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import useAuthStore from "./store/authStore";
import Repositories from "./pages/Repositories";
import Repository from "./pages/Repository";

function App() {
  const getCurrentUser = useAuthStore(
    (state) => state.getCurrentUser
  );

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repository/:id" element={<Repository />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;