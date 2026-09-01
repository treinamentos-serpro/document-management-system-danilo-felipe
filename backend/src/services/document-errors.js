function createDocumentError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function createUploadFailedError() {
  return createDocumentError('UPLOAD_FAILED', 'Não foi possível salvar o documento.');
}

function createDocumentListFailedError() {
  return createDocumentError(
    'DOCUMENT_LIST_FAILED',
    'Não foi possível listar os documentos.'
  );
}

function createDocumentNotFoundError() {
  return createDocumentError('DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
}

function createDocumentFileNotFoundError() {
  return createDocumentError(
    'DOCUMENT_FILE_NOT_FOUND',
    'Arquivo do documento não encontrado.'
  );
}

module.exports = {
  createDocumentFileNotFoundError,
  createDocumentListFailedError,
  createDocumentNotFoundError,
  createUploadFailedError
};
