import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';

// Types for better type safety
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const chatRoutes = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/', () => ({
    message: 'ChatGPT Backend API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      stream: 'POST /api/chat/stream',
      health: 'GET /api/health'
    }
  }))
  
  .get('/health', () => ({
    status: 'healthy',
    timestamp: new Date().toISOString()
  }))
  
  .post('/chat', async ({ body, set }) => {
    try {
      const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000, stream = false } = body as ChatRequest;
      
      // Validate required environment variable
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        set.status = 500;
        return {
          error: 'OpenAI API key not configured',
          message: 'Please set OPENAI_API_KEY environment variable'
        };
      }

      // Validate messages
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        set.status = 400;
        return {
          error: 'Invalid request',
          message: 'Messages array is required and cannot be empty'
        };
      }

      // Prepare request to OpenAI
      const openaiRequest = {
        model,
        messages,
        temperature,
        max_tokens,
        stream
      };

      // Make request to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        set.status = response.status;
        return {
          error: 'OpenAI API error',
          message: errorData.error?.message || 'Unknown error occurred',
          details: errorData
        };
      }

      const data: OpenAIResponse = await response.json();
      
      // Return formatted response
      return {
        success: true,
        response: data.choices[0]?.message?.content || '',
        model: data.model,
        usage: data.usage,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Chat endpoint error:', error);
      set.status = 500;
      return {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, {
    body: t.Object({
      messages: t.Array(t.Object({
        role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
        content: t.String()
      })),
      model: t.Optional(t.String()),
      temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
      max_tokens: t.Optional(t.Number({ minimum: 1, maximum: 4000 })),
      stream: t.Optional(t.Boolean())
    })
  })
  
  .post('/chat/stream', async ({ body, set }) => {
    try {
      const { messages, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens = 1000 } = body as ChatRequest;
      
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        set.status = 500;
        return {
          error: 'OpenAI API key not configured'
        };
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        set.status = 400;
        return {
          error: 'Messages array is required and cannot be empty'
        };
      }

      const openaiRequest = {
        model,
        messages,
        temperature,
        max_tokens,
        stream: true
      };

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openaiRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        set.status = response.status;
        return {
          error: 'OpenAI API error',
          message: errorData.error?.message || 'Unknown error occurred'
        };
      }

      // Set headers for streaming
      set.headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      };

      return response.body;

    } catch (error) {
      console.error('Stream endpoint error:', error);
      set.status = 500;
      return {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, {
    body: t.Object({
      messages: t.Array(t.Object({
        role: t.Union([t.Literal('user'), t.Literal('assistant'), t.Literal('system')]),
        content: t.String()
      })),
      model: t.Optional(t.String()),
      temperature: t.Optional(t.Number({ minimum: 0, maximum: 2 })),
      max_tokens: t.Optional(t.Number({ minimum: 1, maximum: 4000 }))
    })
  })
  
  .onError(({ code, error, set }) => {
    console.error('Server error:', error);
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        error: 'Validation error',
        message: 'Request body validation failed',
        details: error.message
      };
    }
    
    set.status = 500;
    return {
      error: 'Internal server error',
      message: 'Something went wrong'
    };
  });

// Export types for use in other files
export type { ChatMessage, ChatRequest, OpenAIResponse };