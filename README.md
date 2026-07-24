# Plataforma neutral de ingestión pública (MVP)

Descripción
- Proyecto neutral para ingestión de fuentes públicas (RSS, Mastodon), extracción de entidades con spaCy y API para consulta.
- No está diseñado para targeting o persuasión; solo para investigación pública y fichas verificables.

Requisitos
- Docker, docker-compose (recomendado) o Python 3.10+ con Postgres
- En entornos gestionados (IA Studio) configura variables de entorno con .env

Archivos principales
- app/main.py — FastAPI app y rutas
- app/models.py — modelos SQLModel (DB)
- app/db.py — inicialización DB
- app/ingest/rss_ingest.py — ingestor RSS
- app/ingest/mastodon_ingest.py — ingestor Mastodon (opcional)
- app/nlp/pipeline.py — pipeline spaCy
- docker-compose.yml & Dockerfile
- .env.example

Instrucciones rápidas (docker-compose)
1. Copia `.env.example` a `.env` y ajusta variables.
2. docker-compose up --build
3. Accede a: http://localhost:8000/docs para ver la API OpenAPI

Endpoints útiles (FastAPI)
- POST /sources/ — registrar una fuente (type: rss|mastodon)
- POST /ingest/{source_id}/trigger — dispara ingestión manual
- GET /documents/ — lista documentos
- GET /entities/ — lista entidades reconocidas
- GET /health

Agregar APIs/credenciales
- Para Mastodon, añade `MASTODON_BASE_URL`, `MASTODON_ACCESS_TOKEN` a `.env`.
- Para integrar otras APIs públicas, crea un nuevo ingestor en `app/ingest/` y añade su registro como source.

Notas
- Este es un MVP: agregar control humano, pruebas de sesgo, logging inmutable y política de privacidad antes de publicar datos.
