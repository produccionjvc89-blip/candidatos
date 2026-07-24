from fastapi import FastAPI, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from .db import init_db, engine
from .models import Source, Document, Entity
from .ingest.rss_ingest import trigger_rss_by_id, fetch_and_store_feed
from .nlp.pipeline import process_document_and_store
from typing import List
import uvicorn

app = FastAPI(title="Ingestor público - MVP")
@app.on_event("startup")
def on_startup():
    init_db()

# Sources
@app.post("/sources/", response_model=dict)
def create_source(payload: dict):
    with Session(engine) as session:
        src = Source(name=payload.get("name"), type=payload.get("type"), url=payload.get("url"), metadata=payload.get("metadata"))
        session.add(src)
        session.commit()
        session.refresh(src)
        return {"id": src.id, "name": src.name}

@app.get("/sources/", response_model=List[dict])
def list_sources():
    with Session(engine) as session:
        res = session.exec(select(Source)).all()
        return [{"id": s.id, "name": s.name, "type": s.type, "url": s.url} for s in res]

# Trigger ingest
@app.post("/ingest/{source_id}/trigger")
def ingest_source(source_id: int, background_tasks: BackgroundTasks):
    with Session(engine) as session:
        src = session.get(Source, source_id)
        if not src:
            raise HTTPException(status_code=404, detail="Source not found")
    # Run ingestion in background and process NLP for each new doc
    def run_ingest_and_nlp(src_id: int):
        from .ingest.rss_ingest import fetch_and_store_feed
        from .ingest.mastodon_ingest import fetch_from_account_or_hashtag
        from sqlmodel import Session
        from .db import engine
        with Session(engine) as session:
            s = session.get(Source, src_id)
            if s.type == "rss":
                new_docs = fetch_and_store_feed(s)
            elif s.type == "mastodon":
                new_docs = fetch_from_account_or_hashtag(s)
            else:
                new_docs = []
            # Process NLP
            for d in new_docs:
                process_document_and_store(d)
    background_tasks.add_task(run_ingest_and_nlp, source_id)
    return {"status": "ingest scheduled"}

# Documents
@app.get("/documents/", response_model=List[dict])
def get_documents(limit: int = 50):
    with Session(engine) as session:
        docs = session.exec(select(Document).limit(limit)).all()
        return [{"id": d.id, "title": d.title, "url": d.url, "text": d.text[:500]} for d in docs]

# Entities
@app.get("/entities/", response_model=List[dict])
def get_entities(limit: int = 100):
    with Session(engine) as session:
        ents = session.exec(select(Entity).limit(limit)).all()
        return [{"id": e.id, "name": e.canonical_name, "type": e.type} for e in ents]

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
