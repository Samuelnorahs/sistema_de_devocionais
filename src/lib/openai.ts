import OpenAI from "openai";

let openaiInstance: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export interface SermonAnalysisResult {
  centralTheme: string;
  mainBibleText: string;
  otherTexts: string[];
  objective: string;
  taughtPoints: string[];
  spiritualPrinciples: string[];
  practicalApplications: string[];
  keyPhrases: string[];
  logicalSequence: string;
}

export interface DevotionalGenerationResult {
  dayOfWeek: "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO";
  verse: string;
  title: string;
  reflection: string;
  personalApplication: string;
  reflectionQuestion: string;
  prayer: string;
  practicalChallenge: string;
}

const ANALYSIS_SYSTEM_PROMPT = `Você é um assistente teológico especializado em analisar pregações cristãs evangélicas.
Sua tarefa é extrair uma análise estruturada da transcrição fornecida.

REGRAS INEGOCIÁVEIS:
- Baseie-se EXCLUSIVAMENTE no conteúdo da transcrição fornecida
- NÃO invente temas, versículos ou interpretações que não estejam na pregação
- Se algo não estiver claro na transcrição, indique isso em vez de inventar
- Responda SEMPRE em português brasileiro
- Retorne APENAS JSON válido, sem markdown ou texto adicional`;

const ANALYSIS_USER_PROMPT = (transcription: string) => `Analise a seguinte transcrição de pregação e retorne um JSON com esta estrutura exata:

{
  "centralTheme": "tema central da pregação",
  "mainBibleText": "texto bíblico principal citado",
  "otherTexts": ["outros textos bíblicos mencionados"],
  "objective": "objetivo da mensagem",
  "taughtPoints": ["pontos principais ensinados"],
  "spiritualPrinciples": ["princípios espirituais extraídos"],
  "practicalApplications": ["aplicações práticas mencionadas"],
  "keyPhrases": ["frases ou ideias importantes do pregador"],
  "logicalSequence": "sequência lógica da pregação em parágrafo"
}

TRANSCRIÇÃO:
${transcription}`;

const DEVOTIONAL_SYSTEM_PROMPT = `Você é um assistente teológico especializado em criar devocionais diários a partir de pregações.
Sua tarefa é gerar 6 devocionais (Segunda a Sábado) baseados EXCLUSIVAMENTE na análise estruturada fornecida.

REGRAS INEGOCIÁVEIS:
- Cada devocional deve derivar do conteúdo REAL da pregação analisada
- NÃO introduza temas, versículos ou interpretações que não estejam na análise
- Distribua os pontos da pregação ao longo dos 6 dias de forma lógica
- Cada devocional deve ser autocontido mas conectado ao tema central
- Use linguagem acessível e pastoral
- Responda SEMPRE em português brasileiro
- Retorne APENAS JSON válido, sem markdown ou texto adicional`;

const DEVOTIONAL_USER_PROMPT = (analysis: SermonAnalysisResult) => `Com base na seguinte análise estruturada da pregação, gere 6 devocionais (Segunda a Sábado).

Retorne um JSON com esta estrutura:
{
  "devotionals": [
    {
      "dayOfWeek": "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO",
      "verse": "versículo bíblico (referência + texto)",
      "title": "título do devocional",
      "reflection": "reflexão curta (2-3 parágrafos)",
      "personalApplication": "aplicação pessoal prática",
      "reflectionQuestion": "pergunta para reflexão",
      "prayer": "oração guiada",
      "practicalChallenge": "desafio prático para o dia"
    }
  ]
}

ANÁLISE DA PREGAÇÃO:
${JSON.stringify(analysis, null, 2)}`;

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  const openai = getOpenAI();
  const { toFile } = await import("openai/uploads");
  const file = await toFile(audioBuffer, filename, { type: "audio/mpeg" });

  const response = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "pt",
    response_format: "text",
  });

  return response;
}

export async function analyzeSermon(transcription: string): Promise<SermonAnalysisResult> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      { role: "user", content: ANALYSIS_USER_PROMPT(transcription) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia da IA na análise");

  return JSON.parse(content) as SermonAnalysisResult;
}

