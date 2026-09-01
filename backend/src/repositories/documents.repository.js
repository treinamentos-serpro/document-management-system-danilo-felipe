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
  const filePath = resolveStoragePath(document.storedName);

  if (!filePath) {
    return null;
  }

  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    return null;
  }
}

async function removeStoredFile(storedName) {
  const filePath = resolveStoragePath(storedName);

  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  function resolveStoragePath(storedName) {
    if (typeof storedName !== 'string' || !storedName.trim()) {
      return null;
    }

    const normalizedStoredName = path.basename(storedName);

    if (normalizedStoredName !== storedName) {
      return null;
    }

    const filePath = path.resolve(storageDirectory, normalizedStoredName);
    const expectedPrefix = `${storageDirectory}${path.sep}`;

    if (!filePath.startsWith(expectedPrefix)) {
      return null;
    }

    return filePath;
  }
}

module.exports = {
  findAll,
  findById,
  findFilePath,
  removeStoredFile,
  save
};