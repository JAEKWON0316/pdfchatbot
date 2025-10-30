import OpenAI from 'openai';

let openai: OpenAI;

function getOpenAI() {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
  }
  return openai;
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const client = getOpenAI();
    const res = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });
    return res.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding');
  }
}