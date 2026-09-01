import { useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!file || !owner.trim()) {
      setError('Informe o usuário responsável e selecione um arquivo.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      await uploadDocument({ file, owner: owner.trim() });
      setFile(null);
      form.reset();
      await onUploadComplete();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-labelledby="upload-title" className="h-fit border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Novo registro</p>
        <h2 id="upload-title" className="mt-1 text-lg font-semibold tracking-normal text-slate-950">Enviar documento</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">Associe um arquivo ao usuário responsável.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-slate-700">Usuário responsável</label>
          <input
            id="owner"
            name="owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            disabled={isUploading}
            required
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Nome do usuário"
          />
        </div>
        <div>
          <label htmlFor="document-file" className="block text-sm font-medium text-slate-700">Arquivo</label>
          <input
            id="document-file"
            name="file"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            disabled={isUploading}
            required
            className="mt-2 block w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex w-full items-center justify-center rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 border-l-4 border-red-500 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
    </section>
  );
}