export async function generateDevotionals(
  analysis: SermonAnalysisResult
): Promise<DevotionalGenerationResult[]> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: DEVOTIONAL_SYSTEM_PROMPT },
      { role: "user", content: DEVOTIONAL_USER_PROMPT(analysis) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia da IA na geração de devocionais");

  const parsed = JSON.parse(content) as { devotionals: DevotionalGenerationResult[] };
  return parsed.devotionals;
}

/** Mock functions for development without OpenAI API key */
export async function mockTranscribe(): Promise<string> {
  return `[Transcrição simulada para desenvolvimento]

Irmãos e irmãs, a palavra de Deus nos fala hoje através do livro de Filipenses, capítulo 4, versículos 19 e 20.
"O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus."

Deus proverá. Esta é a promessa que o Senhor nos deixa nesta manhã. Não estamos sozinhos nas nossas lutas.
O Senhor conhece cada necessidade, cada lágrima, cada noite em claro.

Quando olhamos para a cruz, vemos que Deus já provou que é fiel. Ele não nos abandona.
A provisão de Deus não é apenas material — é espiritual, emocional, relacional.

O desafio para esta semana é confiar. Confiar quando não vemos a resposta.
Confiar quando o caminho parece escuro. Deus proverá, porque Ele é fiel.

Que possamos viver esta semana na certeza de que o nosso Pai celestial cuida de nós.
Amém.`;
}

export async function mockAnalyze(): Promise<SermonAnalysisResult> {
  return {
    centralTheme: "Deus proverá — confiança na fidelidade divina",
    mainBibleText: "Filipenses 4:19 — O meu Deus, segundo as suas riquezas, suprirá todas as vossas necessidades em glória, por Cristo Jesus.",
    otherTexts: ["Filipenses 4:13", "Mateus 6:33"],
    objective: "Encorajar a igreja a confiar na provisão de Deus em todas as áreas da vida",
    taughtPoints: [
      "Deus conhece cada necessidade individual",
      "A provisão de Deus vai além do material",
      "A cruz é a maior prova da fidelidade de Deus",
      "Confiança é uma escolha diária, não um sentimento",
    ],
    spiritualPrinciples: [
      "Deus é fiel às Suas promessas",
      "A provisão divina é completa e suficiente",
      "A fé se manifesta na confiança prática",
    ],
    practicalApplications: [
      "Trazer as necessidades a Deus em oração",
      "Praticar gratidão pelas provisões já recebidas",
      "Confiar mesmo quando a resposta não é visível",
    ],
    keyPhrases: [
      "Deus proverá",
      "Não estamos sozinhos nas nossas lutas",
      "Confiar quando o caminho parece escuro",
    ],
    logicalSequence:
      "Introdução com texto bíblico → Declaração da promessa → Deus conhece nossas necessidades → Provisão além do material → Exemplo da cruz → Desafio de confiar → Conclusão e bênção",
  };
}

export async function mockGenerateDevotionals(): Promise<DevotionalGenerationResult[]> {
  const days = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"] as const;
  const titles = [
    "A Promessa de Provisão",
    "Deus Conhece Suas Necessidades",
    "Provisão Além do Material",
    "A Prova da Cruz",
    "Escolhendo Confiar",
    "Vivendo na Certeza",
  ];

  return days.map((day, i) => ({
    dayOfWeek: day,
    verse: "Filipenses 4:19 — O meu Deus suprirá todas as vossas necessidades em glória, por Cristo Jesus.",
    title: titles[i],
    reflection: `Reflexão do dia ${i + 1} sobre o tema "Deus proverá". Esta mensagem nos convida a olhar para a fidelidade de Deus como fundamento da nossa confiança diária.`,
    personalApplication: `Hoje, identifique uma área da sua vida onde você precisa confiar mais em Deus. Escreva essa necessidade e entregue-a ao Senhor em oração.`,
    reflectionQuestion: `Em que área da sua vida você tem dificuldade de confiar que Deus proverá?`,
    prayer: `Senhor, obrigado porque Tu conheces cada necessidade do meu coração. Ajuda-me a confiar na Tua provisão hoje. Amém.`,
    practicalChallenge: `Compartilhe com alguém uma experiência em que Deus provou Sua fidelidade na sua vida.`,
  }));
}
