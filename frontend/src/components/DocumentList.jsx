import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function formatUploadDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, isLoading, error }) {
  return (
    <section aria-labelledby="documents-title" className="min-w-0 border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Arquivo</p>
          <h2 id="documents-title" className="mt-1 text-lg font-semibold tracking-normal text-slate-950">Documentos</h2>
        </div>
        {!isLoading && !error && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {documents.length} {documents.length === 1 ? 'item' : 'itens'}
          </span>
        )}
      </div>

      {isLoading && <p className="px-5 py-12 text-center text-sm text-slate-500 sm:px-6">Carregando documentos...</p>}
      {!isLoading && error && <p role="alert" className="m-5 border-l-4 border-red-500 bg-red-50 px-3 py-3 text-sm text-red-800 sm:m-6">{error}</p>}
      {!isLoading && !error && documents.length === 0 && (
        <div className="px-5 py-12 text-center sm:px-6">
          <p className="text-sm font-medium text-slate-700">Nenhum documento enviado.</p>
          <p className="mt-1 text-sm text-slate-500">Use o formulário ao lado para adicionar o primeiro arquivo.</p>
        </div>
      )}
      {!isLoading && !error && documents.length > 0 && (
        <div className="overflow-x-auto" tabIndex="0">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3">Nome</th>
              <th scope="col" className="px-6 py-3">Responsável</th>
              <th scope="col" className="px-6 py-3">Tamanho</th>
              <th scope="col" className="px-6 py-3">Enviado em</th>
              <th scope="col" className="px-6 py-3 text-right">Ação</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-slate-50">
                <td className="max-w-52 px-6 py-4 font-medium text-slate-800"><span className="block truncate" title={document.originalName}>{document.originalName}</span></td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{document.owner}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatFileSize(document.size)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatUploadDate(document.uploadedAt)}</td>
                <td className="px-6 py-4 text-right"><DownloadButton document={document} /></td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}