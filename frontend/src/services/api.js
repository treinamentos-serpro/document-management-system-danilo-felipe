const API_PREFIX = '/api';

async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.error?.message || 'Não foi possível concluir a solicitação.';
  } catch {
    return 'Não foi possível concluir a solicitação.';
  }
}

async function request(url, options) {
  const response = await fetch(`${API_PREFIX}${url}`, options);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: formData,
  });

  return response.json();
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

function getDownloadName(response, fallbackName) {
  const contentDisposition = response.headers.get('content-disposition');
  const filename = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return filename || fallbackName;
}

export async function downloadDocument(document) {
  const response = await request(`/documents/${document.id}/download`);

  return {
    blob: await response.blob(),
    filename: getDownloadName(response, document.originalName),
  };
}