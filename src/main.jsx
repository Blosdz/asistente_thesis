/* eslint-disable react-refresh/only-export-components */
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

const setPastelBackgroundVars = () => {
  const docStyle = document.documentElement.style;
  const pastel = () => `hsla(${Math.floor(Math.random() * 360)}, 100%, 82%, 0.45)`;

  docStyle.setProperty('--pastel-1', pastel());
  docStyle.setProperty('--pastel-2', pastel());
  docStyle.setProperty('--pastel-3', pastel());
  docStyle.setProperty('--pastel-4', pastel());
  docStyle.setProperty('--pastel-5', pastel());
};

const Root = () => {
  useEffect(() => {
    setPastelBackgroundVars();
  }, []);

  return (
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Root />);
