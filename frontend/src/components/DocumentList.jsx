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
    <section aria-labelledby="documents-title">
      <h2 id="documents-title">Documentos</h2>
      {isLoading && <p>Carregando documentos...</p>}
      {!isLoading && error && <p role="alert">{error}</p>}
      {!isLoading && !error && documents.length === 0 && <p>Nenhum documento enviado.</p>}
      {!isLoading && !error && documents.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Responsável</th>
              <th scope="col">Tamanho</th>
              <th scope="col">Enviado em</th>
              <th scope="col">Ação</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id}>
                <td>{document.originalName}</td>
                <td>{document.owner}</td>
                <td>{formatFileSize(document.size)}</td>
                <td>{formatUploadDate(document.uploadedAt)}</td>
                <td><DownloadButton document={document} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}