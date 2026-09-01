const { randomUUID } = require('crypto');

function createStoredDocument({ file, owner }) {
  return {
    id: `doc_${randomUUID()}`,
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner
  };
}

module.exports = {
  createStoredDocument
};
