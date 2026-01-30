
ALTER TABLE tiendas 
ADD COLUMN IF NOT EXISTS ultima_conexion timestamptz;


CREATE INDEX IF NOT EXISTS idx_tiendas_ultima_conexion ON tiendas(ultima_conexion);
COMMENT ON COLUMN tiendas.ultima_conexion IS 'Fecha y hora del último latido (heartbeat) recibido desde el reproductor de la tienda';
