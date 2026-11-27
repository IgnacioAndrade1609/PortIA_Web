-- ============================================================
-- PortIA — seed-dev.sql
-- Datos de desarrollo: usuarios de prueba (Analista/Jefe/Admin)
-- + 3 contenedores con distintos niveles de riesgo.
--
-- Requiere que el Core ya haya aplicado sus migraciones de EF Core
-- (las corre solo al arrancar, vía db.Database.Migrate() en Program.cs).
-- Esas migraciones son hoy la fuente de verdad del esquema, no modelo.sql:
-- ya seedean ROLES como 'Analista' | 'Jefe' | 'Admin' (decisión abierta #5
-- del contexto maestro, ya resuelta en el código, pendiente de reflejar
-- en el documento). TERMINAL no viene seedeada por EF Core, por eso este
-- script la inserta.
--
-- Importante: EF Core (Npgsql) crea todas las tablas y columnas con
-- identificadores entre comillas dobles para preservar MAYÚSCULAS, lo que
-- las vuelve case-sensitive en Postgres. Por eso todo este script usa
-- "TABLA"/"COLUMNA" entre comillas — sin comillas, Postgres los interpreta
-- en minúsculas y el script falla con "relation ... does not exist".
-- ============================================================

-- Password real: "portia123" (BCrypt, factor 12) — mismo hash para los 3,
-- es dato de desarrollo, nunca usar en un ambiente real.
INSERT INTO "USUARIO" ("NOMBRE_USUARIO", "EMAIL", "PASSWORD_HASH", "ROL_ID")
SELECT 'Camila Rojas', 'analista@portia.cl',
       '$2b$12$TF07SQEw7Fx5ZKPvnmuwHeiaW1L.UaMj0dZCPm8JNymzeCGtSb2bm',
       (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL" = 'Analista')
WHERE NOT EXISTS (SELECT 1 FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl');

INSERT INTO "USUARIO" ("NOMBRE_USUARIO", "EMAIL", "PASSWORD_HASH", "ROL_ID")
SELECT 'Felipe Soto', 'jefe@portia.cl',
       '$2b$12$TF07SQEw7Fx5ZKPvnmuwHeiaW1L.UaMj0dZCPm8JNymzeCGtSb2bm',
       (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL" = 'Jefe')
WHERE NOT EXISTS (SELECT 1 FROM "USUARIO" WHERE "EMAIL" = 'jefe@portia.cl');

INSERT INTO "USUARIO" ("NOMBRE_USUARIO", "EMAIL", "PASSWORD_HASH", "ROL_ID")
SELECT 'Valentina Muñoz', 'admin@portia.cl',
       '$2b$12$TF07SQEw7Fx5ZKPvnmuwHeiaW1L.UaMj0dZCPm8JNymzeCGtSb2bm',
       (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL" = 'Admin')
WHERE NOT EXISTS (SELECT 1 FROM "USUARIO" WHERE "EMAIL" = 'admin@portia.cl');

INSERT INTO "NAVIERA" ("NOMBRE_NAVIERA", "CODIGO_NAVIERA", "EMAIL")
SELECT 'MSC', 'MSC', 'contacto@msc.com'
WHERE NOT EXISTS (SELECT 1 FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'MSC');

INSERT INTO "NAVIERA" ("NOMBRE_NAVIERA", "CODIGO_NAVIERA", "EMAIL")
SELECT 'Maersk', 'MAEU', 'contacto@maersk.com'
WHERE NOT EXISTS (SELECT 1 FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'MAEU');

INSERT INTO "NAVIERA" ("NOMBRE_NAVIERA", "CODIGO_NAVIERA", "EMAIL")
SELECT 'CMA CGM', 'CMAU', 'contacto@cma-cgm.com'
WHERE NOT EXISTS (SELECT 1 FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'CMAU');

INSERT INTO "TERMINAL" ("CODIGO_TERMINAL", "NOMBRE_TERMINAL", "ID_PAIS")
SELECT 'STI', 'San Antonio Terminal Internacional', (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS" = 'Chile')
WHERE NOT EXISTS (SELECT 1 FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'STI');

INSERT INTO "TERMINAL" ("CODIGO_TERMINAL", "NOMBRE_TERMINAL", "ID_PAIS")
SELECT 'TPS', 'Terminal Pacífico Sur Valparaíso', (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS" = 'Chile')
WHERE NOT EXISTS (SELECT 1 FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'TPS');

INSERT INTO "TERMINAL" ("CODIGO_TERMINAL", "NOMBRE_TERMINAL", "ID_PAIS")
SELECT 'DPW', 'DP World San Antonio', (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS" = 'Chile')
WHERE NOT EXISTS (SELECT 1 FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'DPW');

-- Carga de documentos "contenedora" para los 3 contenedores de prueba
INSERT INTO "CARGA_DOCUMENTOS" ("USER_ID", "STATUS")
SELECT (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl'), 'COMPLETO'
WHERE NOT EXISTS (
  SELECT 1 FROM "CARGA_DOCUMENTOS" cd
  JOIN "CONTAINER" c ON c."ID_CARGA_DOCUMENTOS" = cd."ID_CARGA_DOCUMENTOS"
  WHERE c."NUMERO_CONTAINER" = 'MSCU1234567'
);

-- Contenedor 1: OK (sin apremio, dentro de los días libres)
INSERT INTO "CONTAINER" (
  "ID_CARGA_DOCUMENTOS", "NUMERO_CONTAINER", "ID_NAVIERA", "PUERTO_DESTINO", "NUMERO_BL", "NOMBRE_FORWARDER",
  "ID_TERMINAL_ORIGEN", "ID_TERMINAL_LLEGADA", "FECHA_LLEGADA_ESTIMADA",
  "DIAS_LIBRES_DEMURRAGE", "DIAS_LIBRES_DETENTION", "DEADLINE_DEMURRAGE", "DEADLINE_DETENTION",
  "ID_RIESGO", "ASIGNADO_A"
)
SELECT
  (SELECT "ID_CARGA_DOCUMENTOS" FROM "CARGA_DOCUMENTOS" ORDER BY "ID_CARGA_DOCUMENTOS" DESC LIMIT 1),
  'MSCU1234567',
  (SELECT "ID_NAVIERA" FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'MSC'),
  'Puerto de Valparaíso', 'BL-MSC-00123', 'Agencia Andes Logística',
  NULL, (SELECT "ID_TERMINAL" FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'STI'),
  NOW() + INTERVAL '3 days',
  7, 5,
  NOW() + INTERVAL '18 days', NOW() + INTERVAL '23 days',
  (SELECT "ID_RIESGO" FROM "RIESGO" WHERE "DESCRIPCION" = 'OK'),
  (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl')
WHERE NOT EXISTS (SELECT 1 FROM "CONTAINER" WHERE "NUMERO_CONTAINER" = 'MSCU1234567');

-- Carga de documentos para el contenedor 2
INSERT INTO "CARGA_DOCUMENTOS" ("USER_ID", "STATUS")
SELECT (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl'), 'COMPLETO'
WHERE NOT EXISTS (
  SELECT 1 FROM "CARGA_DOCUMENTOS" cd
  JOIN "CONTAINER" c ON c."ID_CARGA_DOCUMENTOS" = cd."ID_CARGA_DOCUMENTOS"
  WHERE c."NUMERO_CONTAINER" = 'MAEU7654321'
);

-- Contenedor 2: CRITICAL (< 48 h para el deadline de demurrage)
INSERT INTO "CONTAINER" (
  "ID_CARGA_DOCUMENTOS", "NUMERO_CONTAINER", "ID_NAVIERA", "PUERTO_DESTINO", "NUMERO_BL", "NOMBRE_FORWARDER",
  "ID_TERMINAL_ORIGEN", "ID_TERMINAL_LLEGADA", "FECHA_LLEGADA_ESTIMADA",
  "DIAS_LIBRES_DEMURRAGE", "DIAS_LIBRES_DETENTION", "FECHA_ARRIBO_REAL", "EstadoPuerto",
  "DEADLINE_DEMURRAGE", "DEADLINE_DETENTION", "ID_RIESGO", "ASIGNADO_A"
)
SELECT
  (SELECT "ID_CARGA_DOCUMENTOS" FROM "CARGA_DOCUMENTOS" ORDER BY "ID_CARGA_DOCUMENTOS" DESC LIMIT 1),
  'MAEU7654321',
  (SELECT "ID_NAVIERA" FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'MAEU'),
  'Puerto de San Antonio', 'BL-MAE-00987', 'Transportes del Pacífico',
  NULL, (SELECT "ID_TERMINAL" FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'TPS'),
  NOW() - INTERVAL '1 day',
  3, 3, NOW() - INTERVAL '1 day', 'En puerto',
  NOW() + INTERVAL '30 hours', NOW() + INTERVAL '54 hours',
  (SELECT "ID_RIESGO" FROM "RIESGO" WHERE "DESCRIPCION" = 'CRITICAL'),
  (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl')
WHERE NOT EXISTS (SELECT 1 FROM "CONTAINER" WHERE "NUMERO_CONTAINER" = 'MAEU7654321');

-- Carga de documentos para el contenedor 3
INSERT INTO "CARGA_DOCUMENTOS" ("USER_ID", "STATUS")
SELECT (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl'), 'COMPLETO'
WHERE NOT EXISTS (
  SELECT 1 FROM "CARGA_DOCUMENTOS" cd
  JOIN "CONTAINER" c ON c."ID_CARGA_DOCUMENTOS" = cd."ID_CARGA_DOCUMENTOS"
  WHERE c."NUMERO_CONTAINER" = 'CMAU4455667'
);

-- Contenedor 3: OVERDUE (deadline de demurrage ya vencido)
INSERT INTO "CONTAINER" (
  "ID_CARGA_DOCUMENTOS", "NUMERO_CONTAINER", "ID_NAVIERA", "PUERTO_DESTINO", "NUMERO_BL", "NOMBRE_FORWARDER",
  "ID_TERMINAL_ORIGEN", "ID_TERMINAL_LLEGADA", "FECHA_LLEGADA_ESTIMADA",
  "DIAS_LIBRES_DEMURRAGE", "DIAS_LIBRES_DETENTION", "FECHA_ARRIBO_REAL", "EstadoPuerto",
  "DEADLINE_DEMURRAGE", "DEADLINE_DETENTION", "ID_RIESGO", "ASIGNADO_A"
)
SELECT
  (SELECT "ID_CARGA_DOCUMENTOS" FROM "CARGA_DOCUMENTOS" ORDER BY "ID_CARGA_DOCUMENTOS" DESC LIMIT 1),
  'CMAU4455667',
  (SELECT "ID_NAVIERA" FROM "NAVIERA" WHERE "CODIGO_NAVIERA" = 'CMAU'),
  'Puerto del Callao', 'BL-CMA-00456', 'Global Cargo SpA',
  NULL, (SELECT "ID_TERMINAL" FROM "TERMINAL" WHERE "CODIGO_TERMINAL" = 'DPW'),
  NOW() - INTERVAL '10 days',
  4, 4, NOW() - INTERVAL '10 days', 'Mantenimiento aduanero',
  NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 days',
  (SELECT "ID_RIESGO" FROM "RIESGO" WHERE "DESCRIPCION" = 'OVERDUE'),
  (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL" = 'analista@portia.cl')
WHERE NOT EXISTS (SELECT 1 FROM "CONTAINER" WHERE "NUMERO_CONTAINER" = 'CMAU4455667');
