# Integração com Google Drive: Fluxo Frontend-Side

Este documento documenta as decisões arquiteturais sobre a jornada de importação e classificação de mídias originadas do Google Drive, direcionadas para usuários com o domínio corporativo Google Workspace (`@empresa.com`).

## 1. Visão Geral do Fluxo

Abandonamos a abordagem inicial de "colar link individual" em favor de uma integração nativa e em lote através do **Google Drive Picker** executado no client-side (Frontend React).

O fluxo funciona da seguinte forma:
1. O usuário (funcionário) clica em "Importar Diretório".
2. O Frontend abre a interface nativa do Google Drive Picker.
3. O usuário seleciona o diretório desejado (respeitando seus acessos na empresa).
4. O Frontend recebe o `Folder ID` selecionado e consome internamente a API do Google Drive para listar todos os arquivos contidos ali.
5. As imagens (com suas *thumbnails* do Drive) são renderizadas na tela do Frontend para classificação.
6. Após a classificação manual das tags feita pelo usuário, o Frontend faz as chamadas via API REST (`POST /api/v1/media`) enviando os metadados finais e unificados diretamente para nosso Backend.

*(Veja o arquivo `docs/classificariont.mermaid` para a representação visual.)*

## 2. Por que esta Arquitetura é Superior?

### A. Autenticação e Autorização Dinâmicas
Ao rodar o Picker e a listagem de arquivos no Frontend via OAuth 2.0 (Client-side), nossa aplicação delega a identidade ao próprio funcionário (`usuario@empresa.com`) que está logado. 

Isso resolve um problema massivo: **Permissões Granulares**. O usuário **só verá** e só conseguirá listar pastas no Drive às quais a política da empresa explicitamente concedeu permissão de leitura a ele.

Ao contrário de uma *Service Account* (que atua como uma entidade separada e exigiria que toda pasta corporativa fosse compartilhada diretamente com o robô), este modelo respeita a governança de dados da empresa instintivamente.

### B. O Backend Fica Enxuto
Pela listagem e manipulação de cursores da Google API acontecerem localmente na máquina do usuário, o Backend (Go/Cloud Run) processa os dados apenas quando eles já estão estruturados, classificados e prontos para serem salvos de vez na base de dados (Neon DB). Não lidamos com timeout na exploração de diretórios grandes, evitando onerar nossos custos no GCP.

## 3. Considerações de Segurança sobre Chaves no Frontend

Para iniciar a API do Google Drive e o Picker no frontend, nós introduziremos variáveis e as exporemos de propósito no código fonte do cliente (`NEXT_PUBLIC_`):
- **O Google OAuth Client ID**
- **A Google API Key**

Isso é um fluxo planejado e *By Design* (desenhado pelo Google). O que inviabiliza explorações em potencial:
- A API Key é travada unicamente ao domínio do frontend (via restrições de *HTTP Referrers* no Console do GCP). Por exemplo: Chamadas serão bloqueadas se não vierem de `https://athlon.suaempresa.com`.
- O *Access Token* real e as permissões aos arquivos são temporários e mantidos estritamente na memória da sessão do navegador do funcionário.

## 4. Requisitos de Implementação para o Frontend

A equipe responsável pelo frontend precisará:
1. **Configurar o Google Workspace:** Como se tratará de um ambiente corporativo, é crítico parametrizar o Google Drive Picker e a API do Drive com a `Feature Flag` (query/options parameter) `supportsAllDrives=true`. Isso garantirá acesso também aos Drives Compartilhados (Shared Drives), que são o formato mais usado por empresas, e não apenas ao "Meu Drive" pessoal.
2. **Carregamento dos SDKs:** Ingerir as bibliotecas oficiais dinamicamente:
   - `https://apis.google.com/js/api.js` (para uso da Drive REST API via client);
   - A biblioteca de identidades (`https://accounts.google.com/gsi/client`) para garantir a autenticação via pop-up padrão.
3. **Escopos Autorizados (Scopes):** Será exigido, no mínimo, a permissão `.readonly` para viabilizar listagem segura dos dados das pastas.
   - `https://www.googleapis.com/auth/drive.readonly`
