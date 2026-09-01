# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para enviar, listar e baixar documentos, associando cada documento a um usuário identificado de forma simples.

## 2. Escopo

### Dentro do escopo

- Upload de documentos de qualquer tipo com tamanho máximo de 10 MiB.
- Gravação dos arquivos no filesystem local da aplicação.
- Registro e consulta dos metadados dos documentos em memória.
- Listagem integral dos documentos, do upload mais recente para o mais antigo.
- Download de um documento pelo seu identificador.
- Associação do documento ao valor recebido no cabeçalho `X-User-Id`.
- Endpoint de saúde para verificação da disponibilidade do backend.

### Fora do escopo

- Armazenamento externo, em nuvem ou integrado a provedores de terceiros.
- Banco de dados ou persistência de metadados entre reinicializações.
- Autenticação, autorização ou gerenciamento de contas de usuário.
- Versionamento, atualização ou exclusão de documentos.
- Busca, filtros, paginação e ordenação configurável da listagem.
- Restrições por extensão ou tipo MIME além do limite de tamanho definido.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve receber um arquivo no campo multipart `file` em `POST /upload`. |
| RF-02 | O upload deve exigir o cabeçalho HTTP `X-User-Id` não vazio para identificar o dono do documento. |
| RF-03 | Para cada upload aceito, o sistema deve gerar um identificador único, salvar o arquivo em `backend/storage` e registrar seus metadados em memória. |
| RF-04 | O sistema deve rejeitar arquivos maiores que 10 MiB e requisições sem arquivo ou sem `X-User-Id`. |
| RF-05 | O sistema deve retornar a lista integral dos metadados em `GET /documents`, ordenada por `uploadedAt` de forma decrescente. |
| RF-06 | O sistema deve disponibilizar o conteúdo do arquivo em `GET /documents/:id/download`, preservando o nome original para download. |
| RF-07 | O sistema deve retornar erro de recurso inexistente quando o identificador informado não corresponder a um documento registrado. |
| RF-08 | O sistema deve expor `GET /health` para informar que o backend está disponível. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local, na pasta configurada para armazenamento, usando `multer` com `diskStorage`. |
| RNF-02 | Os metadados devem permanecer somente em memória nesta fase e serão perdidos ao reiniciar o processo. |
| RNF-03 | A configuração deve ser recebida por variáveis de ambiente, seguindo o princípio 12-Factor App. |
| RNF-04 | O tamanho máximo padrão de upload deve ser 10 MiB (10.485.760 bytes), configurável por variável de ambiente. |
| RNF-05 | Erros de entrada HTTP e de acesso ao filesystem devem ser tratados no limite da aplicação, sem expor caminhos internos ou detalhes técnicos ao cliente. |
| RNF-06 | O backend deve manter a separação `routes -> controllers -> services -> repositories`. |
| RNF-07 | O frontend deve acessar a API pelo prefixo `/api`, encaminhado pelo proxy do Vite no desenvolvimento. |
| RNF-08 | O código deve usar JavaScript, CommonJS no backend e componentes funcionais React no frontend. |

### Configuração de ambiente

| Variável | Obrigatória | Padrão | Finalidade |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório local onde os arquivos enviados são gravados. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Tamanho máximo aceito para cada arquivo, em bytes. |

## 5. Modelo de dados

### Metadados internos do documento

| Campo | Tipo | Descrição | Regra |
| --- | --- | --- | --- |
| `id` | string | Identificador público único do documento. | Gerado pelo backend no upload; imutável. |
| `originalName` | string | Nome fornecido pelo cliente para o arquivo. | Preservado para exibição e download. |
| `storedName` | string | Nome gerado para o arquivo no armazenamento local. | Uso interno; não retornado nas respostas JSON. |
| `mimeType` | string | Tipo MIME informado pelo upload. | Uso interno para definir o tipo da resposta de download. |
| `size` | number | Tamanho do arquivo em bytes. | Inteiro maior ou igual a zero e menor ou igual ao limite configurado. |
| `uploadedAt` | string | Data e hora do upload. | ISO 8601 em UTC; imutável. |
| `owner` | string | Identificador simples do dono. | Obtido do cabeçalho `X-User-Id`; não vazio. |

### Representação pública

As respostas JSON que retornam documentos devem expor somente:

```json
{
  "id": "string",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

`storedName` e qualquer caminho físico pertencem à implementação do repositório e não podem ser expostos pela API.

## 6. Contratos de API

### Convenções gerais

- O backend expõe as rotas sem prefixo; o frontend usa `/api` por meio do proxy de desenvolvimento.
- Respostas JSON usam `Content-Type: application/json; charset=utf-8`.
- Erros seguem o formato abaixo:

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado."
  }
}
```

- O campo `code` é estável para integração. `message` é adequada para exibição ao usuário e não revela detalhes internos.

### GET /health

Verifica a disponibilidade do backend.

**Resposta de sucesso - 200 OK**

```json
{
  "status": "ok"
}
```

### POST /upload

Recebe e registra um documento.

**Requisição**

- Cabeçalho obrigatório: `X-User-Id: <identificador-nao-vazio>`.
- `Content-Type`: `multipart/form-data`.
- Campo de arquivo obrigatório: `file`.
- Limite: 10 MiB por arquivo, salvo configuração por `MAX_FILE_SIZE_BYTES`.

