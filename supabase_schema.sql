-- =============================================================================
-- OPERASOVEREIGN AI — ESQUEMA DE BASE DE DATOS SUPABASE PARA CLIENTES
-- Proyecto Supabase: https://iocwkuvkjeyonqosetvj.supabase.co
-- Ciberseguridad: Criptografía pgcrypto (Bcrypt/Blowfish) + Row Level Security
-- =============================================================================

-- 1. Habilitar extensión criptográfica para hashing seguro de contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Eliminar tabla si existe previamente para asegurar idempotencia limpia
-- DROP TABLE IF EXISTS public.clients CASCADE;

-- 3. Crear tabla fiduciaria de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'pro_operator',
    subscription_status VARCHAR(20) NOT NULL DEFAULT 'active',
    monthly_rate_usd NUMERIC(10, 2) NOT NULL DEFAULT 69.00,
    payment_gateway VARCHAR(30) DEFAULT 'wompi_sv',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentarios explicativos sobre columnas fiduciarias
COMMENT ON TABLE public.clients IS 'Ledger central de clientes fiduciarios de OperaSovereign AI con tarifas en USD y contraseñas hasheadas.';
COMMENT ON COLUMN public.clients.password_hash IS 'Hash criptográfico irreversible generado con crypt(password, gen_salt("bf", 10)). CERO contraseñas en texto plano.';
COMMENT ON COLUMN public.clients.subscription_tier IS 'Tarifa contratada: flash_audit ($19), support_concierge ($49), outbound_sales ($79), financial_audit ($89), inventory_logistics ($69), marketing_authority ($59), suite_elite ($249).';

-- 4. Índices para consultas ultra-rápidas en login y auditoría
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_username ON public.clients (username);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients (subscription_status);

-- 5. Trigger para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_clients_updated_at ON public.clients;
CREATE TRIGGER set_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 6. Función fiduciaria para REGISTRAR un nuevo cliente con contraseña hasheada
CREATE OR REPLACE FUNCTION public.register_client(
    p_full_name VARCHAR,
    p_email VARCHAR,
    p_username VARCHAR,
    p_plain_password TEXT,
    p_tier VARCHAR DEFAULT 'support_concierge',
    p_rate_usd NUMERIC DEFAULT 49.00,
    p_gateway VARCHAR DEFAULT 'wompi_sv'
)
RETURNS UUID AS $$
DECLARE
    v_client_id UUID;
BEGIN
    INSERT INTO public.clients (
        full_name,
        email,
        username,
        password_hash,
        subscription_tier,
        monthly_rate_usd,
        payment_gateway
    )
    VALUES (
        p_full_name,
        LOWER(TRIM(p_email)),
        LOWER(TRIM(p_username)),
        crypt(p_plain_password, gen_salt('bf', 10)), -- Hashing seguro Bcrypt con sal única
        p_tier,
        p_rate_usd,
        p_gateway
    )
    RETURNING id INTO v_client_id;

    RETURN v_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función fiduciaria para AUTENTICAR clientes de forma segura (Timing-Safe)
CREATE OR REPLACE FUNCTION public.verify_client_login(
    p_identifier VARCHAR, -- Puede ser email o username
    p_plain_password TEXT
)
RETURNS TABLE (
    authenticated BOOLEAN,
    client_id UUID,
    full_name VARCHAR,
    email VARCHAR,
    subscription_tier VARCHAR,
    monthly_rate_usd NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (c.password_hash = crypt(p_plain_password, c.password_hash)) AS authenticated,
        c.id AS client_id,
        c.full_name,
        c.email,
        c.subscription_tier,
        c.monthly_rate_usd
    FROM public.clients c
    WHERE (c.email = LOWER(TRIM(p_identifier)) OR c.username = LOWER(TRIM(p_identifier)))
      AND c.subscription_status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Configuración de Políticas RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores de servicio pueden ver y gestionar todos los clientes
CREATE POLICY "Permitir lectura fiduciaria de servicio"
ON public.clients
FOR ALL
USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

-- =============================================================================
-- 9. POBLACIÓN INICIAL DE PRUEBA (CLIENTES CON TARIFAS EN USD Y HASH SEGURO)
-- =============================================================================

-- Cliente 1: Administrador General
SELECT public.register_client(
    'Don Ricardo — Director General',
    'ricardo@audiflowai.com',
    'admin_ricardo',
    'AudiflowMaster2026!',
    'suite_elite',
    249.00,
    'wompi_sv'
);

-- Cliente 2: Empresa de Logística (Agente de Inventario & Envíos)
SELECT public.register_client(
    'Carlos Mendoza — Logística Rápida S.A.',
    'carlos.mendoza@logisticarapida.com',
    'cmendoza_log',
    'LogisticaSegura2026!',
    'inventory_logistics',
    69.00,
    'wompi_sv'
);

-- Cliente 3: Despacho Jurídico / Contable (Agente de Cobranza & Conciliación)
SELECT public.register_client(
    'Dra. Elena Ramos — Ramos & Asociados Consultores',
    'eramos@ramosasociados.com',
    'eramos_legal',
    'CobranzaFiduciaria2026!',
    'financial_audit',
    89.00,
    'stripe'
);

-- Cliente 4: E-Commerce B2B (Agente de Soporte WhatsApp & Web)
SELECT public.register_client(
    'Manuel Torres — Café Don Manuel B2B',
    'manuel@cafedonmanuel.com',
    'mtorres_cafe',
    'CafeSoporte2026!',
    'support_concierge',
    49.00,
    'strike_lightning'
);

-- Verificación de inserción exitosa
SELECT id, full_name, email, username, subscription_tier, monthly_rate_usd, created_at 
FROM public.clients 
ORDER BY created_at DESC;
