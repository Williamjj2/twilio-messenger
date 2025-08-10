-- Supabase schema for V1-V3
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text unique not null,
  photo_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  last_message_id uuid null,
  twilio_conversation_sid text unique,
  customer_participant_sid text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null,
  receiver text not null,
  type text not null check (type in ('text','image','video','media')),
  body text,
  content_url text,
  timestamp timestamp with time zone not null default now(),
  status text,
  twilio_sid text
);

alter table public.conversations
  add constraint conversations_last_message_fk
  foreign key (last_message_id) references public.messages(id) on delete set null;

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_url text not null,
  mime_type text
);

create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.messages(id) on delete set null,
  channel text,
  payload jsonb,
  created_at timestamp with time zone default now()
);

-- Profiles (para a UI Settings)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  photo_url text,
  email text,
  twilio_phone_number text
);

-- Indexes
create index if not exists idx_contacts_phone on public.contacts (phone);
create index if not exists idx_messages_conversation on public.messages (conversation_id, timestamp desc);
create index if not exists idx_conversations_contact on public.conversations (contact_id);
create index if not exists idx_conversations_twilio_sid on public.conversations (twilio_conversation_sid);

-- RLS (example - enable and allow service role full access)
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.media enable row level security;
alter table public.notifications_log enable row level security;

-- Basic policies for anon/auth read (customize later) and service role write
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'contacts' and policyname = 'Allow read to auth'
  ) then
    create policy "Allow read to auth" on public.contacts for select to authenticated using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'conversations' and policyname = 'Allow read to auth'
  ) then
    create policy "Allow read to auth" on public.conversations for select to authenticated using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messages' and policyname = 'Allow read to auth'
  ) then
    create policy "Allow read to auth" on public.messages for select to authenticated using (true);
  end if;
end $$;

-- Service role bypasses RLS. Use service key in backend only.



