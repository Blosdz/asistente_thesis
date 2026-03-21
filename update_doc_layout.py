import re

with open('src/pages/student/DocumentView.jsx', 'r') as f:
    content = f.read()

new_return_block = """  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header: Dropdown & Create Tesis Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1 max-w-md">
          <label className="text-sm font-bold text-gray-500">
            Tesis Seleccionada
          </label>
          <div className="relative">
            <select
              value={selectedThesisId}
              onChange={(e) => setSelectedThesisId(e.target.value)}
              className="w-full appearance-none bg-white/60 backdrop-blur-xl border border-white/80 text-gray-900 text-lg font-bold rounded-2xl px-4 py-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-ios-blue transition-all cursor-pointer"
            >
              {thesesList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titulo || 'Sin título'}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronRight size={20} className="rotate-90" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 p-3 sm:px-5 sm:py-3 bg-white/60 backdrop-blur-xl border border-white/80 text-ios-blue rounded-2xl font-bold shadow-sm hover:scale-105 transition-transform active:scale-95"
            title="Crear Nueva Tesis"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Crear Tesis</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload Area (Left) & History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 glass-card p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-ios-blue/30 bg-ios-blue/5 hover:bg-ios-blue/10 transition-colors duration-300 rounded-[32px]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-ios-blue mb-6 shadow-sm">
            <FileUp size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sube tu Tesis</h3>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">
            Selecciona tu documento en formato PDF para registrar una nueva versión.
          </p>
          <label
            className={`
            bg-ios-blue text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-ios-blue/20
            flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 cursor-pointer text-lg
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          >
            <Upload size={24} />
            {uploading ? 'Subiendo...' : 'Subir Documento'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </section>

        {/* Sidebar: History */}
        <aside className="space-y-6">
          <div className="glass-card p-6 h-full max-h-[400px] overflow-y-auto">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 sticky top-0 bg-white/80 backdrop-blur-md pb-2 z-10">
              <History size={20} className="text-ios-blue" />
              Historial de Documentos
            </h3>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    setCurrentVersion(doc);
                    if (doc.url_archivo_drive) {
                      setPreviewUrl(
                        doc.url_archivo_drive.replace('/view', '/preview'),
                      );
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                  className={`
                    p-4 rounded-2xl cursor-pointer transition-all border
                    ${
                      currentVersion?.id === doc.id
                        ? 'bg-ios-blue/5 border-ios-blue/20 shadow-sm'
                        : 'bg-white/50 border-transparent hover:bg-white hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText
                        size={16}
                        className={
                          doc.url_archivo_drive
                            ? 'text-ios-blue'
                            : 'text-gray-400'
                        }
                      />
                      <span className="text-sm font-bold text-gray-700 truncate max-w-[120px]">
                        {doc.nombre_archivo}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                      text-[10px] px-2 py-0.5 rounded-full font-bold
                      ${
                        doc.estado === 'Aprobado'
                          ? 'bg-green-100 text-green-700'
                          : doc.estado === 'Observado'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                      }
                    `}
                    >
                      {doc.estado || 'Pendiente'}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      v{doc.version || 1}
                    </span>
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">
                  No hay documentos en esta tesis.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Section: Iframe / Preview */}
      <div className="mt-8">
        <section className="glass-card p-8 min-h-[600px] flex flex-col w-full">
          <h3 className="text-lg font-bold mb-6">Vista del Documento</h3>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full flex-1 min-h-[500px] rounded-[24px] border border-gray-200 shadow-inner bg-white"
              title="Document Preview"
            />
          ) : (
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center text-center p-12 bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <Info size={32} />
              </div>
              <h4 className="text-lg font-bold text-gray-700 mb-2">
                Vista previa no disponible
              </h4>
              <p className="text-sm text-gray-500 max-w-sm">
                Selecciona un documento del historial que contenga enlace a Drive para verlo aquí.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal Creating over active layout */}
      {showCreateModal && thesesList.length > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in" style={{ margin: 0 }}>
          <div className="glass-card p-8 max-w-md w-full relative z-[10000]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors z-10"
              title="Cerrar modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 pr-8">
              Crear Nueva Tesis
            </h3>
            <form onSubmit={handleCreateThesis} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Título de la Tesis
                </label>
                <input
                  type="text"
                  value={newThesisTitle}
                  onChange={(e) => setNewThesisTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all"
                  placeholder="Ej: Análisis del impacto..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={newThesisDesc}
                  onChange={(e) => setNewThesisDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ios-blue outline-none transition-all resize-none"
                  placeholder="Breve descripción de la investigación"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-ios-blue text-white rounded-xl font-bold shadow-lg shadow-ios-blue/20 hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear Tesis'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentView;
"""

old_return_split = "  return (\n    <div className=\"space-y-8 animate-in fade-in"

first_part = content.split(old_return_split)[0]

new_content = first_part + new_return_block

with open('src/pages/student/DocumentView.jsx', 'w') as f:
    f.write(new_content)

