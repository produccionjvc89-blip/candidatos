import spacy
from typing import List, Dict
from sqlmodel import Session, select
from .models import Document, Entity, Mention
from .db import engine

# Carga spaCy (modelo en_core_web_sm por defecto)
nlp = spacy.load("en_core_web_sm")

def process_document_and_store(document: Document):
    """
    Procesa el texto de un documento (Document) con spaCy, extrae entidades
    y las guarda en tablas Entity y Mention.
    """
    doc = nlp(document.text)
    with Session(engine) as session:
        for ent in doc.ents:
            # Buscamos entidad existente por canonical_name (simple)
            stmt = select(Entity).where(Entity.canonical_name == ent.text)
            existing = session.exec(stmt).first()
            if not existing:
                existing = Entity(canonical_name=ent.text, type=ent.label_)
                session.add(existing)
                session.commit()
                session.refresh(existing)
            mention = Mention(
                document_id=document.id,
                entity_id=existing.id,
                span=ent.text,
                sentence=ent.sent.text,
                confidence=None
            )
            session.add(mention)
        session.commit()
