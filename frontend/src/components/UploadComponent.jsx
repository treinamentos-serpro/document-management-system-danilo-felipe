import { useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setError('Informe o usuário responsável e selecione um arquivo.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await uploadDocument({ file, owner: owner.trim() });
      setFile(null);
      event.currentTarget.reset();
      await onUploadComplete();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-labelledby="upload-title">
      <h2 id="upload-title">Enviar documento</h2>
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="owner">Usuário responsável</label><br />
          <input
            id="owner"
            name="owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            disabled={isUploading}
            required
          />
        </p>
        <p>
          <label htmlFor="document-file">Arquivo</label><br />
          <input
            id="document-file"
            name="file"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            disabled={isUploading}
            required
          />
        </p>
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}