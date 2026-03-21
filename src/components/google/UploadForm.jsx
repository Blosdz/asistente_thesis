import React, { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Selecciona un archivo');

    const form = new FormData();
    form.append('file', file);

    try {
      setLoading(true);
      const res = await fetch('/google/upload', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (json.success) {
        alert('Archivo subido. ID: ' + json.file.id);
      } else {
        alert('Error: ' + json.error);
      }
    } catch (err) {
      alert('Error en la subida: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit" disabled={loading} className="py-2 px-4 bg-green-600 text-white rounded">
        {loading ? 'Subiendo...' : 'Subir a Google Drive'}
      </button>
    </form>
  );
}
