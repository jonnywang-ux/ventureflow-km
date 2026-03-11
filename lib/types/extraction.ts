export interface ExtractedContact {
  name: string
  title?: string
  company?: string
  email?: string
  phone?: string
  linkedin?: string
  notes?: string
}

export interface ExtractedIdea {
  title: string
  description: string
  category?: string
}

export interface ExtractedAction {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface ExtractionResult {
  summary: string
  keyPoints: string[]
  suggestedTags: string[]
  documentType?: string
  contacts: ExtractedContact[]
  ideas: ExtractedIdea[]
  actions: ExtractedAction[]
}
