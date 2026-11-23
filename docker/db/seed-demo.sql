INSERT INTO "PAIS" ("NOMBRE_PAIS")
SELECT v FROM (VALUES ('Perú'),('Argentina'),('China'),('Estados Unidos'),('Brasil'),('España'),('Corea del Sur')) t(v)
WHERE NOT EXISTS (SELECT 1 FROM "PAIS" p WHERE p."NOMBRE_PAIS" = t.v);

INSERT INTO "TERMINAL" ("CODIGO_TERMINAL","NOMBRE_TERMINAL","ID_PAIS")
SELECT t.c, t.n, (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS" = t.p)
FROM (VALUES
 ('SVTI','San Vicente Terminal Internacional','Chile'),
 ('TCVAL','Terminal Cerros de Valparaíso','Chile'),
 ('ITI','Iquique Terminal Internacional','Chile'),
 ('TPA','Terminal Puerto Arica','Chile'),
 ('APMC','APM Terminals Callao','Perú'),
 ('YGSH','Yangshan Deep Water Port Shanghai','China'),
 ('NGBP','Ningbo Beilun Container Terminal','China'),
 ('PUSN','Busan New Port Terminal','Corea del Sur'),
 ('USLB','Pier T Long Beach','Estados Unidos'),
 ('ESVLC','Valencia Container Terminal','España'),
 ('BRSSZ','Santos Brasil Terminal','Brasil'),
 ('ARBUE','Terminal 4 Buenos Aires','Argentina')
) t(c,n,p)
WHERE NOT EXISTS (SELECT 1 FROM "TERMINAL" x WHERE x."CODIGO_TERMINAL" = t.c);

INSERT INTO "NAVIERA" ("NOMBRE_NAVIERA","CODIGO_NAVIERA","EMAIL","TELEFONO")
SELECT t.n,t.c,t.e,t.f
FROM (VALUES
 ('Hapag-Lloyd','HLCU','chile.operaciones@hlag.com','+56 2 2584 1200'),
 ('Ocean Network Express','ONEY','cl.customer@one-line.com','+56 2 2630 7800'),
 ('Evergreen Line','EGLV','cl.docs@evergreen-line.com','+56 2 2433 9100'),
 ('COSCO Shipping Lines','COSU','santiago@cosco.com.cl','+56 2 2362 4500'),
 ('HMM','HDMU','chile@hmm21.com','+56 2 2795 3300'),
 ('Hamburg Süd','SUDU','chile.import@hamburgsud.com','+56 2 2350 6600'),
 ('ZIM Integrated Shipping','ZIMU','chile@zim.com','+56 2 2751 4400'),
 ('Yang Ming Marine','YMLU','scl@yangming.com','+56 2 2481 5500')
) t(n,c,e,f)
WHERE NOT EXISTS (SELECT 1 FROM "NAVIERA" x WHERE x."CODIGO_NAVIERA" = t.c);

UPDATE "NAVIERA" SET "TELEFONO" = '+56 2 2899 7000' WHERE "CODIGO_NAVIERA" = 'MSC' AND "TELEFONO" IS NULL;
UPDATE "NAVIERA" SET "TELEFONO" = '+56 2 2690 9200' WHERE "CODIGO_NAVIERA" = 'MAEU' AND "TELEFONO" IS NULL;
UPDATE "NAVIERA" SET "TELEFONO" = '+56 2 2594 3100' WHERE "CODIGO_NAVIERA" = 'CMAU' AND "TELEFONO" IS NULL;

INSERT INTO "USUARIO" ("NOMBRE_USUARIO","EMAIL","PASSWORD_HASH","ROL_ID","JEFE_ID","CREACION")
SELECT 'Andrea Fuentes','andrea.fuentes@portia.cl','$2b$12$TF07SQEw7Fx5ZKPvnmuwHeiaW1L.UaMj0dZCPm8JNymzeCGtSb2bm',
       (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL"='Jefe'), NULL, NOW() - INTERVAL '60 days'
WHERE NOT EXISTS (SELECT 1 FROM "USUARIO" WHERE "EMAIL"='andrea.fuentes@portia.cl');

INSERT INTO "USUARIO" ("NOMBRE_USUARIO","EMAIL","PASSWORD_HASH","ROL_ID","JEFE_ID","CREACION")
SELECT t.n, t.e, '$2b$12$TF07SQEw7Fx5ZKPvnmuwHeiaW1L.UaMj0dZCPm8JNymzeCGtSb2bm',
       (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL"='Analista'),
       (SELECT "ID_USUARIO" FROM "USUARIO" WHERE "EMAIL"=t.j), NOW() - (t.d || ' days')::interval
FROM (VALUES
 ('Matías Contreras','matias.contreras@portia.cl','jefe@portia.cl',55),
 ('Javiera Araya','javiera.araya@portia.cl','jefe@portia.cl',48),
 ('Diego Herrera','diego.herrera@portia.cl','andrea.fuentes@portia.cl',40),
 ('Francisca Vidal','francisca.vidal@portia.cl','andrea.fuentes@portia.cl',33),
 ('Tomás Valdés','tomas.valdes@portia.cl','andrea.fuentes@portia.cl',21)
) t(n,e,j,d)
WHERE NOT EXISTS (SELECT 1 FROM "USUARIO" x WHERE x."EMAIL"=t.e);

DO $$
DECLARE
  i int;
  k int;
  analistas int[];
  nav_ids int[];
  nav_codes text[];
  term_cl int[];
  term_ext int[];
  forwarders text[] := ARRAY['Agencia Andes Logística','Transportes del Pacífico','Global Cargo SpA','Ultramar Agencia Marítima','Kuehne+Nagel Chile','DHL Global Forwarding Chile','Agunsa Logística','Sitrans Comercio Exterior','Rocha Aduanas y Logística','Agencias Universales S.A.'];
  puertos text[] := ARRAY['Puerto de San Antonio','Puerto de Valparaíso','Puerto de San Antonio','Puerto de San Vicente','Puerto de Iquique','Puerto de Arica'];
  prefijos text[] := ARRAY['TCLU','TGHU','CAIU','HLXU','OOLU','EGHU','CSNU','HDMU','TEMU','MRKU'];
  v_user int;
  v_nav int;
  v_navcode text;
  v_carga int;
  v_cont int;
  v_estado int;
  v_riesgo int;
  v_eta timestamptz;
  v_arribo timestamptz;
  v_retiro timestamptz;
  v_dem timestamptz;
  v_det timestamptz;
  v_libre_dem int;
  v_libre_det int;
  v_estado_puerto text;
  v_clima int;
  v_term_ll int;
  v_puerto text;
  v_num text;
  v_bl text;
  v_alerta int;
  v_tipo int;
  v_leida boolean;
  v_created timestamptz;
  v_jefe int;
  v_email text;
  v_desc text[];
  j int;
  h int;
  hitos_n int;
BEGIN
  SELECT array_agg("ID_USUARIO" ORDER BY "ID_USUARIO") INTO analistas
  FROM "USUARIO" WHERE "ROL_ID" = (SELECT "ID_ROL" FROM "ROLES" WHERE "NOMBRE_ROL"='Analista') AND "EMAIL" NOT LIKE 'test@%';
  SELECT array_agg("ID_NAVIERA" ORDER BY "ID_NAVIERA"), array_agg(coalesce("CODIGO_NAVIERA",'XXXX') ORDER BY "ID_NAVIERA")
  INTO nav_ids, nav_codes FROM "NAVIERA" WHERE "CODIGO_NAVIERA" <> 'TPE';
  SELECT array_agg("ID_TERMINAL" ORDER BY "ID_TERMINAL") INTO term_cl FROM "TERMINAL"
  WHERE "ID_PAIS" = (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS"='Chile');
  SELECT array_agg("ID_TERMINAL" ORDER BY "ID_TERMINAL") INTO term_ext FROM "TERMINAL"
  WHERE "ID_PAIS" <> (SELECT "ID_PAIS" FROM "PAIS" WHERE "NOMBRE_PAIS"='Chile');

  FOR i IN 1..36 LOOP
    k := i % 9;
    v_user := analistas[1 + (i % array_length(analistas,1))];
    j := 1 + (i % array_length(nav_ids,1));
    v_nav := nav_ids[j];
    v_navcode := nav_codes[j];
    v_term_ll := term_cl[1 + (i % array_length(term_cl,1))];
    v_puerto := puertos[1 + (i % array_length(puertos,1))];
    v_clima := CASE WHEN i % 7 = 0 THEN 2 WHEN i % 11 = 0 THEN 3 ELSE 1 END;
    v_libre_dem := 5 + (i % 4) * 2;
    v_libre_det := 4 + (i % 3) * 3;
    v_retiro := NULL;
    v_arribo := NULL;
    v_det := NULL;

    IF k = 0 THEN
      v_estado := 4; v_eta := NOW() + ((6 + i % 9) || ' days')::interval; v_dem := v_eta + (v_libre_dem || ' days')::interval;
      v_riesgo := 1; v_estado_puerto := 'En navegación hacia destino';
    ELSIF k = 1 THEN
      v_estado := CASE WHEN i % 2 = 0 THEN 5 ELSE 7 END; v_arribo := NOW() - INTERVAL '1 day'; v_eta := v_arribo - INTERVAL '6 hours';
      v_dem := NOW() + ((v_libre_dem - 1) || ' days')::interval + INTERVAL '4 hours';
      v_riesgo := 1; v_estado_puerto := CASE WHEN v_estado = 5 THEN 'Nave atracada, en descarga' ELSE 'En inspección SAG/Aduana' END;
    ELSIF k = 2 THEN
      v_estado := 9; v_arribo := NOW() - ((v_libre_dem - 3) || ' days')::interval; v_eta := v_arribo - INTERVAL '8 hours';
      v_dem := NOW() + ((60 + i % 30) || ' hours')::interval;
      v_riesgo := 2; v_estado_puerto := 'Disponible para retiro en terminal';
    ELSIF k = 3 THEN
      v_estado := 8; v_arribo := NOW() - ((v_libre_dem - 1) || ' days')::interval; v_eta := v_arribo - INTERVAL '5 hours';
      v_dem := NOW() + ((14 + i % 30) || ' hours')::interval;
      v_riesgo := 3; v_estado_puerto := 'Liberado por Aduana, pendiente de retiro';
    ELSIF k = 4 THEN
      v_estado := CASE WHEN i % 2 = 0 THEN 13 WHEN i % 3 = 0 THEN 15 ELSE 14 END;
      v_arribo := NOW() - ((v_libre_dem + 3 + i % 5) || ' days')::interval; v_eta := v_arribo - INTERVAL '10 hours';
      v_dem := NOW() - ((1 + i % 4) || ' days')::interval;
      v_riesgo := 4; v_estado_puerto := CASE WHEN v_estado = 15 THEN 'Retenido por fiscalización aduanera' ELSE 'Fuera de plazo para esta carga' END;
    ELSIF k = 5 THEN
      v_estado := CASE WHEN i % 4 = 1 THEN 11 ELSE 10 END; v_arribo := NOW() - ((v_libre_dem + 1) || ' days')::interval; v_eta := v_arribo - INTERVAL '7 hours';
      v_retiro := NOW() - ((1 + i % 3) || ' days')::interval; v_dem := v_retiro + INTERVAL '2 hours';
      v_det := NOW() + ((50 + i % 40) || ' hours')::interval;
      v_riesgo := 2; v_estado_puerto := 'Retirado del terminal, en tránsito a destino';
    ELSIF k = 6 THEN
      v_estado := 12; v_arribo := NOW() - ((18 + i % 6) || ' days')::interval; v_eta := v_arribo - INTERVAL '9 hours';
      v_retiro := v_arribo + INTERVAL '3 days'; v_dem := v_retiro + INTERVAL '1 hour';
      v_det := v_retiro + (v_libre_det || ' days')::interval;
      v_riesgo := 1; v_estado_puerto := 'Contenedor vacío devuelto a depósito';
    ELSIF k = 7 THEN
      v_estado := CASE WHEN i % 2 = 0 THEN 3 ELSE 1 END; v_eta := NOW() + ((12 + i % 14) || ' days')::interval; v_dem := v_eta + (v_libre_dem || ' days')::interval;
      v_riesgo := 1; v_estado_puerto := CASE WHEN v_estado = 3 THEN 'Embarcado, nave en zarpe' ELSE 'Booking confirmado' END;
    ELSE
      v_estado := CASE WHEN i % 5 = 0 THEN 16 ELSE 3 END; v_eta := NOW() + ((3 + i % 6) || ' days')::interval; v_dem := v_eta + (v_libre_dem || ' days')::interval;
      v_riesgo := CASE WHEN v_estado = 16 THEN 3 ELSE 1 END;
      v_estado_puerto := CASE WHEN v_estado = 16 THEN 'Daño reportado en inspección visual' ELSE 'En tránsito, nave en ruta' END;
      IF v_estado = 16 THEN v_arribo := NOW() - INTERVAL '2 days'; v_eta := v_arribo; v_dem := NOW() + INTERVAL '40 hours'; END IF;
    END IF;

    v_created := LEAST(COALESCE(v_arribo, v_eta), NOW()) - ((8 + i % 12) || ' days')::interval;
    IF v_created > NOW() - INTERVAL '2 days' THEN v_created := NOW() - ((2 + i % 9) || ' days')::interval; END IF;

    INSERT INTO "CARGA_DOCUMENTOS" ("USER_ID","STATUS","CREACION_FECHA","UPDATE_AT")
    VALUES (v_user, CASE WHEN i % 12 = 0 THEN 'ERROR' WHEN i % 10 = 0 THEN 'PROCESANDO' ELSE 'COMPLETO' END, v_created, v_created + INTERVAL '40 minutes')
    RETURNING "ID_CARGA_DOCUMENTOS" INTO v_carga;

    v_num := prefijos[1 + (i % array_length(prefijos,1))] || lpad(((1000000 + (i * 7919341) % 8999999))::text, 7, '0');
    v_bl := v_navcode || 'U' || lpad(((20000000 + (i * 3571309) % 79999999))::text, 8, '0');

    INSERT INTO "DOCUMENTO" ("ID_CARGA_DOCUMENTOS","TIPO_DOCUMENTO","STORAGE_URL","HUELLA_HASH","CONFIDENCE","ESTADO_EXTRACCION","DATOS_EXTRAIDOS_RAW","CONTIENE_DATOS_PERSONALES","RETENCION_HASTA","CREATE_AT")
    VALUES (v_carga,'BL','portia-documentos/' || lower(v_bl) || '_bl.pdf',
            md5(v_bl || 'bl') || md5(v_num || 'bl'),
            round((0.78 + (i % 20) * 0.01)::numeric, 2),
            CASE WHEN i % 12 = 0 THEN 'PENDIENTE' WHEN i % 6 = 0 THEN 'NEEDS_REVIEW' ELSE 'OK' END,
            jsonb_build_object('numero_bl', v_bl, 'numero_container', v_num, 'naviera', v_navcode, 'puerto_destino', v_puerto,
                               'fecha_llegada_estimada', v_eta, 'dias_libres_demurrage', v_libre_dem, 'dias_libres_detention', v_libre_det),
            true, v_created + INTERVAL '5 years', v_created);

    IF i % 3 <> 0 THEN
      INSERT INTO "DOCUMENTO" ("ID_CARGA_DOCUMENTOS","TIPO_DOCUMENTO","STORAGE_URL","HUELLA_HASH","CONFIDENCE","ESTADO_EXTRACCION","DATOS_EXTRAIDOS_RAW","CONTIENE_DATOS_PERSONALES","RETENCION_HASTA","CREATE_AT")
      VALUES (v_carga,'FACTURA','portia-documentos/' || lower(v_bl) || '_factura.pdf',
              md5(v_bl || 'fac') || md5(v_num || 'fac'),
              round((0.82 + (i % 15) * 0.01)::numeric, 2), 'OK',
              jsonb_build_object('numero_factura', 'F-' || (45000 + i * 17), 'monto_usd', 18000 + i * 1250, 'incoterm', CASE WHEN i % 2 = 0 THEN 'FOB' ELSE 'CIF' END),
              true, v_created + INTERVAL '5 years', v_created + INTERVAL '2 minutes');
    END IF;

    IF i % 4 = 0 THEN
      INSERT INTO "DOCUMENTO" ("ID_CARGA_DOCUMENTOS","TIPO_DOCUMENTO","STORAGE_URL","HUELLA_HASH","CONFIDENCE","ESTADO_EXTRACCION","DATOS_EXTRAIDOS_RAW","CONTIENE_DATOS_PERSONALES","RETENCION_HASTA","CREATE_AT")
      VALUES (v_carga,'PACKING_LIST','portia-documentos/' || lower(v_bl) || '_packing.pdf',
              md5(v_bl || 'pl') || md5(v_num || 'pl'),
              round((0.74 + (i % 18) * 0.01)::numeric, 2), CASE WHEN i % 8 = 0 THEN 'NEEDS_REVIEW' ELSE 'OK' END,
              jsonb_build_object('bultos', 20 + i * 3, 'peso_bruto_kg', 11000 + i * 310),
              false, v_created + INTERVAL '5 years', v_created + INTERVAL '3 minutes');
    END IF;

    INSERT INTO "CONTAINER" ("ID_CARGA_DOCUMENTOS","NUMERO_CONTAINER","ID_NAVIERA","PUERTO_DESTINO","NUMERO_BL","NOMBRE_FORWARDER",
      "ID_TERMINAL_ORIGEN","ID_TERMINAL_LLEGADA","FECHA_LLEGADA_ESTIMADA","DIAS_LIBRES_DEMURRAGE","DIAS_LIBRES_DETENTION",
      "FECHA_ARRIBO_REAL","FECHA_RETIRO_CONTAINER","EstadoPuerto","ID_CLIMA","DEADLINE_DEMURRAGE","DEADLINE_DETENTION",
      "ID_RIESGO","ASIGNADO_A","CREATE_AT","UPDATE_AT","ID_ESTADO")
    VALUES (v_carga, v_num, v_nav, v_puerto, v_bl, forwarders[1 + (i % array_length(forwarders,1))],
      term_ext[1 + (i % array_length(term_ext,1))], v_term_ll, v_eta, v_libre_dem, v_libre_det,
      v_arribo, v_retiro, v_estado_puerto, v_clima, v_dem, v_det,
      v_riesgo, v_user, v_created + INTERVAL '40 minutes', NOW() - ((i % 30) || ' minutes')::interval, v_estado)
    RETURNING "ID_CONTAINER" INTO v_cont;

    INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
    VALUES (v_cont, 'Datos extraídos por IA desde el BL ' || v_bl || ' (confianza 0.' || (85 + i % 14) || ', estado OK)', 'IA', NULL, v_created + INTERVAL '10 minutes');

    IF v_estado >= 3 THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Contenedor embarcado en nave, zarpe confirmado por la naviera', 'SCRAPER', NULL, v_created + INTERVAL '3 days');
    END IF;
    IF v_estado IN (5,7,8,9,10,11,12,13,14,15,16) THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Arribo de la nave a ' || v_puerto || ', contenedor descargado en terminal', 'SCRAPER', NULL, v_arribo);
    END IF;
    IF v_estado IN (7,8,9,10,11,12,13,14,15) THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, CASE WHEN v_estado = 15 THEN 'Retención por fiscalización de Aduana' ELSE 'Inspección documental completada por SAG/Aduana' END, 'SCRAPER', NULL, v_arribo + INTERVAL '10 hours');
    END IF;
    IF v_estado IN (8,9,10,11,12) THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Contenedor liberado y disponible para retiro en terminal', 'SCRAPER', NULL, v_arribo + INTERVAL '1 day');
    END IF;
    IF v_retiro IS NOT NULL THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Retiro del contenedor (gate-out) registrado por el analista', 'USUARIO', v_user, v_retiro);
    END IF;
    IF v_estado = 12 THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Devolución del contenedor vacío registrada por el analista', 'USUARIO', v_user, v_retiro + INTERVAL '2 days');
    END IF;
    IF v_estado = 16 THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, 'Daño estructural reportado, se solicita survey a la naviera', 'USUARIO', v_user, v_arribo + INTERVAL '6 hours');
    END IF;
    IF v_clima > 1 THEN
      INSERT INTO "HITO" ("ID_CONTAINER","DESCRIPCION","ORIGEN","CREADO_POR","FECHA_OCURRENCIA")
      VALUES (v_cont, CASE WHEN v_clima = 2 THEN 'Marejada en la costa central, operaciones portuarias reducidas' ELSE 'Cierre temporal de puerto por condiciones climáticas' END, 'SCRAPER', NULL, NOW() - INTERVAL '6 hours');
    END IF;

    IF v_riesgo >= 2 THEN
      v_tipo := CASE WHEN v_retiro IS NOT NULL THEN 2 ELSE 1 END;
      v_leida := (i % 3 = 0);
      INSERT INTO "ALERTA" ("ID_CONTAINER","ID_TIPO_ALERTA","ID_RIESGO","MENSAJE","LEIDA","USUARIO_LECTOR","FECHA_LECTURA","CREATE_AT")
      VALUES (v_cont, v_tipo, v_riesgo,
              'Contenedor ' || v_num || ': riesgo de ' || CASE WHEN v_tipo = 1 THEN 'DEMURRAGE' ELSE 'DETENTION' END || ' en nivel ' ||
              CASE v_riesgo WHEN 2 THEN 'WARNING' WHEN 3 THEN 'CRITICAL' ELSE 'OVERDUE' END || '.',
              v_leida, CASE WHEN v_leida THEN v_user END, CASE WHEN v_leida THEN NOW() - ((1 + i % 5) || ' hours')::interval END,
              NOW() - ((2 + i % 20) || ' hours')::interval)
      RETURNING "ID_ALERTA" INTO v_alerta;

      SELECT "EMAIL","JEFE_ID" INTO v_email, v_jefe FROM "USUARIO" WHERE "ID_USUARIO" = v_user;

      INSERT INTO "LOG_NOTIFICACION" ("ID_ALERTA","ID_CANAL","DESTINATARIO","ESTADO","APROBADO_POR","CREATE_AT")
      VALUES (v_alerta, 1, v_email,
              CASE WHEN i % 4 = 0 THEN 'PENDIENTE_APROBACION' WHEN i % 7 = 0 THEN 'RECHAZADO' ELSE 'APROBADO' END,
              CASE WHEN i % 4 = 0 THEN NULL ELSE COALESCE(v_jefe, 2) END,
              NOW() - ((1 + i % 18) || ' hours')::interval);

      IF v_riesgo >= 3 THEN
        INSERT INTO "LOG_NOTIFICACION" ("ID_ALERTA","ID_CANAL","DESTINATARIO","ESTADO","APROBADO_POR","CREATE_AT")
        VALUES (v_alerta, 2, (1000000000::bigint + i::bigint * 48271931)::text,
                CASE WHEN i % 5 = 0 THEN 'PENDIENTE_APROBACION' ELSE 'APROBADO' END,
                CASE WHEN i % 5 = 0 THEN NULL ELSE COALESCE(v_jefe, 2) END,
                NOW() - ((1 + i % 12) || ' hours')::interval);
      END IF;

      INSERT INTO "LOG_AUDITORIA" ("NOMBRE_ENTIDAD","ID_ENTIDAD","ID_ACCION","RESPONSABLE","VALORES_ANTERIORES","VALORES_NUEVOS","CREATE_AT")
      VALUES ('Alerta', v_alerta, 1, NULL, NULL,
              jsonb_build_object('IdContainer', v_cont, 'IdTipoAlerta', v_tipo, 'IdRiesgo', v_riesgo, 'Leida', false),
              NOW() - ((2 + i % 20) || ' hours')::interval);
      IF v_leida THEN
        INSERT INTO "LOG_AUDITORIA" ("NOMBRE_ENTIDAD","ID_ENTIDAD","ID_ACCION","RESPONSABLE","VALORES_ANTERIORES","VALORES_NUEVOS","CREATE_AT")
        VALUES ('Alerta', v_alerta, 2, v_user, jsonb_build_object('Leida', false), jsonb_build_object('Leida', true),
                NOW() - ((1 + i % 5) || ' hours')::interval);
      END IF;
    END IF;

    INSERT INTO "LOG_AUDITORIA" ("NOMBRE_ENTIDAD","ID_ENTIDAD","ID_ACCION","RESPONSABLE","VALORES_ANTERIORES","VALORES_NUEVOS","CREATE_AT")
    VALUES ('Container', v_cont, 1, v_user, NULL,
            jsonb_build_object('NumeroContainer', v_num, 'NumeroBl', v_bl, 'IdEstado', 1, 'IdRiesgo', 1),
            v_created + INTERVAL '40 minutes');
    IF v_estado > 1 THEN
      INSERT INTO "LOG_AUDITORIA" ("NOMBRE_ENTIDAD","ID_ENTIDAD","ID_ACCION","RESPONSABLE","VALORES_ANTERIORES","VALORES_NUEVOS","CREATE_AT")
      VALUES ('Container', v_cont, 2, v_user, jsonb_build_object('IdEstado', 1, 'IdRiesgo', 1),
              jsonb_build_object('IdEstado', v_estado, 'IdRiesgo', v_riesgo, 'EstadoPuerto', v_estado_puerto),
              NOW() - ((i % 48) || ' hours')::interval);
    END IF;
    IF i % 5 = 0 THEN
      INSERT INTO "LOG_AUDITORIA" ("NOMBRE_ENTIDAD","ID_ENTIDAD","ID_ACCION","RESPONSABLE","VALORES_ANTERIORES","VALORES_NUEVOS","CREATE_AT")
      VALUES ('Container', v_cont, 3, v_user, NULL, NULL, NOW() - ((i % 20) || ' hours')::interval);
    END IF;
  END LOOP;
END $$;
