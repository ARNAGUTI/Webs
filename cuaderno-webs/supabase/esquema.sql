-- Cuaderno de Webs: pega esto en Supabase → SQL Editor → New query → Run. Solo una vez.

-- 1. Una tabla para todo (clientes, movimientos, eventos, fiscal, config). Cada fila es de un usuario.
create table if not exists public.docs (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, col, id)
);
alter table public.docs enable row level security;
drop policy if exists "cada uno lo suyo" on public.docs;
create policy "cada uno lo suyo" on public.docs
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 2. Cambios en directo entre el móvil y el PC
alter table public.docs replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 3. Fotos de tickets (privadas, cada usuario en su carpeta)
insert into storage.buckets (id, name, public) values ('tickets', 'tickets', false)
  on conflict (id) do nothing;
drop policy if exists "tickets propios" on storage.objects;
create policy "tickets propios" on storage.objects
  for all to authenticated
  using (bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'tickets' and (storage.foldername(name))[1] = auth.uid()::text);
