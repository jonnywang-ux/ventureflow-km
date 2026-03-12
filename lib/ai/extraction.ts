import { z } from 'zod'
import { getAnthropicClient, MODEL, MAX_TOKENS } from './claude'
import { EXTRACTION_SYSTEM_PROMPT } from './prompts'
import type { ExtractionResult } from '@/lib/types/extraction'

const ExtractionSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).default([]),
  suggestedTags: z.array(z.string()).default([]),
  documentType: z.string().optional(),
  industrySegments: z.array(z.string()).default([]),
  contacts: z
    .array(
      z.object({
        name: z.string(),
        title: z.string().optional(),
        company: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        linkedin: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .default([]),
  companies: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['startup', 'vc', 'corporate', 'accelerator', 'institution']).optional(),
        description: z.string().optional(),
      })
    )
    .default([]),
  ideas: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.string().optional(),
      })
    )
    .default([]),
  actions: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
      })
    )
    .default([]),
})

export async function extractFromText(text: string): Promise<ExtractionResult> {
  const client = getAnthropicClient()

  // Truncate text to ~100K chars to stay within context limits
  const truncated = text.slice(0, 100000)

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please analyze this document and extract structured information:\n\n${truncated}`,
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse JSON — strip any markdown code fences if present
  const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return ExtractionSchema.parse(parsed)
}

export async function extractFromImage(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<ExtractionResult> {
  const client = getAnthropicClient()

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Please analyze this image/document and extract structured information.',
          },
        ],
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''
  const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return ExtractionSchema.parse(parsed)
}
