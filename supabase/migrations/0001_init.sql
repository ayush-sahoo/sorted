-- Sorted — initial schema
--
-- v1 of the app reads from src/data/*.ts so it runs with zero configuration.
-- Apply this when you move to real, onboarded people. The column names match
-- the TypeScript types in src/data/types.ts so the swap is mechanical.

create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------- people

create type mind_status as enum ('draft', 'pending_consent', 'live', 'paused');

create table minds (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  headline       text not null,          -- the situation, not a job title
  city           text not null,
  languages      text[] not null default '{}',
  categories     text[] not null default '{}',
  tags           text[] not null default '{}',
  lived_it       text[] not null default '{}',
  bio            text not null,
  voice          text not null,          -- voice guidance for the system prompt
  pushes_on      text not null,
  status         mind_status not null default 'draft',

  -- consent & provenance. A mind must never go live without these.
  is_composite   boolean not null default false,
  consent_at     timestamptz,
  consent_scope  text,                   -- what they agreed to have ingested
  owner_user_id  uuid,                   -- the real person who controls this mind
  payout_account text,

  responses      integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint real_minds_need_consent
    check (status <> 'live' or is_composite or consent_at is not null)
);

create index minds_tags_idx on minds using gin (tags);
create index minds_categories_idx on minds using gin (categories);
create index minds_status_idx on minds (status);

-- ------------------------------------------------- what a mind has said

-- Stated positions, shown on the profile and fed to the model so answers
-- stay consistent with what the person actually believes.
create table perspectives (
  id           uuid primary key default gen_random_uuid(),
  mind_id      uuid not null references minds (id) on delete cascade,
  question     text not null,
  answer       text not null,
  position     integer not null default 0,
  -- optional provenance back to the source the answer was drawn from
  source_url   text,
  source_kind  text,                     -- 'podcast' | 'post' | 'video' | 'interview' | 'written'
  approved_by_mind boolean not null default false,
  created_at   timestamptz not null default now()
);

create index perspectives_mind_idx on perspectives (mind_id, position);

-- Chunks of a mind's ingested content, for retrieval at answer time.
-- 1536 dims suits most current embedding models; change to match yours.
create table mind_chunks (
  id          uuid primary key default gen_random_uuid(),
  mind_id     uuid not null references minds (id) on delete cascade,
  content     text not null,
  source_url  text,
  source_kind text,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

create index mind_chunks_mind_idx on mind_chunks (mind_id);
create index mind_chunks_embedding_idx on mind_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ---------------------------------------------------------------- panels

create table panels (
  slug       text primary key,
  title      text not null,
  subtitle   text not null,
  category   text not null,
  created_at timestamptz not null default now()
);

create table panel_minds (
  panel_slug text not null references panels (slug) on delete cascade,
  mind_id    uuid not null references minds (id) on delete cascade,
  position   integer not null default 0,
  primary key (panel_slug, mind_id)
);

-- ------------------------------------------------------- quick questions

create table questions (
  slug       text primary key,
  title      text not null,
  context    text not null default '',
  category   text not null,
  tags       text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table question_answers (
  id          uuid primary key default gen_random_uuid(),
  question_slug text not null references questions (slug) on delete cascade,
  mind_id     uuid not null references minds (id) on delete cascade,
  take        text not null,
  position    integer not null default 0,
  unique (question_slug, mind_id)
);

create index questions_tags_idx on questions using gin (tags);

-- ------------------------------------------------------ what users asked

-- Situations are the most valuable thing this product generates: they tell
-- you which Indian decisions have no one to answer them yet.
create table situations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid,
  body          text not null,
  matched_tags  text[] not null default '{}',
  matched_minds text[] not null default '{}',
  had_match     boolean not null default false,
  created_at    timestamptz not null default now()
);

create index situations_created_idx on situations (created_at desc);
create index situations_unmatched_idx on situations (created_at desc) where not had_match;

create table threads (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,
  mind_id     uuid not null references minds (id) on delete cascade,
  situation_id uuid references situations (id) on delete set null,
  created_at  timestamptz not null default now()
);

create table messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references threads (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  -- set when the mind's owner reviews an answer given in their voice
  reviewed_by_mind boolean not null default false,
  flagged    boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_thread_idx on messages (thread_id, created_at);

-- --------------------------------------------------------------- security

alter table minds            enable row level security;
alter table perspectives     enable row level security;
alter table mind_chunks      enable row level security;
alter table panels           enable row level security;
alter table panel_minds      enable row level security;
alter table questions        enable row level security;
alter table question_answers enable row level security;
alter table situations       enable row level security;
alter table threads          enable row level security;
alter table messages         enable row level security;

-- Public catalogue: anyone may read live minds and the curated content.
create policy "live minds are public" on minds
  for select using (status = 'live');

create policy "approved perspectives are public" on perspectives
  for select using (
    approved_by_mind
    and exists (select 1 from minds m where m.id = mind_id and m.status = 'live')
  );

create policy "panels are public"  on panels           for select using (true);
create policy "panel minds public" on panel_minds      for select using (true);
create policy "questions public"   on questions        for select using (true);
create policy "answers public"     on question_answers for select using (true);

-- A mind's owner manages their own mind and its content.
create policy "owners manage their mind" on minds
  for all using (owner_user_id = auth.uid());

create policy "owners manage their perspectives" on perspectives
  for all using (
    exists (select 1 from minds m where m.id = mind_id and m.owner_user_id = auth.uid())
  );

create policy "owners manage their chunks" on mind_chunks
  for all using (
    exists (select 1 from minds m where m.id = mind_id and m.owner_user_id = auth.uid())
  );

-- Conversations are private to the person who had them. Nothing here is
-- readable by the mind's owner — review happens on explicitly shared answers.
create policy "own situations" on situations for all using (user_id = auth.uid());
create policy "own threads"    on threads    for all using (user_id = auth.uid());

create policy "own messages" on messages
  for all using (
    exists (select 1 from threads t where t.id = thread_id and t.user_id = auth.uid())
  );

-- ------------------------------------------------------------- retrieval

-- Semantic search over a mind's ingested content, for the answer prompt.
create or replace function match_mind_chunks(
  p_mind_id uuid,
  p_embedding vector(1536),
  p_limit int default 6
)
returns table (content text, source_url text, similarity float)
language sql stable
set search_path = public
as $$
  select c.content,
         c.source_url,
         1 - (c.embedding <=> p_embedding) as similarity
  from mind_chunks c
  where c.mind_id = p_mind_id
    and c.embedding is not null
  order by c.embedding <=> p_embedding
  limit p_limit;
$$;
