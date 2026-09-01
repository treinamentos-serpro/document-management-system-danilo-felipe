const fs = require('fs/promises');
const path = require('path');
const { storageDirectory } = require('../config/storage');
const documents = [];

function save(document) {
  documents.push(document);
  return document;
}

function findById(id) {
  return documents.find((document) => document.id === id);
}

function findAll() {
  return [...documents].sort(
    (firstDocument, secondDocument) =>
      new Date(secondDocument.uploadedAt) - new Date(firstDocument.uploadedAt)
  );
}

async function findFilePath(document) {
  const filePath = path.join(storageDirectory, document.storedName);

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

async function removeStoredFile(storedName) {
  try {
    await fs.unlink(path.join(storageDirectory, storedName));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  findAll,
  findById,
  findFilePath,
  removeStoredFile,
  save
};