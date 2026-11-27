<div align="center">

# PortIA

### Sistema de Gestión de Contenedores y Alertas de Multas Portuarias

![.NET](https://img.shields.io/badge/.NET-10-512BD4)
![Angular](https://img.shields.io/badge/Angular-latest-DD0031)
![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB)

**Proyecto Capstone · Ingeniería en Informática · Duoc UC**

</div>

---

## Integrantes

| Integrante | Rol principal |
|---|---|
| **Ignacio Andrade** | Arquitectura de software, Core (.NET 10 / N-Capas), Frontend Web (Angular) e Inspector |
| **Nicolas Soto** | Frontend Web (Angular) y Core (.NET 10 / N-Capas) |
| **Airon Saez** | Agentes de Inteligencia Artificial (Python / FastAPI) |

Profesor guía: Felipe Antonio Krauss Benavente.

---

## Descripción

### ¿Qué es PortIA?

PortIA es un dashboard de control en tiempo real: el asistente que unifica el seguimiento de contenedores marítimos para encargados de Comercio Exterior. A través de un sistema de semáforos y alertas push, consolida cuatro "verdades" que hoy no coinciden entre sí; la **Documental** (lo que dice el PDF), la **Marítima** (dónde está realmente el barco), la **Portuaria** (lo que registra el terminal) y la **Administrativa** (el estado ante la Aduana) en una sola pantalla. Permite visualizar estados críticos y disparar flujos de trabajo, como la redacción de correos automáticos al agente de aduana, con un solo clic.

### ¿A quién va dirigido?

A encargados de Comercio Exterior en empresas importadoras grandes, que manejan entre 30 y 100 contenedores simultáneamente y que hoy sufren una alta carga cognitiva coordinando la logística mediante Excel, correos y WhatsApp.

### ¿Qué problema resuelve?

El ecosistema de comercio exterior chileno opera con infraestructura de datos fragmentada. La información vital está atrapada en PDFs mutantes los Bill of Lading, con formato distinto por cada naviera o en silos de los Forwarders (agentes de carga). Esta dependencia de actualizar manualmente un Excel, con cientos de acciones manuales al mes, provoca errores de desfase que se traducen en multas de **Demurrage** y **Detention**.

PortIA resuelve esto al:

- Eliminar el ojo humano del rastreo, consolidando la información extraída automáticamente por IA.
- Notificar proactivamente, con una latencia objetivo menor a 60 segundos, cuando un contenedor entra en estado crítico.
- Actuar como un puente de acción: generar y dejar lista para aprobación humana cualquier comunicación oficial (nunca se envía nada de forma autónoma).

---

## Arquitectura de la solución

PortIA está construido bajo **N-Capas** sobre .NET 10, aplicando el **Principio de Inversión de Dependencias (DIP)** y el **patrón Strategy** para aislar el núcleo de negocio de las integraciones externas más volátiles: la lectura de documentos y la conexión con los terminales portuarios.

El punto más importante de la arquitectura es la **estrategia dual de verificación portuaria**: el sistema intenta primero obtener el estado real de un contenedor mediante *web scraping* (`ScrapingStrategy`, con Playwright) contra el portal del terminal. Si esa estrategia falla el portal cambia, se cae, o bloquea la IP, un mecanismo de **Circuit Breaker** conmuta automáticamente hacia una estrategia simulada (`MockStrategy`), garantizando que el sistema nunca se detenga por la volatilidad de un tercero.

![Arquitectura de PortIA](src/Web/docs/images/arquitectura.png)

### Capas del sistema

| Capa | Responsabilidad | Tecnología |
|---|---|---|
| **Usuario** | Dashboard, notificaciones, autenticación | Angular + SignalR |
| **Servicios Core** | Casos de uso, motor de reglas de riesgo, estrategia de resiliencia | .NET 10 · N-Capas |
| **Persistencia** | Metadatos y datos estructurados / objetos binarios (PDFs) | PostgreSQL (JSONB) · Cloudflare R2 |
| **Mensajería** | Bus de eventos asíncrono entre Core y Agentes | RabbitMQ |
| **Agentes especializados** | Lectura IA de documentos, verificación portuaria | Python · FastAPI |

### Principios de diseño aplicados

- **N-Capas**: separación de responsabilidades entre Presentación (WebApi), Servicios, Inyección de Dependencias y Configuración.
- **DIP (Dependency Inversion Principle)**: el Core depende de interfaces, nunca de implementaciones concretas de terceros.
- **Strategy + Circuit Breaker**: resiliencia ante la volatilidad de servicios externos (portales portuarios).
- **Human-in-the-Loop**: ninguna comunicación externa (correos, notificaciones formales) se envía sin aprobación explícita de un usuario.
- **Privacidad por diseño**: el PDF original nunca se persiste en la base de datos relacional; solo se guardan metadatos y datos estructurados, pensando en la Ley N° 21.719 de Protección de Datos Personales (vigente en Chile desde diciembre de 2026).

### Estructura del repositorio

Todo el proyecto (código fuente y documentación) está unificado en este único repositorio. Las tres aplicaciones se comunican entre sí mediante colas de mensajería:

| Carpeta | Contenido | Tecnología principal |
|---|---|---|
| [`src/Web/`](src/Web) | Cliente web y dashboard de control | Angular |
| [`src/Core/`](src/Core) | Orquestador central: ingesta, motor de reglas, notificaciones en tiempo real | .NET 10 / C# |
| [`src/Agentes/`](src/Agentes) | Microservicios de IA: lectura de documentos e inspección portuaria | Python |
| [`maquinasVirtuales/`](maquinasVirtuales) | Dockerfiles, `docker-compose.yml` y datos de prueba para levantar todo el sistema | Docker |
| `Fase 1/`, `Fase 2/` | Documentación y evidencias del proyecto de título | Documentos |


---

## Tecnologías utilizadas

### Frontend (src/Web/)

- **Framework:** Angular
- **Tiempo real:** SignalR (WebSockets) para recibir alertas del semáforo sin recargar la página
- **UI/UX:** diseño orientado a sistema de semáforos de riesgo

### Core (src/Core/)

- **Framework:** ASP.NET Core 10
- **Lenguaje:** C#
- **Arquitectura:** N-Capas (PortIA.Core.WebApi / PortIA.Core.Services / PortIA.Core.DependencyInjection / PortIA.Core.Configuration)
- **Base de datos:** PostgreSQL

### Agentes de IA (src/Agentes/)

- **Lenguaje:** Python
- **Framework:** FastAPI
- **Modelo de IA:** DeepSeek (extracción de entidades desde documentos)
- **Automatización web:** Playwright (scraping de terminales portuarios)
- **Caché / idempotencia:** Redis

### Infraestructura y datos

- **Mensajería:** RabbitMQ (bus de eventos asíncrono)
- **Almacenamiento de objetos:** Cloudflare R2 (PDFs originales de los Bill of Lading)
- **Contenedores:** Docker y Docker Compose (desarrollo local y producción en VPS propio)
- **Base de datos relacional:** PostgreSQL (metadatos y datos extraídos, en formato JSONB)

---

## Instrucciones para ejecutar el proyecto localmente

Todo el código (Web, Core y Agentes) vive en este único repositorio. La forma recomendada de ejecutarlo es con Docker, que levanta la infraestructura y los tres proyectos con un solo comando.

### Requisitos previos

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto y en ejecución (incluye Docker Compose)
- Una API key de [OpenRouter](https://openrouter.ai/) para que el agente lector pueda extraer datos de documentos con IA (el resto del sistema funciona sin ella)
- Opcional, solo para desarrollo sin Docker: [Node.js 22](https://nodejs.org/), [.NET SDK 10](https://dotnet.microsoft.com/download) y [Python 3.11+](https://www.python.org/downloads/)

### Opción A: todo con Docker (recomendada)

**1. Clonar el repositorio**

```bash
git clone https://github.com/IgnacioAndrade1609/PortIA_Web.git
cd PortIA_Web
git checkout develop
```

**2. Crear el archivo de configuración de los agentes**

Los secretos no se suben al repositorio, por eso hay que crear tu copia local a partir de la plantilla.

```bash
cd maquinasVirtuales
cp agentes.env.example agentes.env
```

En Windows PowerShell usa `Copy-Item agentes.env.example agentes.env`.

Abre `maquinasVirtuales/agentes.env` y completa `LLM_API_KEY=` con tu key de OpenRouter.

**3. Construir y levantar todo**

Estando dentro de la carpeta `maquinasVirtuales/`:

```bash
docker compose up -d --build
```

La primera vez demora varios minutos, porque se descargan las imágenes y se instalan las dependencias de IA (PyTorch, Docling, Playwright). Las siguientes veces es mucho más rápido.

**4. Verificar que todo esté corriendo**

```bash
docker compose ps
```

Deben aparecer 7 contenedores en estado `running`:

| Servicio | Puerto local | Qué es |
|---|---|---|
| `portia-web` | `4200` | Frontend Angular servido con Nginx |
| `portia-core` | `8080` | API del Core en .NET 10 |
| `portia-agentes` | `8000` | Agentes de IA en Python (FastAPI) |
| `portia-postgres` | `5433` | Base de datos PostgreSQL |
| `portia-minio` | `9000` (API) / `9001` (consola) | Almacenamiento de objetos (simula Cloudflare R2) |
| `portia-redis` | `6379` | Caché en memoria |
| `portia-rabbitmq` | `5672` / `15672` (consola) | Bus de mensajería |

> PostgreSQL usa el puerto `5433` (no el `5432` estándar) para no chocar con instalaciones locales de PostgreSQL.

**5. Cargar los datos de prueba**

La base de datos parte vacía (el Core crea las tablas al arrancar, pero no hay usuarios). Carga los datos de desarrollo, estando en `maquinasVirtuales/`:

```bash
docker compose exec postgres psql -U portia -d portia_db -f /seeds/seed-dev.sql
docker compose exec postgres psql -U portia -d portia_db -f /seeds/seed-demo.sql
```

Si usas Git Bash en Windows, antepón `MSYS_NO_PATHCONV=1` a cada comando. Los scripts se pueden ejecutar más de una vez sin duplicar datos.

- `seed-dev.sql`: los 3 usuarios base, terminales y 3 contenedores con distintos niveles de riesgo.
- `seed-demo.sql`: datos para la demostración (más usuarios, navieras, contenedores, hitos, documentos y alertas). Cárgalo después de `seed-dev.sql`.

Usuarios de prueba (contraseña de todos: `portia123`):

| Correo | Rol |
|---|---|
| `analista@portia.cl` | Analista |
| `jefe@portia.cl` | Jefe |
| `admin@portia.cl` | Admin |

Son datos solo para desarrollo, no deben usarse en un ambiente real.

**6. Abrir la aplicación**

- **Aplicación web:** http://localhost:4200
- **API del Core (Swagger):** http://localhost:8080/swagger
- **API de Agentes (Docs):** http://localhost:8000/docs
- **Consola de MinIO:** http://localhost:9001 (usuario `portia`, contraseña `portia12345`)
- **Consola de RabbitMQ:** http://localhost:15672 (usuario `guest`, contraseña `guest`)
- **PostgreSQL:** con [DBeaver](https://dbeaver.io/) u otro cliente en `localhost:5433`, base `portia_db`, usuario `portia`, contraseña `portia123`

**Comandos útiles** (desde `maquinasVirtuales/`)

```bash
docker compose logs -f core
docker compose restart agentes
docker compose down
docker compose down -v
```

`down -v` además borra los datos de PostgreSQL y MinIO.

### Opción B: desarrollo sin Docker para cada proyecto

Levanta primero solo la infraestructura:

```bash
cd maquinasVirtuales
docker compose up -d postgres minio redis rabbitmq
```

Luego, en terminales separadas desde la raíz del repositorio:

```bash
cd src/Core
dotnet run --project PortIA.Core.WebApi
```

```bash
cd src/Agentes
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

```bash
cd src/Web
npm install
npm start
```

En Linux o macOS, el entorno virtual se activa con `source .venv/bin/activate`. El frontend en modo desarrollo queda en http://localhost:4200 y espera el Core en `http://localhost:8080`.

Para correr las pruebas:

```bash
cd src/Core && dotnet test PortIA.Core.sln
cd src/Agentes && pip install -r requirements-dev.txt && pytest
cd src/Web && npm test -- --no-watch
```

### Estructura de la carpeta maquinasVirtuales

```
maquinasVirtuales/
├── docker-compose.yml
├── agentes.env.example
├── db/
│   ├── seed-dev.sql
│   └── seed-demo.sql
├── core/Dockerfile
├── agentes/Dockerfile
└── web/
    ├── Dockerfile
    └── nginx.conf
```

---

## Metodología de trabajo del equipo

El equipo trabaja bajo **Scrum**, con **sprints de dos semanas** a lo largo de las 16 semanas del proyecto. Dentro de cada sprint, y respetando siempre los principios de Clean Architecture, se prioriza entregar una funcionalidad completa de punta a punta (dominio + aplicación + infraestructura) por sobre avanzar capa por capa, para reducir el riesgo de integrar tarde el Core con los Agentes de IA.

- **Tablero de trabajo:** GitHub Projects (Kanban), con columnas *Backlog → En progreso → En revisión → Hecho*.
- **Estrategia de ramas:**
  - `main`: rama bloqueada, nadie puede subir cambios directamente. Solo se actualiza mediante *pull request* (merge request) revisado y aprobado. Representa siempre la última versión estable, la que se presenta en el Capstone.
  - `develop`: también bloqueada, solo se actualiza mediante *pull request*. Es la versión más avanzada del proyecto, integrando lo que cada integrante va terminando; no necesariamente está 100% funcional en todo momento, pero esa es siempre la meta.
  - `feature/[nombre_rama]`: cada integrante trabaja obligatoriamente en su propia rama de funcionalidad (por ejemplo `feature/dashboard-semaforo` o `feature/scraping-strategy`), que luego se integra a `develop` mediante *pull request* revisado por al menos otro integrante del equipo.
  - `tags`: al cierre de cada sprint se crea un *tag* sobre `develop` o `main` según corresponda, como una fotografía de la última versión funcional en ese punto del proyecto. Los tags no reciben cambios directos, son solo una marca de referencia en el tiempo.
- **Entorno reproducible:** todo el stack se levanta con Docker Compose, evitando el clásico problema de "en mi máquina funciona".
- **Seguimiento con el profesor guía:** revisiones periódicas de las decisiones de arquitectura más riesgosas (por ejemplo, la estrategia de scraping vs. Mock), documentadas y usadas como insumo para ajustar el diseño en conjunto.

---

## Documentación adicional

La documentación extendida del proyecto (especificaciones de arquitectura, catálogo de casos de uso, storyboards, análisis de cumplimiento normativo) se encuentra en las carpetas `Fase 1/` y `Fase 2/` de este repositorio.

---

## Licencia

Este proyecto se distribuye con fines académicos, en el marco del proceso de Titulación de Ingeniería en Informática de Duoc UC. Está publicado bajo la licencia GPL-3.0 (ver el archivo [LICENSE](LICENSE)).
