import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages, model = 'llama3' } = await req.json()

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      }),
    })

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Ollama error: ${response.status} ${response.statusText}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            for (const line of chunk.split('\n').filter(Boolean)) {
              try {
                const json = JSON.parse(line)
                if (json.message?.content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ token: json.message.content, done: !!json.done })}\n\n`)
                  )
                }
                if (json.done) controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              } catch { /* skip */ }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch {
    return new Response(
      JSON.stringify({ error: 'Cannot connect to Ollama. Run: ollama serve && ollama run llama3' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
