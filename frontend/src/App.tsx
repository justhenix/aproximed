import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AppPage } from './pages/AppPage';
import { AboutPage } from './pages/AboutPage';
import { DocsPage } from './pages/DocsPage';
import { I18nProvider } from './i18n/I18nProvider';

function App() {
  return (
    <I18nProvider>
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
    </I18nProvider>
  );
}

export default App;