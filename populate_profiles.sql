-- SQL para popular a tabela de perfis (public.profiles)
-- Copie e cole este código no "SQL Editor" do seu Dashboard Supabase e clique em "RUN".

INSERT INTO public.profiles (id, email, name, matricula, role, sector, updated_at)
SELECT 
    au.id,
    au.email,
    d.name,
    d.matricula,
    d.role,
    d.sector,
    NOW()
FROM auth.users au
JOIN (VALUES
    ('ruan.castro@ecologfuture.com.br', 'Ruan Castro', '04', 'User', 'OpsMind'),
    ('jorge.nasser@ecologfuture.com.br', 'Jorge Nasser', '00', 'Admin', 'IdeaForge'),
    ('thiago.marins@ecologfuture.com.br', 'Thiago Marins', '03', 'User', 'FlowCapital'),
    ('rafael.santos@ecologfuture.com.br', 'Rafael Santos', '01', 'User', 'NeuroTech')
) AS d(email, name, matricula, role, sector) ON au.email = d.email
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    matricula = EXCLUDED.matricula,
    role = EXCLUDED.role,
    sector = EXCLUDED.sector,
    updated_at = EXCLUDED.updated_at;

-- Confirmação: Selecionar os perfis criados para verificar
SELECT name, email, role, sector FROM public.profiles;
