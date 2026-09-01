import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/api.js';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setError('');

    try {
      setDocuments(await listDocuments());
    } catch (listError) {
      setError(listError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-700 text-sm font-bold text-white">
            DM
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-normal text-slate-950">Gestão de documentos</h1>
            <p className="text-sm text-slate-500">Envio, organização e acesso aos seus arquivos</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-8 lg:py-8">
        <UploadComponent onUploadComplete={loadDocuments} />
        <DocumentList documents={documents} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
}
