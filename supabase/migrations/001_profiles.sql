-- Profiles table for extended user data
create table if not exists public.profiles (
    id uuid not null references auth.users on delete cascade,
    display_name text,
    avatar_url text,
    updated_at timestamptz not null default now(),
    primary key (id)
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- Auto-create profile on signup (supports Google avatar/name from metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.profiles (id, display_name, avatar_url)
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            split_part(new.email, '@', 1)
        ),
        new.raw_user_meta_data ->> 'avatar_url'
    );
    return new;
end;
$$;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
