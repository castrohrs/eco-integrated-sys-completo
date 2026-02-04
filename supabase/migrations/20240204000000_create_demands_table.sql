-- Create Demands table
create table if not exists demands (
  id text primary key,
  client text,
  service text,
  status text,
  date text,
  contact text,
  setor text,
  urgencia text,
  prazo text,
  responsavel text,
  email_aviso text,
  cel_aviso text,
  photos jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table demands enable row level security;

-- Policy
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Enable all access for all users' and tablename = 'demands') then
    create policy "Enable all access for all users" on demands for all using (true) with check (true);
  end if;
end $$;
