import express from 'express';
import { z } from 'zod';
import { classifyQuery } from '../utils/classifyQuery.js';
import { getEmbedding } from '../utils/embedding.js';
import { supabase } from '../utils/supabaseClient.js';
import OpenAI from 'openai';
import { classifyIntent } from '../utils/intentClassifier.js';

export const ragRouter = express.Router();

const ragSchema = z.object({
  question: z.string().min(1, '질문은 최소 1자 이상이어야 합니다.'),
});

// OpenAI 클라이언트 생성 함수
function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const legalSystemPrompt = `당신은 대한민국 법률 전문가 'JACK1 AI'입니다. 제공되는 법률 조문('참고 조문')에 근거해서만 사용자의 질문에 답변해야 합니다. 답변은 항상 한국어로, 친절하고 명확한 어조로 작성하세요.

답변 형식:
1.  사용자의 질문에 대한 핵심적인 답변을 먼저 제시합니다.
2.  그 뒤에, 답변의 근거가 된 조문들을 목록 형태로 명시합니다. 각 조문은 제목과 함께 표시하고, 전체 내용을 포함해야 합니다.
3.  만약 참고 조문만으로 답변을 할 수 없다면, 더 정확한 정보를 위해 연맹에 직접 문의하시거나 관련 규정을 확인하시기 바랍니다.라고 답변하세요.
4.  추측하거나 외부 지식을 사용하여 답변하지 마세요.
5.  답변의 마지막에는 항상 한 문단을 띄운 후 다음 문장을 추가해 주세요: "더 궁금한게 있으시다면 정확한 답변을 위해 구체적으로 질문해주세요. 또한 추가적인 세부사항이나 규정이 필요하시다면, 관련 규정을 직접 확인하시거나 JACK1에게 문의하시기 바랍니다."

**[중요]** 만약 동일한 조문 번호에 대해 여러 법률의 내용이 참고 조문으로 제공될 경우(예: 헌법 제1조, 민법 제1조), 각 법률의 내용을 명확히 구분하여 설명해주어야 합니다. 각 내용을 설명할 때는 어떤 법률의 몇 조인지 반드시 명시하세요. (예: "헌법 제1조는...")`;

const chitChatSystemPrompt = `당신은 대한민국 법률 전문 AI 비서 'JACK1 AI'입니다. 당신의 주된 역할은 법률에 대해 답변하는 것이지만, 사용자와 일상적인 대화도 나눌 수 있습니다. 항상 친절하고, 명료하며, 한국어로 답변하세요. 법률과 관련 없는 질문에는 자연스럽게 대화하되, 스스로를 법률 전문가라고 소개하며 대화를 법률 주제로 유도할 수 있습니다.`;

const GREETING_RESPONSES = [
  '안녕하세요! 저는 대한민국 법률 전문 AI 비서, JACK1 AI입니다. 궁금한 점이 있으시면 언제든지 물어보세요!',
  '안녕하세요! 무엇을 도와드릴까요? 법률에 대한 질문이 있으시면 편하게 말씀해 주세요.',
  '반갑습니다! JACK1 AI입니다. 대한민국 법률에 대한 모든 것을 물어보세요.'
];

