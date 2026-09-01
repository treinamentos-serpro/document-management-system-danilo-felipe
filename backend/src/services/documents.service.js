const { randomUUID } = require('crypto');
const documentsRepository = require('../repositories/documents.repository');

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

async function createDocument({ file, owner }) {
  const document = {
    id: `doc_${randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner
  };

  try {
    documentsRepository.save(document);
    return toPublicDocument(document);
  } catch (error) {
    try {
      await documentsRepository.removeStoredFile(document.storedName);
    } catch {
      // A falha de limpeza não altera o erro de persistência original.
    }

    throw createError('UPLOAD_FAILED', 'Não foi possível salvar o documento.');
  }
}

function listDocuments() {
  try {
    return documentsRepository.findAll().map(toPublicDocument);
  } catch {
    throw createError('DOCUMENT_LIST_FAILED', 'Não foi possível listar os documentos.');
  }
}

async function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);

  if (!document) {
    throw createError('DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
  }

  const filePath = await documentsRepository.findFilePath(document);

  if (!filePath) {
    throw createError('DOCUMENT_FILE_NOT_FOUND', 'Arquivo do documento não encontrado.');
  }

  return { document, filePath };
}

async function discardUploadedFile(file) {
  if (file?.filename) {
    await documentsRepository.removeStoredFile(file.filename);
  }
}

module.exports = {
  createDocument,
  discardUploadedFile,
  getDocumentForDownload,
  listDocuments
};