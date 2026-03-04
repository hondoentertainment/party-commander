-- Fix infinite recursion between parties ↔ party_collaborators RLS policies.
-- Use security-definer helpers that bypass RLS to break the cycle.

-- Helper: check if the current user owns the party (via party_profiles)
create or replace function public.user_is_party_owner(p_party_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists(
        select 1 from public.parties p
        join public.party_profiles pp on pp.id = p.party_profile_id
        where p.id = p_party_id and pp.owner_id = auth.uid()
    )
$$;

-- Helper: check if the current user is a collaborator on the party
create or replace function public.user_is_party_collaborator(p_party_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
    select exists(
        select 1 from public.party_collaborators
        where party_id = p_party_id and user_id = auth.uid()
    )
$$;

-- 1. Fix parties: replace collaborator policies with helper-based versions

drop policy if exists "Collaborators can view parties" on public.parties;
create policy "Collaborators can view parties"
    on public.parties for select
    using (public.user_is_party_collaborator(id));

drop policy if exists "Collaborators can update parties" on public.parties;
create policy "Collaborators can update parties"
    on public.parties for update
    using (public.user_is_party_collaborator(id));

-- 2. Fix party_collaborators: replace policies that query parties

drop policy if exists "Party owners can insert collaborators" on public.party_collaborators;
create policy "Party owners can insert collaborators"
    on public.party_collaborators for insert
    with check (public.user_is_party_owner(party_id));

drop policy if exists "Owners and collaborators can view" on public.party_collaborators;
create policy "Owners and collaborators can view"
    on public.party_collaborators for select
    using (
        user_id = auth.uid()
        or public.user_is_party_owner(party_id)
    );

drop policy if exists "Owners can delete collaborators" on public.party_collaborators;
create policy "Owners can delete collaborators"
    on public.party_collaborators for delete
    using (public.user_is_party_owner(party_id));

-- 3. Fix party_invite_tokens: replace policy that queries parties

drop policy if exists "Party owners can manage invite tokens" on public.party_invite_tokens;
create policy "Party owners can manage invite tokens"
    on public.party_invite_tokens for all
    using (public.user_is_party_owner(party_id));

-- 4. Fix party_events: replace policies that query parties/party_collaborators

drop policy if exists "Party owners can manage events" on public.party_events;
create policy "Party owners can manage events"
    on public.party_events for all
    using (public.user_is_party_owner(party_id));

drop policy if exists "Collaborators can manage events" on public.party_events;
create policy "Collaborators can manage events"
    on public.party_events for all
    using (public.user_is_party_collaborator(party_id));
