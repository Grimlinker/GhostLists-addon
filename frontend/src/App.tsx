import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "@/contexts/ConfigContext";
import ConfigurePage from "@/pages/Configure";

const App = () => {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /configure */}
          <Route path="/" element={<Navigate to="/configure" replace />} />

          {/* Main config page */}
          <Route path="/configure" element={<ConfigurePage />} />

          {/* 404 fallback */}
          <Route path="*" element={<div className="p-6 text-center">404 – Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
