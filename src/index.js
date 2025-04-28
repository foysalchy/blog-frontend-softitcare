import React from 'react';
import ReactDOM from 'react-dom/client'; // Use the new 'react-dom/client' import for React 18+
import App from './App';
import './index.css';

// Create a root using ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));  // Use createRoot in React 18+
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
