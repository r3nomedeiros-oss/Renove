-- =====================================================
-- SCHEMA COMPLETO PARA O POLYTRACK
-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor
-- =====================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Administrador', 'Operador')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for users" ON users;
CREATE POLICY "Enable all for users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Tabela de Lançamentos
CREATE TABLE IF NOT EXISTS lancamentos (
    id TEXT PRIMARY KEY,
    data DATE NOT NULL,
    turno VARCHAR(20) NOT NULL,
    hora VARCHAR(10),
    orelha_kg DECIMAL(10,2) DEFAULT 0,
    aparas_kg DECIMAL(10,2) DEFAULT 0,
    producao_total DECIMAL(10,2) DEFAULT 0,
    perdas_total DECIMAL(10,2) DEFAULT 0,
    percentual_perdas DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos(data DESC);
ALTER TABLE lancamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for lancamentos" ON lancamentos;
CREATE POLICY "Enable all for lancamentos" ON lancamentos FOR ALL USING (true) WITH CHECK (true);

-- Tabela de Itens de Lançamento
CREATE TABLE IF NOT EXISTS itens_lancamento (
    id TEXT PRIMARY KEY,
    lancamento_id TEXT NOT NULL REFERENCES lancamentos(id) ON DELETE CASCADE,
    formato VARCHAR(50) NOT NULL,
    cor VARCHAR(50) NOT NULL,
    pacote_kg DECIMAL(10,2) DEFAULT 0,
    producao_kg DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_itens_lancamento_lancamento_id ON itens_lancamento(lancamento_id);
ALTER TABLE itens_lancamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for itens_lancamento" ON itens_lancamento;
CREATE POLICY "Enable all for itens_lancamento" ON itens_lancamento FOR ALL USING (true) WITH CHECK (true);

-- Tabela de Turnos (Variáveis)
CREATE TABLE IF NOT EXISTS turnos (
    id TEXT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for turnos" ON turnos;
CREATE POLICY "Enable all for turnos" ON turnos FOR ALL USING (true) WITH CHECK (true);

-- Inserir turnos padrão
INSERT INTO turnos (id, nome, ativo) VALUES 
    (gen_random_uuid()::text, 'A', true),
    (gen_random_uuid()::text, 'B', true),
    (gen_random_uuid()::text, 'Administrativo', true)
ON CONFLICT DO NOTHING;

-- Tabela de Formatos (Variáveis)
CREATE TABLE IF NOT EXISTS formatos (
    id TEXT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE formatos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for formatos" ON formatos;
CREATE POLICY "Enable all for formatos" ON formatos FOR ALL USING (true) WITH CHECK (true);

-- Inserir formatos padrão
INSERT INTO formatos (id, nome, ativo) VALUES 
    (gen_random_uuid()::text, '30x40', true),
    (gen_random_uuid()::text, '40x50', true),
    (gen_random_uuid()::text, '50x60', true)
ON CONFLICT DO NOTHING;

-- Tabela de Cores (Variáveis)
CREATE TABLE IF NOT EXISTS cores (
    id TEXT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all for cores" ON cores;
CREATE POLICY "Enable all for cores" ON cores FOR ALL USING (true) WITH CHECK (true);

-- Inserir cores padrão
INSERT INTO cores (id, nome, ativo) VALUES 
    (gen_random_uuid()::text, 'Azul', true),
    (gen_random_uuid()::text, 'Vermelho', true),
    (gen_random_uuid()::text, 'Verde', true),
    (gen_random_uuid()::text, 'Amarelo', true),
    (gen_random_uuid()::text, 'Branco', true),
    (gen_random_uuid()::text, 'Preto', true)
ON CONFLICT DO NOTHING;

-- Tabela de Status Checks (já existente, manter)
CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for status_checks" ON status_checks;
CREATE POLICY "Enable all access for status_checks" ON status_checks FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
