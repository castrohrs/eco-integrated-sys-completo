-- 1. Cria a tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name text,
    phone text,
    matricula text,
    role text,
    sector text,
    photo_url text,
    appearance jsonb,
    language text,
    email text,
    updated_at timestamptz
);

-- 2. Habilita segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Cria políticas de acesso (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all access for all users' AND tablename = 'profiles') THEN
        CREATE POLICY "Enable all access for all users" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Insere ou Atualiza os perfis com base nos usuários do Auth
INSERT INTO public.profiles (id, email, name, matricula, role, sector, updated_at)
SELECT 
    au.id,
    au.email,
    -- Mapeamento de Nomes
    CASE 
        WHEN au.email = 'ruan.castro@ecologfuture.com.br' THEN 'Ruan Castro'
        WHEN au.email = 'jorge.nasser@ecologfuture.com.br' THEN 'Jorge Nasser'
        WHEN au.email = 'thiago.marins@ecologfuture.com.br' THEN 'Thiago Marins'
        WHEN au.email = 'rafael.santos@ecologfuture.com.br' THEN 'Rafael Santos'
        ELSE 'Usuário'
    END,
    -- Mapeamento de Matrículas
    CASE 
        WHEN au.email = 'ruan.castro@ecologfuture.com.br' THEN '04'
        WHEN au.email = 'jorge.nasser@ecologfuture.com.br' THEN '00'
        WHEN au.email = 'thiago.marins@ecologfuture.com.br' THEN '03'
        WHEN au.email = 'rafael.santos@ecologfuture.com.br' THEN '01'
        ELSE '0000'
    END,
    -- Mapeamento de Roles
    CASE 
        WHEN au.email = 'jorge.nasser@ecologfuture.com.br' THEN 'Admin'
        ELSE 'User'
    END,
    -- Mapeamento de Setores
    CASE 
        WHEN au.email = 'ruan.castro@ecologfuture.com.br' THEN 'OpsMind'
        WHEN au.email = 'jorge.nasser@ecologfuture.com.br' THEN 'IdeaForge'
        WHEN au.email = 'thiago.marins@ecologfuture.com.br' THEN 'FlowCapital'
        WHEN au.email = 'rafael.santos@ecologfuture.com.br' THEN 'NeuroTech'
        ELSE 'Geral'
    END,
    NOW()
FROM auth.users au
WHERE au.email IN (
    'ruan.castro@ecologfuture.com.br',
    'jorge.nasser@ecologfuture.com.br',
    'thiago.marins@ecologfuture.com.br',
    'rafael.santos@ecologfuture.com.br'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    matricula = EXCLUDED.matricula,
    role = EXCLUDED.role,
    sector = EXCLUDED.sector,
    updated_at = EXCLUDED.updated_at;

-- 5. Mostra o resultado
SELECT * FROM public.profiles;
