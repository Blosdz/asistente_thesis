import { apiBlobRequest, apiRequest } from './client';

export const docGeneratorEndpoints = {
  thesis(tesisId: string) {
    return `/ai/tesis/${tesisId}`;
  },

  references(tesisId: string) {
    return `/ai/tesis/${tesisId}/referencias`;
  },

  reference(referenceId: string) {
    return `/ai/tesis/referencias/${referenceId}`;
  },

  index(tesisId: string) {
    return `/ai/tesis/${tesisId}/indice`;
  },

  indexSection(tesisId: string, sectionId: string) {
    return `/ai/tesis/${tesisId}/indice/${sectionId}`;
  },

  indexSectionText(tesisId: string, sectionId: string) {
    return `/ai/tesis/${tesisId}/indice/${sectionId}/texto`;
  },

  generateDocx(tesisId: string) {
    return `/tesis/${tesisId}/documentos/docx`;
  },

  aiGenerateDocx(tesisId: string) {
    return `/ai/tesis/${tesisId}/documentos/docx`;
  },

  rawData(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/raw-data`;
  },

  rawDocument(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/raw-document`;
  },

  processDocument(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/process`;
  },

  extractRawData(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/raw-data/extract`;
  },

  sections(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/sections`;
  },

  section(documentId: string, sectionId: string) {
    return `/ai/tesis/documentos/${documentId}/sections/${sectionId}`;
  },

  documentReferences(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/references`;
  },

  documentReference(documentId: string, referenceId: string) {
    return `/ai/tesis/documentos/${documentId}/references/${referenceId}`;
  },

  preview(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/preview`;
  },

  extractOutline(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/outline/extract`;
  },

  extractSectionReferences(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/references/extract-section`;
  },

  citations(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/citations`;
  },

  headings(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/headings`;
  },

  subtitles(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/subtitles`;
  },

  generatedDocument(filename: string) {
    return `/ai/tesis/documentos/${encodeURIComponent(filename)}`;
  },

  editableDocumentDownload(documentId: string) {
    return `/ai/tesis/documentos/${documentId}/download`;
  },
};

export function getThesis(tesisId: string) {
  return apiRequest(docGeneratorEndpoints.thesis(tesisId));
}

export function listReferences(tesisId: string) {
  return apiRequest(docGeneratorEndpoints.references(tesisId));
}

export function createReference(tesisId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.references(tesisId), {
    method: 'POST',
    body: payload,
  });
}

export function updateReference(referenceId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.reference(referenceId), {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteReference(referenceId: string) {
  return apiRequest(docGeneratorEndpoints.reference(referenceId), {
    method: 'DELETE',
  });
}

export function listIndex(tesisId: string) {
  return apiRequest(docGeneratorEndpoints.index(tesisId));
}

export function createIndexSection(tesisId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.index(tesisId), {
    method: 'POST',
    body: payload,
  });
}

export function replaceIndex(tesisId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.index(tesisId), {
    method: 'PUT',
    body: payload,
  });
}

export function updateIndexSection(
  tesisId: string,
  sectionId: string,
  payload: unknown,
) {
  return apiRequest(docGeneratorEndpoints.indexSection(tesisId, sectionId), {
    method: 'PATCH',
    body: payload,
  });
}

export function appendIndexSectionText(
  tesisId: string,
  sectionId: string,
  payload: unknown,
) {
  return apiRequest(docGeneratorEndpoints.indexSectionText(tesisId, sectionId), {
    method: 'POST',
    body: payload,
  });
}

export function deleteIndexSection(tesisId: string, sectionId: string) {
  return apiRequest(docGeneratorEndpoints.indexSection(tesisId, sectionId), {
    method: 'DELETE',
  });
}

export function generateDocx(tesisId: string) {
  return apiRequest(docGeneratorEndpoints.generateDocx(tesisId), {
    method: 'POST',
  });
}

export function generateAiDocx(tesisId: string) {
  return apiRequest(docGeneratorEndpoints.aiGenerateDocx(tesisId), {
    method: 'POST',
  });
}

export function getRawData(documentId: string) {
  return apiRequest(docGeneratorEndpoints.rawData(documentId));
}

export function getRawDocument(documentId: string) {
  return apiRequest(docGeneratorEndpoints.rawDocument(documentId));
}

export function updateRawData(documentId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.rawData(documentId), {
    method: 'PATCH',
    body: payload,
  });
}

export function extractRawData(documentId: string) {
  return apiRequest(docGeneratorEndpoints.extractRawData(documentId), {
    method: 'POST',
  });
}

export function processDocument(documentId: string) {
  return apiRequest(docGeneratorEndpoints.processDocument(documentId), {
    method: 'POST',
  });
}

export function listSections(documentId: string) {
  return apiRequest(docGeneratorEndpoints.sections(documentId));
}

export function updateSection(
  documentId: string,
  sectionId: string,
  payload: unknown,
) {
  return apiRequest(docGeneratorEndpoints.section(documentId, sectionId), {
    method: 'PATCH',
    body: payload,
  });
}

export function listDocumentReferences(documentId: string) {
  return apiRequest(docGeneratorEndpoints.documentReferences(documentId));
}

export function updateDocumentReference(
  documentId: string,
  referenceId: string,
  payload: unknown,
) {
  return apiRequest(docGeneratorEndpoints.documentReference(documentId, referenceId), {
    method: 'PATCH',
    body: payload,
  });
}

export function getDocumentPreview(documentId: string) {
  return apiRequest(docGeneratorEndpoints.preview(documentId));
}

export function extractOutline(documentId: string, replace = false) {
  const base = docGeneratorEndpoints.extractOutline(documentId);
  const url = replace ? `${base}?replace=true` : base;
  return apiRequest(url, { method: 'POST' });
}

export function extractSectionReferences(documentId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.extractSectionReferences(documentId), {
    method: 'POST',
    body: payload,
  });
}

export function insertCitation(documentId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.citations(documentId), {
    method: 'POST',
    body: payload,
  });
}

export function insertHeading(documentId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.headings(documentId), {
    method: 'POST',
    body: payload,
  });
}

export function insertSubtitle(documentId: string, payload: unknown) {
  return apiRequest(docGeneratorEndpoints.subtitles(documentId), {
    method: 'POST',
    body: payload,
  });
}

export function downloadGeneratedDocument(filename: string) {
  return apiBlobRequest(docGeneratorEndpoints.generatedDocument(filename));
}

export function downloadEditableDocument(documentId: string) {
  return apiBlobRequest(docGeneratorEndpoints.editableDocumentDownload(documentId));
}

export const docGeneratorApi = {
  getThesis,
  listReferences,
  createReference,
  updateReference,
  deleteReference,
  listIndex,
  createIndexSection,
  replaceIndex,
  updateIndexSection,
  appendIndexSectionText,
  deleteIndexSection,
  generateDocx,
  generateAiDocx,
  getRawData,
  getRawDocument,
  updateRawData,
  extractRawData,
  processDocument,
  listSections,
  updateSection,
  listDocumentReferences,
  updateDocumentReference,
  getDocumentPreview,
  extractOutline,
  extractSectionReferences,
  insertCitation,
  insertHeading,
  insertSubtitle,
  downloadGeneratedDocument,
  downloadEditableDocument,
};
