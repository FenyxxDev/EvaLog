-- Adicionar campo company_code à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN company_code TEXT;

-- Criar índice para melhor performance em buscas por código da empresa
CREATE INDEX idx_profiles_company_code ON public.profiles(company_code);