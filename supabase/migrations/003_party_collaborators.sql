-- Party collaborators: allow multiple team members to access one event (party)
create table if not exists public.party_collaborators (
    id uuid not null default gen_random_uuid() primary key,
    party_id uuid not null references public.parties on delete cascade,
    user_id uuid not null references auth.users on delete cascade,
    invited_by uuid references auth.users on delete set null,
    created_at timestamptz not null default now(),
    unique (party_id, user_id)
);

create index if not exists idx_party_collaborators_party on public.party_collaborators (party_id);
create index if not exists idx_party_collaborators_user on public.party_collaborators (user_id);

alter table public.party_collaborators enable row level security;

-- Party owners can add collaborators (owner = party's profile owner)
create policy "Party owners can insert collaborators"
    on public.party_collaborators for insert
    with check (
        party_id in (
            select p.id from public.parties p
            join public.party_profiles pp on pp.id = p.party_profile_id
            where pp.owner_id = auth.uid()
        )
    );

-- Party owners and collaborators can view the list
create policy "Owners and collaborators can view"
    on public.party_collaborators for select
    using (
        user_id = auth.uid()
        or party_id in (
            select p.id from public.parties p
            join public.party_profiles pp on pp.id = p.party_profile_id
            where pp.owner_id = auth.uid()
        )
        or party_id in (select party_id from public.party_collaborators where user_id = auth.uid())
    );

-- Party owners can remove any collaborator; collaborators can remove themselves
create policy "Owners can delete collaborators"
    on public.party_collaborators for delete
    using (
        party_id in (
            select p.id from public.parties p
            join public.party_profiles pp on pp.id = p.party_profile_id
            where pp.owner_id = auth.uid()
        )
    );

create policy "Collaborators can remove themselves"
    on public.party_collaborators for delete
    using (user_id = auth.uid());

-- Invite tokens: secure shareable links
create table if not exists public.party_invite_tokens (
    id uuid not null default gen_random_uuid() primary key,
    party_id uuid not null references public.parties on delete cascade,
    token text not null unique,
    expires_at timestamptz not null,
    created_by uuid references auth.users on delete set null,
    created_at timestamptz not null default now()
);

create index if not exists idx_party_invite_tokens_token on public.party_invite_tokens (token);

alter table public.party_invite_tokens enable row level security;

create policy "Party owners can manage invite tokens"
    on public.party_invite_tokens for all
    using (
        party_id in (
            select p.id from public.parties p
            join public.party_profiles pp on pp.id = p.party_profile_id
            where pp.owner_id = auth.uid()
        )
    );

-- Anyone authenticated can read a token by value (to redeem it) - we'll use a service role or RPC for redemption
-- For client: we need a way to redeem. Create an RPC that:
-- 1. Takes token string
-- 2. Verifies token exists and not expired
-- 3. Inserts into party_collaborators for auth.uid()
-- 4. Deletes the token (one-time use)
-- 5. Returns party_id for redirect

create or replace function public.redeem_party_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_party_id uuid;
    v_user_id uuid := auth.uid();
begin
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select party_id into v_party_id
    from public.party_invite_tokens
    where token = p_token and expires_at > now()
    limit 1;

    if v_party_id is null then
        raise exception 'Invalid or expired invite token';
    end if;

    insert into public.party_collaborators (party_id, user_id)
    values (v_party_id, v_user_id)
    on conflict (party_id, user_id) do nothing;

    delete from public.party_invite_tokens where token = p_token;

    return v_party_id;
end;
$$;

-- Allow authenticated users to call redeem
grant execute on function public.redeem_party_invite(text) to authenticated;

-- Parties: add policy so collaborators can read/update (not delete - only owner)
-- Existing policy allows owners. Add separate policies for collaborators.

create policy "Collaborators can view parties"
    on public.parties for select
    using (
        id in (select party_id from public.party_collaborators where user_id = auth.uid())
    );

create policy "Collaborators can update parties"
    on public.parties for update
    using (
        id in (select party_id from public.party_collaborators where user_id = auth.uid())
    );
