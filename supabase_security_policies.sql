-- Habilitar RLS nas tabelas (se ainda não estiver)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public read access services" ON public.services;
DROP POLICY IF EXISTS "Authenticated insert services" ON public.services;
DROP POLICY IF EXISTS "Authenticated update services" ON public.services;
DROP POLICY IF EXISTS "Authenticated delete services" ON public.services;

DROP POLICY IF EXISTS "Public read access donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated insert donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated delete donations" ON public.donations;

-- Políticas para Services
-- Qualquer pessoa pode ler serviços
CREATE POLICY "Public read access services"
ON public.services FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas usuários logados podem inserir
CREATE POLICY "Authenticated insert services"
ON public.services FOR INSERT
TO authenticated
WITH CHECK (true);

-- Apenas usuários logados podem atualizar
CREATE POLICY "Authenticated update services"
ON public.services FOR UPDATE
TO authenticated
USING (true);

-- Apenas usuários logados podem deletar
CREATE POLICY "Authenticated delete services"
ON public.services FOR DELETE
TO authenticated
USING (true);

-- Políticas para Donations
-- Qualquer pessoa pode ler doações
CREATE POLICY "Public read access donations"
ON public.donations FOR SELECT
TO anon, authenticated
USING (true);

-- Apenas usuários logados podem inserir
CREATE POLICY "Authenticated insert donations"
ON public.donations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Apenas usuários logados podem deletar
CREATE POLICY "Authenticated delete donations"
ON public.donations FOR DELETE
TO authenticated
USING (true);
