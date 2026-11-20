import { createRoot } from 'react-dom/client';
import App from './App.js';
import './index.css';
import { SYSTEM_BRAND } from './browser-capability.js';
document.title = `${SYSTEM_BRAND} — Browser-Native AI Portfolio`;
import './motion.js';

createRoot(document.getElementById('root')!).render(<App />);
