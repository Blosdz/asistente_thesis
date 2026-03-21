import React from 'react';

export default function ConnectButton({ className = '' }) {
  const handleConnect = () => {
    // Redirect to backend which will redirect to Google
    window.location.href = '/google/connect';
  };

  return (
    <button onClick={handleConnect} className={`py-2 px-4 bg-blue-600 text-white rounded ${className}`}>
      Conectar con Google Drive
    </button>
  );
}
