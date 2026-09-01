const documentsRepository = require('../repositories/documents.repository');
const {
  createDocumentFileNotFoundError,
  createDocumentListFailedError,
  createDocumentNotFoundError,
  createUploadFailedError
} = require('./document-errors');
const { createStoredDocument } = require('./document-factory');
const { toPublicDocument } = require('./document-mapper');

async function createDocument({ file, owner }) {
  const document = createStoredDocument({ file, owner });

  await saveDocument(document);

  return toPublicDocument(document);
}

function listDocuments() {
  try {
    return documentsRepository.findAll().map(toPublicDocument);
  } catch {
    throw createDocumentListFailedError();
  }
}

async function getDocumentForDownload(id) {
  const document = findDocumentById(id);
  const filePath = await findDocumentFilePath(document);

  return { document, filePath };
}

async function discardUploadedFile(file) {
  if (file?.filename) {
    await documentsRepository.removeStoredFile(file.filename);
  }
}

async function saveDocument(document) {
  try {
    documentsRepository.save(document);
  } catch {
    await discardStoredDocument(document.storedName);
    throw createUploadFailedError();
  }
}

function findDocumentById(id) {
  const document = documentsRepository.findById(id);

  if (!document) {
    throw createDocumentNotFoundError();
  }

  return document;
}

async function findDocumentFilePath(document) {
  const filePath = await documentsRepository.findFilePath(document);

  if (!filePath) {
    throw createDocumentFileNotFoundError();
  }

  return filePath;
}

async function discardStoredDocument(storedName) {
  try {
    await documentsRepository.removeStoredFile(storedName);
  } catch {
    // A falha de limpeza não altera o erro de persistência original.
  }
}

module.exports = {
  createDocument,
  discardUploadedFile,
  getDocumentForDownload,
  listDocuments
};