**Resposta de sucesso - 201 Created**

```json
{
  "id": "doc_01j...",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

**Erros**

| Status | Código | Situação |
| --- | --- | --- |
| 400 | `MISSING_USER_ID` | O cabeçalho `X-User-Id` está ausente ou vazio. |
| 400 | `MISSING_FILE` | O campo `file` não foi enviado. |
| 400 | `INVALID_UPLOAD` | A requisição multipart é inválida ou não pôde ser processada. |
| 413 | `FILE_TOO_LARGE` | O arquivo excede o tamanho máximo configurado. |
| 500 | `UPLOAD_FAILED` | O arquivo ou os metadados não puderam ser persistidos. |

### GET /documents

Retorna todos os documentos registrados na memória durante a execução atual, sem filtros e sem paginação.

**Resposta de sucesso - 200 OK**

```json
[
  {
    "id": "doc_01j...",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "usuario-123"
  }
]
```

- A lista vazia deve retornar `[]`.
- A ordenação é decrescente por `uploadedAt`.

**Erros**

| Status | Código | Situação |
| --- | --- | --- |
| 500 | `DOCUMENT_LIST_FAILED` | Os metadados não puderam ser consultados. |

### GET /documents/:id/download

Envia o conteúdo de um documento registrado.

**Parâmetro de rota**

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador público retornado no upload ou na listagem. |

**Resposta de sucesso - 200 OK**

- Corpo: conteúdo binário do arquivo.
- `Content-Type`: o tipo MIME registrado no upload; usar `application/octet-stream` quando indisponível.
- `Content-Disposition`: `attachment; filename="<originalName>"`.

**Erros**

| Status | Código | Situação |
| --- | --- | --- |
| 400 | `INVALID_DOCUMENT_ID` | O parâmetro `id` está ausente ou inválido. |
| 404 | `DOCUMENT_NOT_FOUND` | Não existe metadado para o identificador informado. |
| 404 | `DOCUMENT_FILE_NOT_FOUND` | O metadado existe, mas o arquivo não está disponível no armazenamento local. |
| 500 | `DOWNLOAD_FAILED` | O arquivo não pôde ser lido ou enviado. |

## 7. Decisões arquiteturais

### Backend

O backend usa uma Clean Architecture simples dentro de `backend/src`:

| Camada | Responsabilidade |
| --- | --- |
| `routes/` | Declara endpoints, registra o middleware de upload do Multer e delega aos controllers. |
| `controllers/` | Extrai dados HTTP, faz validação básica, chama services e converte resultados e falhas em respostas HTTP. |
| `services/` | Coordena os casos de uso de upload, listagem e download e aplica regras de negócio. |
| `repositories/` | Persiste e localiza arquivos no filesystem local e mantém a coleção de metadados em memória. |

As dependências seguem exclusivamente `routes -> controllers -> services -> repositories`. Services não devem depender de objetos `req` ou `res`; repositories não devem depender de HTTP.

O Multer com `diskStorage` é configurado na borda HTTP para gravar em `STORAGE_DIR`. O repository é responsável por conhecer apenas o nome armazenado e por recuperar o arquivo solicitado. Na falha de registro de metadados após a gravação, a implementação deve tentar remover o arquivo recém-criado para evitar arquivo órfão.

O valor de `X-User-Id` representa uma identidade declarada pelo cliente nesta fase. Não equivale a autenticação e não impõe controle de autorização: qualquer cliente pode listar e baixar documentos enquanto esse requisito não for evoluído.

### Frontend

O frontend usa React, componentes funcionais e Hooks. As páginas e componentes devem usar um serviço em `frontend/src/services/` baseado em `fetch`, sempre requisitando `/api/upload`, `/api/documents` e `/api/documents/:id/download`. O proxy do Vite remove `/api` e encaminha a chamada ao backend local.

## 8. Plano de execução

1. Definir as variáveis de ambiente, garantir a criação do diretório local de armazenamento e centralizar os limites de upload.
2. Implementar repositories para manter metadados em memória e localizar arquivos em `backend/storage`, incluindo a remoção compensatória de arquivos órfãos quando necessária.
3. Implementar services para os casos de uso de criar documento, listar documentos e obter documento para download, aplicando as regras de dados e erros de domínio.
4. Implementar controllers para validar `X-User-Id`, entrada multipart e IDs, além de mapear falhas para o contrato HTTP especificado.
5. Implementar routes para registrar os três endpoints de documentos e configurar Multer com `diskStorage` e limite configurável de 10 MiB.
6. Adicionar testes de backend com `node:test` para health check, upload válido, validações, limite de tamanho, listagem ordenada, download e cenários de documento inexistente.
7. Criar o serviço de API e os componentes React para upload, listagem e acionamento de download, tratando estados de carregamento, vazio e erro.
8. Validar a integração pelo proxy `/api`, exercitando o fluxo de upload, listagem e download em execução local.
9. Executar os testes do backend e o build do frontend antes de integrar alterações.

Este plano descreve trabalho futuro. Nesta etapa, a única entrega é este documento de especificação.