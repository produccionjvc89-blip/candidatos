import feedparser
from sqlmodel import Session, select
from ..db import engine
from ..models import Source, Document
import hashlib
from typing import Optional

def fetch_and_store_feed(source: Source):
    feed = feedparser.parse(source.url)
    new_docs = []
    with Session(engine) as session:
        for entry in feed.entries:
            url = entry.get("link")
            title = entry.get("title", "")
            summary = entry.get("summary", "") or entry.get("description", "")
            text = (title or "") + "\n\n" + (summary or "")
            doc_hash = hashlib.sha256((url or title + text).encode("utf-8")).hexdigest()
            # check collision
            stmt = select(Document).where(Document.hash == doc_hash)
            existing = session.exec(stmt).first()
            if existing:
                continue
            doc = Document(
                source_id=source.id,
                url=url,
                title=title,
                text=text,
                raw=repr(entry),
                hash=doc_hash
            )
            session.add(doc)
            session.commit()
            session.refresh(doc)
            new_docs.append(doc)
    return new_docs

def trigger_rss_by_id(source_id: int):
    with Session(engine) as session:
        src = session.get(Source, source_id)
        if not src:
            raise ValueError("Source not found")
        return fetch_and_store_feed(src)
