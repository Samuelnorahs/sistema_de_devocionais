# Spec.md — Plataforma de Devocionais Semanais ICDP

## 1. Visão Geral

Sistema web que transforma a pregação de domingo (áudio) em uma sequência de 6 devocionais diários (segunda a sábado), usando transcrição automática e IA generativa, com etapa de revisão humana antes da publicação.

**Cultura que o produto sustenta:**
`DOMINGO → RECEBEMOS A PALAVRA` / `SEGUNDA A SÁBADO → VIVEMOS A PALAVRA`

**Princípio inegociável:** os devocionais precisam derivar do conteúdo real da pregação, nunca de temas genéricos gerados pela IA. Nada é publicado sem aprovação humana.

---

## 2. Stack Técnica Proposta

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend + Backend | Next.js (App Router) | Full-stack em um único projeto, API Routes / Server Actions para o backend |
| Linguagem | TypeScript | Reduz erros em fluxos com múltiplas etapas assíncronas |
| Banco de dados | PostgreSQL (ex: Supabase, Neon ou Railway) | Relacional, bom para status/etapas |
| ORM | Prisma | Migrations + tipagem |
| Storage de arquivos | S3-compatible (Cloudflare R2, Supabase Storage ou AWS S3) | Armazenar áudio original e (opcional) transcrição |
| Fila / processamento assíncrono | Queue simples (ex: Inngest, Trigger.dev ou BullMQ + Redis) | Necessário pois o pipeline de IA é longo (minutos) |
| Transcrição de áudio | API Whisper (OpenAI) ou alternativa custo-benefício | Definir depois de testar custo/precisão |
| Análise + geração de devocionais | API OpenAI (GPT) | Prompt estruturado em 2 etapas (análise → geração) |
| Autenticação admin | NextAuth / Auth.js | Login restrito para equipe/pastor |
| Hospedagem | Vercel (frontend/backend) + banco/storage externos | Compatível nativamente com Next.js |

> Observação: como o processamento de um áudio de 40–60min pode levar minutos, funções serverless com timeout curto (Vercel) não são ideais para rodar o pipeline inteiro de forma síncrona — daí a necessidade de fila/job assíncrono (ver seção 5).

---

## 3. Personas e Papéis de Acesso

1. **Membro (público)** — acessa os devocionais publicados, sem login (ou login simples).
2. **Equipe de mídia** — sobe o áudio, acompanha o processamento.
3. **Pastor / Revisor** — edita e aprova o conteúdo antes da publicação.
4. **Admin** — gerencia usuários, configurações gerais, prompts da IA.

*(Papéis 2, 3 e 4 podem inicialmente ser o mesmo usuário — mas o sistema de permissões deve já prever essa separação.)*

---

## 4. Fluxo Funcional (Pipeline)

```
1. Upload do áudio (painel admin)
   → título, data, pregador, arquivo de áudio

2. Transcrição automática
   → status: "Transcrevendo"

3. Análise estruturada da pregação (IA - etapa 1)
   → tema central, texto bíblico principal, textos secundários,
     objetivo, pontos ensinados, princípios espirituais,
     aplicações práticas, frases-chave, sequência lógica

4. Geração dos 6 devocionais (IA - etapa 2, usa a saída da etapa 3)
   → Segunda a Sábado, cada um com:
     versículo, título, reflexão curta, aplicação pessoal,
     pergunta de reflexão, oração, desafio prático

5. Revisão humana (painel)
   → cada devocional editável individualmente
   → aprovação individual ou em lote

6. Publicação
   → página "Palavra da Semana" fica pública
   → membros acessam devocional do dia correspondente
```

### Estados do processamento (visíveis no painel)
- `Recebendo áudio`
- `Transcrevendo`
- `Analisando pregação`
- `Criando devocionais`
- `Pronto para revisão`
- `Publicado`
- `Erro` (com opção de reprocessar a etapa que falhou)

---

## 5. Arquitetura do Pipeline Assíncrono

Como o processamento é longo, o fluxo não deve travar a requisição HTTP:

1. Upload do áudio → salvo no storage → registro criado no banco com status `pending`.
2. Um job é disparado (fila) para processar em background.
3. O job avança pelas etapas, atualizando o status no banco a cada etapa concluída.
4. O painel administrativo faz polling (ou usa websockets/SSE) para refletir o status em tempo real, sem que ninguém precise ficar com a tela aberta.
5. Se uma etapa falhar (ex: API de transcrição fora do ar), o job marca `erro` com a mensagem, e permite retry manual a partir daquela etapa (não do zero).

