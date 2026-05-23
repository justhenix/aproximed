import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AppPage } from './pages/AppPage';
import { AboutPage } from './pages/AboutPage';
import { DocsPage } from './pages/DocsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="app" element={<AppPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="docs" element={<DocsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;