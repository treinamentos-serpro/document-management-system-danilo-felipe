import { useState } from 'react';
import { downloadDocument } from '../services/api.js';

export default function DownloadButton({ document }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setError('');

    try {
      const { blob, filename } = await downloadDocument(document);
      const downloadUrl = URL.createObjectURL(blob);
      const link = window.document.createElement('a');

      link.href = downloadUrl;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex min-h-9 items-center justify-center rounded-md border border-sky-700 px-3 py-1.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
      >
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <span role="alert" className="max-w-48 text-right text-xs text-red-700">{error}</span>}
    </div>
  );
}