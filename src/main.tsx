import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { CatalogProvider } from './context/CatalogContext.tsx';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <CatalogProvider>
      <App />
    </CatalogProvider>
  </ErrorBoundary>
);