---

## 6. Modelagem de Dados (rascunho)

**Sermon (Pregação)**
- id, título, data, pregador, arquivo_audio_url, status, criado_em

**Transcription (Transcrição)**
- id, sermon_id, texto_completo, criado_em

**SermonAnalysis (Análise estruturada)**
- id, sermon_id, tema_central, texto_biblico_principal, outros_textos[], objetivo, pontos_ensinados[], principios_espirituais[], aplicacoes_praticas[], frases_chave[], sequencia_logica

**Devotional (Devocional diário)**
- id, sermon_id, dia_semana (segunda...sábado), versiculo, titulo, reflexao, aplicacao_pessoal, pergunta_reflexao, oracao, desafio_pratico, status (rascunho/aprovado/publicado), editado_por, editado_em

**User (Usuário admin)**
- id, nome, email, papel (equipe/pastor/admin)

---

## 7. Prompts de IA (estrutura, não o texto final)

### Etapa 1 — Análise da pregação
Entrada: transcrição completa.
Saída esperada (JSON estruturado): tema central, texto bíblico principal, outros textos usados, objetivo da mensagem, principais pontos, princípios espirituais, aplicações práticas, frases/ideias importantes, sequência lógica da pregação.

### Etapa 2 — Geração dos devocionais
Entrada: JSON da etapa 1 (não a transcrição bruta, para manter foco e reduzir custo/tokens).
Saída esperada: array com 6 objetos (um por dia), cada um seguindo o formato do modelo de dados `Devotional`.

> Ambos os prompts devem instruir a IA a se ater estritamente ao conteúdo fornecido, evitando introduzir temas, versículos ou interpretações que não estejam na pregação original.

---

## 8. Painel Administrativo

### Tela: Nova Pregação
- Upload de áudio
- Campos: título/data, pregador
- Botão "Processar"
- Indicador de progresso por etapa

### Tela: Palavra da Semana — Rascunho
- Lista dos 6 devocionais (Segunda a Sábado)
- Botão "Editar" por dia (abre editor com todos os campos do devocional)
- Botão "Aprovar e Publicar" (geral) e opção de aprovar individualmente

### Tela: Histórico
- Lista de todas as pregações processadas, com status e link para a página pública

---

## 9. Área Pública (Site)

### Página "Palavra da Semana"
- Tema da semana
- Lista dos 6 dias (Segunda a Sábado), cada um levando ao devocional do dia

### Página de Devocional (por dia)
- Versículo
- Título
- Reflexão
- Aplicação pessoal
- Pergunta de reflexão
- Oração
- Desafio prático

### Página inicial
- Chamada para o devocional do dia atual
- Acesso ao histórico de semanas anteriores

---

## 10. Requisitos Não-Funcionais

- **Custo controlável**: monitorar consumo de tokens (OpenAI) e de transcrição por pregação; considerar cache/reuso.
- **Confiabilidade teológica**: nenhuma publicação automática sem revisão humana (regra dura do sistema, não apenas prática de uso).
- **Auditoria**: manter histórico de quem editou/aprovou cada devocional.
- **Responsivo**: uso majoritário será mobile (membros acessando o devocional do dia).
- **Reprocessamento**: qualquer etapa (transcrição, análise, geração) deve poder ser refeita isoladamente sem repetir as etapas anteriores.

---

## 11. Fora de Escopo (v1)

- Edição de áudio (cortes, remoção de ruído) — o áudio é enviado como gravado.
- Notificações push/e-mail automáticas para os devocionais (pode ser v2).
- Múltiplas igrejas/tenants — sistema pensado para a ICDP.
- App mobile nativo — apenas site responsivo na v1.

---

## 12. Próximos Passos Sugeridos

1. Validar custo estimado por pregação (transcrição + 2 chamadas de IA) com um áudio real de teste.
2. Definir provedor de transcrição (Whisper API vs. alternativas) por custo/precisão.
3. Prototipar o prompt da Etapa 1 e 2 com uma transcrição real, para validar qualidade antes de construir o pipeline completo.
4. Definir identidade visual do site (ver material já levantado: logo pomba dourada, cores douradas).
5. Estruturar o schema do banco (Prisma) a partir da seção 6.