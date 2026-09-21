import { apiRequest, apiBlobRequest } from './client';
const base = (id: string) => `/tesis/${encodeURIComponent(id)}/bibliografia`;
export const bibliographyApi = {
  workspace: (id: string, documentId?: string) => apiRequest<any>(`${base(id)}/workspace${documentId ? `?document_id=${encodeURIComponent(documentId)}` : ''}`),
  save: (id: string, refId: string | undefined, body: unknown) => apiRequest<any>(`${base(id)}/referencias${refId ? `/${refId}` : ''}`, { method: refId ? 'PATCH' : 'POST', body }),
  remove: (id: string, refId: string) => apiRequest(`${base(id)}/referencias/${refId}`, { method: 'DELETE' }),
  preview: (id: string, body: unknown) => apiRequest<any>(`${base(id)}/preview`, { method: 'POST', body }),
  doi: (id: string, doi: string) => apiRequest<any>(`${base(id)}/resolver-doi`, { method: 'POST', body: { doi } }),
  sync: (id: string, doc: string, body: unknown) => apiRequest<any>(`${base(id)}/documentos/${doc}/sincronizar`, { method: 'POST', body }),
  extract: (id: string, doc: string, body: unknown) => apiRequest<any>(`${base(id)}/documentos/${doc}/extraer`, { method: 'POST', body }),
  style: (id: string, body: unknown) => apiRequest<any>(`${base(id)}/estilo`, { method: 'PUT', body }),
  import: (id: string, file: File) => { const body = new FormData(); body.append('file', file); return apiRequest<any>(`${base(id)}/importaciones`, { method: 'POST', body }); },
  export: (id: string) => apiRequest<any>(`${base(id)}/exportaciones`, { method: 'POST' }),
  operation: (id: string, operation: string) => apiRequest<any>(`${base(id)}/operaciones/${operation}`),
};
export async function downloadBibliographyFile(id: string, path: string | null, filename: string, documentId?: string) {
  const blob = await apiBlobRequest(documentId ? `/ai/tesis/documentos/${documentId}/download` : `${base(id)}/${path}`);
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
