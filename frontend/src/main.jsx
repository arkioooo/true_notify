import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Leaflet's stylesheet must load before ours (the original loaded it first in <head>),
// because styles/geo.css overrides several leaflet-* rules.
import 'leaflet/dist/leaflet.css';
import './styles/index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
