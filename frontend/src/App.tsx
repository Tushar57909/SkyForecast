import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import ForecastExplorer from './pages/ForecastExplorer';
import LiveIntelligence from './pages/LiveIntelligence';
import ModelComparison from './pages/ModelComparison';
import SpatialAnalysis from './pages/SpatialAnalysis';
import Evaluation from './pages/Evaluation';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Overview />} />
            <Route path="overview" element={<Overview />} />
            <Route path="forecast" element={<ForecastExplorer />} />
            <Route path="intelligence" element={<LiveIntelligence />} />
            <Route path="comparison" element={<ModelComparison />} />
            <Route path="spatial" element={<SpatialAnalysis />} />
            <Route path="accuracy" element={<Evaluation />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
