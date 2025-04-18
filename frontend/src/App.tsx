import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "@/contexts/ConfigContext";
import ConfigurePage from "@/pages/Configure";

const App = () => {
  return (
    <ConfigProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Navigate to="/configure" replace />} />
          <Route path="/configure" element={<ConfigurePage />} />
          <Route path="*" element={<div className="p-6 text-center">404 – Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