ragRouter.post('/', async (req, res) => {
  try {
    const { question } = ragSchema.parse(req.body);

    const intent = classifyIntent(question);

    // 1. 인사(Greeting) 처리
    if (intent === 'greeting') {
      const randomGreeting = GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
      return res.json({
        answer: randomGreeting,
        references: []
      });
    }

    // 2. 일상 대화(Chit-chat) 처리
    if (intent === 'chit_chat') {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: chitChatSystemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.5,
      });

      return res.json({
        answer: completion.choices[0].message.content || '죄송합니다. 답변을 생성할 수 없습니다.',
        references: []
      });
    }

    // 3. 법률 질문(Legal Question) 처리
    console.log('✅ 법률 질문으로 처리:', question);
    const queryClassification = classifyQuery(question);
    
    let chunks: any[] = [];
    if (queryClassification.type === 'article_lookup') {
      const { data, error } = await supabase.rpc('search_articles', {
        p_article_numbers: queryClassification.articleNumbers!,
      });
      if (error) throw new Error(`DB 오류: ${error.message}`);
      chunks = data || [];
    } else {
      const embedding = await getEmbedding(question);
      const { data, error } = await supabase.rpc('search_keywords', {
        p_embedding: embedding,
        p_keywords: queryClassification.keywords!,
        p_match_count: 5,
      });
      if (error) throw new Error(`DB 오류: ${error.message}`);
      chunks = data || [];
    }

    // 필터링 로직
    if (
      queryClassification.type === 'article_lookup' &&
      queryClassification.keywords.length > 0 &&
      chunks.length > 1
    ) {
      const lawNameKeyword = queryClassification.keywords[0];
      const filteredChunks = chunks.filter(c => 
        c.file_name.includes(lawNameKeyword)
      );

      if (filteredChunks.length > 0) {
        chunks = filteredChunks;
      }
    }
    
    const uniqueFiles = new Set(chunks.map(c => c.file_name.replace(/\.pdf$|\(법률\)|\(헌법\)/g, '')));

    // 여러 파일에 걸쳐 있는 경우 처리
    if (queryClassification.type === 'article_lookup' && uniqueFiles.size > 1) {
      const fileSummary = [...uniqueFiles].map(fileName => {
        const firstMatch = chunks.find(c => c.file_name.replace(/\.pdf$|\(법률\)|\(헌법\)/g, '') === fileName);
        
        const previewText = firstMatch.content.replace(/\s+/g, ' ').trim();
        const maxLength = 60;
        let truncatedText = previewText;
        if (previewText.length > maxLength) {
          truncatedText = previewText.substring(0, maxLength) + '...';
        }

        return `  - ${fileName}: "${truncatedText}"`;
      }).join('\n');

      const clarificationMessage = `질문하신 '${queryClassification.articleNumbers![0]}'에 대한 정보가 여러 법률에 존재합니다. 어떤 법률에 대해 더 자세히 알아볼까요?\n\n${fileSummary}\n\n원하시는 법률의 이름을 포함하여 다시 질문해 주세요. (예: "헌법 제1조 알려줘")`;
      
      return res.json({
        answer: clarificationMessage,
        references: [...uniqueFiles]
      });
    }

    // 검색 결과가 없는 경우
    if (chunks.length === 0) {
      const fallbackCompletion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: legalSystemPrompt },
          { role: 'user', content: `참고 조문이 없습니다. 다음 질문에 대해 아는 대로 답변해 주세요: ${question}` },
        ],
        temperature: 0.3,
      });
      
      return res.json({
        answer: fallbackCompletion.choices[0].message.content || '죄송합니다. 답변을 생성할 수 없습니다.',
        references: []
      });
    }

    const contextText = chunks
      .map(c => {
        const cleanFileName = c.file_name.replace(/\.pdf$|\(법률\)|\(헌법\)/g, '');
        return `- 조문: ${cleanFileName} ${c.law_article_number} (${c.law_article_title})\n- 내용: ${c.content}`
      })
      .join('\n\n');

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: legalSystemPrompt },
        { role: 'system', content: `참고 조문:\n${contextText}` },
        { role: 'user', content: question },
      ],
      temperature: 0.2,
    });

    // 참고 문서 정리
    const referenceData: string[] = [];
    const seenFiles = new Set<string>();
    for (const chunk of chunks) {
      const cleanFileName = chunk.file_name.replace(/\.pdf$|\(법률\)|\(헌법\)/g, '');
      if (cleanFileName && !seenFiles.has(cleanFileName)) {
        referenceData.push(cleanFileName);
        seenFiles.add(cleanFileName);
      }
    }

    res.json({
      answer: completion.choices[0].message.content || '죄송합니다. 답변을 생성할 수 없습니다.',
      references: referenceData
    });

  } catch (error: any) {
    console.error('RAG API Error:', error);
    const errorMessage =
      error instanceof z.ZodError
        ? error.issues.map(i => i.message).join(', ')
        : `API 처리 중 오류 발생: ${error.message}`;
    
    res.status(500).json({
      error: errorMessage,
      references: []
    });
  }
});