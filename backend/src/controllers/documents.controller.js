const documentsService = require('../services/documents.service');

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

async function discardUploadedFileSilently(file) {
  try {
    await documentsService.discardUploadedFile(file);
  } catch {
    return;
  }
}

async function uploadDocument(req, res) {
  const owner = req.get('X-User-Id')?.trim();

  if (!owner) {
    await discardUploadedFileSilently(req.file);
    return sendError(res, 400, 'MISSING_USER_ID', 'O cabeçalho X-User-Id é obrigatório.');
  }

  if (!req.file) {
    return sendError(res, 400, 'MISSING_FILE', 'O campo file é obrigatório.');
  }

  try {
    const document = await documentsService.createDocument({ file: req.file, owner });
    return res.status(201).json(document);
  } catch (error) {
    return sendError(res, 500, error.code || 'UPLOAD_FAILED', 'Não foi possível salvar o documento.');
  }
}

function listDocuments(req, res) {
  try {
    return res.json(documentsService.listDocuments());
  } catch (error) {
    return sendError(
      res,
      500,
      error.code || 'DOCUMENT_LIST_FAILED',
      'Não foi possível listar os documentos.'
    );
  }
}

async function downloadDocument(req, res, next) {
  const { id } = req.params;

  if (!id?.trim()) {
    return sendError(res, 400, 'INVALID_DOCUMENT_ID', 'Identificador do documento inválido.');
  }

  try {
    const { document, filePath } = await documentsService.getDocumentForDownload(id);

    return res.download(filePath, document.originalName, {
      headers: { 'Content-Type': document.mimeType }
    }, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    const status = error.code === 'DOCUMENT_NOT_FOUND' || error.code === 'DOCUMENT_FILE_NOT_FOUND'
      ? 404
      : 500;
    return sendError(res, status, error.code || 'DOWNLOAD_FAILED', error.message || 'Não foi possível baixar o documento.');
  }
}

module.exports = {
  downloadDocument,
  listDocuments,
  uploadDocument
};