-- Party events: dedicated table for event items (all attributes stored per event)
create table if not exists public.party_events (
    id text not null,
    party_id uuid not null references public.parties on delete cascade,
    name text not null default '',
    date text not null default '',
    location text not null default '',
    link text not null default '',
    notes text not null default '',
    lead_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id, party_id)
);

create index if not exists idx_party_events_party on public.party_events (party_id);

alter table public.party_events enable row level security;

-- Same access as parties: owners and collaborators
create policy "Party owners can manage events"
    on public.party_events for all
    using (
        party_id in (
            select p.id from public.parties p
            join public.party_profiles pp on pp.id = p.party_profile_id
            where pp.owner_id = auth.uid()
        )
    );

create policy "Collaborators can manage events"
    on public.party_events for all
    using (
        party_id in (select party_id from public.party_collaborators where user_id = auth.uid())
    );
