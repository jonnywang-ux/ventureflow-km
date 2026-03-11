-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_articles_fts ON public.articles
  USING gin(to_tsvector('english', title || ' ' || COALESCE(content_text, '') || ' ' || COALESCE(excerpt, '')));

CREATE INDEX IF NOT EXISTS idx_documents_fts ON public.documents
  USING gin(to_tsvector('english', title || ' ' || COALESCE(raw_text, '') || ' ' || COALESCE(ai_summary, '')));

CREATE INDEX IF NOT EXISTS idx_contacts_fts ON public.contacts
  USING gin(to_tsvector('english', name || ' ' || COALESCE(company, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(notes, '')));

CREATE INDEX IF NOT EXISTS idx_ideas_fts ON public.ideas
  USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_documents_team_id ON public.documents(team_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_articles_team_id ON public.articles(team_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_contacts_team_id ON public.contacts(team_id);
CREATE INDEX IF NOT EXISTS idx_ideas_team_id ON public.ideas(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_content ON public.content_tags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
