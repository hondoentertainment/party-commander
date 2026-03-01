-- Party profiles: each user connects to one profile that owns 1-to-many parties
create table if not exists public.party_profiles (
    id uuid not null default gen_random_uuid() primary key,
    owner_id uuid not null references auth.users on delete cascade,
    name text not null default 'My Party Profile',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (owner_id)
);

alter table public.party_profiles enable row level security;

create policy "Users can view own party profile"
    on public.party_profiles for select
    using (auth.uid() = owner_id);

create policy "Users can insert own party profile"
    on public.party_profiles for insert
    with check (auth.uid() = owner_id);

create policy "Users can update own party profile"
    on public.party_profiles for update
    using (auth.uid() = owner_id);

create policy "Users can delete own party profile"
    on public.party_profiles for delete
    using (auth.uid() = owner_id);

-- Parties: each belongs to a party profile (1-to-many)
create table if not exists public.parties (
    id uuid not null default gen_random_uuid() primary key,
    party_profile_id uuid not null references public.party_profiles on delete cascade,
    name text not null default 'New Party',
    state jsonb not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_parties_party_profile on public.parties (party_profile_id);

alter table public.parties enable row level security;

create policy "Users can manage parties in own profile"
    on public.parties for all
    using (
        party_profile_id in (
            select id from public.party_profiles where owner_id = auth.uid()
        )
    );

-- Auto-create party profile when user signs up (after profiles)
create or replace function public.handle_new_user_party_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.party_profiles (owner_id, name)
    values (new.id, coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(coalesce(new.email, 'user'), '@', 1)
    ) || ' Parties');
    return new;
end;
$$;

drop trigger if exists on_auth_user_party_profile on auth.users;
create trigger on_auth_user_party_profile
    after insert on auth.users
    for each row execute procedure public.handle_new_user_party_profile();
