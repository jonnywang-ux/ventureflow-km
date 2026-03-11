-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role in a team
CREATE OR REPLACE FUNCTION public.get_team_role(p_team_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.team_members
  WHERE team_id = p_team_id AND user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = auth.uid()
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: check if user is editor or admin
CREATE OR REPLACE FUNCTION public.can_edit(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'editor')
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "users_read_own_profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "users_insert_own_profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
-- Team members can read each other's profiles
CREATE POLICY "team_members_read_profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
  )
);

-- TEAMS
CREATE POLICY "team_members_read_team" ON public.teams FOR SELECT USING (public.is_team_member(id));
CREATE POLICY "admins_update_team" ON public.teams FOR UPDATE USING (public.is_admin(id));
CREATE POLICY "authenticated_create_team" ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TEAM_MEMBERS
CREATE POLICY "team_members_read_members" ON public.team_members FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "admins_manage_members" ON public.team_members FOR ALL USING (public.is_admin(team_id));
CREATE POLICY "self_join_team" ON public.team_members FOR INSERT WITH CHECK (user_id = auth.uid());

-- DOCUMENTS
CREATE POLICY "team_members_read_documents" ON public.documents FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_insert_documents" ON public.documents FOR INSERT WITH CHECK (public.can_edit(team_id));
CREATE POLICY "editors_update_documents" ON public.documents FOR UPDATE USING (public.can_edit(team_id));
CREATE POLICY "admins_delete_documents" ON public.documents FOR DELETE USING (public.is_admin(team_id) OR created_by = auth.uid());

-- ARTICLES
CREATE POLICY "team_members_read_articles" ON public.articles FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_insert_articles" ON public.articles FOR INSERT WITH CHECK (public.can_edit(team_id));
CREATE POLICY "editors_update_articles" ON public.articles FOR UPDATE USING (public.can_edit(team_id));
CREATE POLICY "admins_delete_articles" ON public.articles FOR DELETE USING (public.is_admin(team_id) OR created_by = auth.uid());

-- TAGS
CREATE POLICY "team_members_read_tags" ON public.tags FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_manage_tags" ON public.tags FOR ALL USING (public.can_edit(team_id));

-- CONTENT_TAGS
CREATE POLICY "team_members_read_content_tags" ON public.content_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tags WHERE id = content_tags.tag_id AND public.is_team_member(team_id))
);
CREATE POLICY "editors_manage_content_tags" ON public.content_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tags WHERE id = content_tags.tag_id AND public.can_edit(team_id))
);

-- CONTACTS
CREATE POLICY "team_members_read_contacts" ON public.contacts FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_manage_contacts" ON public.contacts FOR ALL USING (public.can_edit(team_id));

-- IDEAS
CREATE POLICY "team_members_read_ideas" ON public.ideas FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_manage_ideas" ON public.ideas FOR ALL USING (public.can_edit(team_id));

-- TASKS
CREATE POLICY "team_members_read_tasks" ON public.tasks FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "editors_manage_tasks" ON public.tasks FOR ALL USING (public.can_edit(team_id));

-- COMMENTS (all team members can add comments, only author or admin can delete)
CREATE POLICY "team_members_read_comments" ON public.comments FOR SELECT USING (public.is_team_member(team_id));
CREATE POLICY "team_members_insert_comments" ON public.comments FOR INSERT WITH CHECK (public.is_team_member(team_id));
CREATE POLICY "authors_update_comments" ON public.comments FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "authors_delete_comments" ON public.comments FOR DELETE USING (created_by = auth.uid() OR public.is_admin(team_id));
