---
description: "Moderniza o visual operacional do frontend do DMS com Tailwind CSS 3, preservando upload, listagem e download."
name: modernizar-visual-tailwind
argument-hint: "Objetivo visual opcional (ex.: destacar a lista de documentos)"
agent: dms-ui-tailwind
---

# Modernizar visual do DMS com Tailwind 3

Modernize o frontend do Document Management System usando Tailwind CSS 3.

Contexto: a aplicação atual em `frontend/src/` possui os fluxos funcionais de envio, listagem e download de documentos, mas ainda usa marcação simples e estilo inline. Preserve integralmente esses comportamentos e a comunicação via serviços existentes em `/api`.

Objetivo adicional informado pelo usuário: `${input:objetivo visual:opcional}`

Entregue uma interface operacional, clara e responsiva para gestão de documentos. Siga as diretrizes do agente `dms-ui-tailwind`, configure Tailwind CSS 3 caso seja necessário e valide a entrega com `npm run build` no diretório `frontend/`.