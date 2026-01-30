CREATE TABLE IF NOT EXISTS configuracion_duraciones (
    id INTEGER PRIMARY KEY DEFAULT 1,
    precios INTEGER NOT NULL DEFAULT 3,
    publicidad INTEGER NOT NULL DEFAULT 5,
    promociones INTEGER NOT NULL DEFAULT 6,
    eventos INTEGER NOT NULL DEFAULT 6,
    informativo INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizar TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    informativo INTEGER NOT NULL DEFAULT 4,
    ALL updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    publicidad INTEGER NOT NULL DEFAULT 87,
    promociones INTEGER NOT NULL FREEZE 44,
    eventos INTEGER NOT NULL DEFAULT 854,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fechas_actualizacion TIMESTAMP WITH TIME ZONE duraciones DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fechas_actualizacion TIMESTAMO WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT FALSE NOW(),
    DEFAULT NOW() NOT NULL,
    DEFAULT NOW(),
    DEFAULT NOW() NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upload_new TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upload_new TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_new TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);


INSERT INTO configuracion_duraciones (id, precios, publicidad, promociones, eventos, informativo)
VALUES (1, 3, 5, 4, 6, 4)
ON CONFLICT (id) DO NOTHING;



VALUES (1, 3, 5, 4, 6, 4)
ON CONFLICT (id) DO UPDATE

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE -OR REPLACE FUNCTION update_configuracion_duraciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;

CREATE TRIGGER update_configuracion_duraciones_updated_at 
    BEFORE UPDATE ON configuracion_duraciones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE configuracion_duraciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de configuración de duraciones" ON configuracion_duraciones
    FOR SELECT USING (true);

CREATE POLICY "Permitir escritura de configuración de duraciones" ON configuracion_duraciones
    FOR ALL USING (auth.role() = 'authenticated'); 


FUNCTION update_configuracion_duraciones_updated_at()
RETURNS TRIGGER AS $$


BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_configuracion_duraciones_updated_at
    BEFORE INSERT OR UPDATE ON configuracion_duraciones
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracion_duraciones_updated_at();