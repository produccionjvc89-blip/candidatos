from mastodon import Mastodon
from sqlmodel import Session
from ..db import engine
from ..models import Source, Document
import os
import hashlib

MASTODON_BASE = os.getenv("MASTODON_BASE_URL")
MASTODON_TOKEN = os.getenv("MASTODON_ACCESS_TOKEN")

def fetch_from_account_or_hashtag(source: Source, limit=20):
    if not MASTODON_BASE or not MASTODON_TOKEN:
        raise RuntimeError("Mastodon credentials not configured")
    masto = Mastodon(
        access_token=MASTODON_TOKEN,
        api_base_url=MASTODON_BASE
    )
    # For simplicity `source.url` can encode the query: e.g. "hashtag:topic" or "acct:@user@instance"
    if source.url.startswith("hashtag:"):
        tag = source.url.split(":", 1)[1]
        timelines = masto.timeline_hashtag(tag, limit=limit)
    elif source.url.startswith("acct:"):
        acct = source.url.split(":", 1)[1]
        timelines = masto.account_statuses(masto.account_search(acct)[0]['id'], limit=limit)
    else:
        timelines = []
    new_docs = []
    with Session(engine) as session:
        for status in timelines:
            text = status.get("content") or status.get("text") or ""
            url = status.get("url")
            doc_hash = hashlib.sha256((url or text).encode("utf-8")).hexdigest()
            existing = session.exec(select(Document).where(Document.hash == doc_hash)).first()
            if existing:
                continue
            doc = Document(
                source_id=source.id,
                url=url,
                title=None,
                text=text,
                raw=str(status),
                hash=doc_hash
            )
            session.add(doc)
            session.commit()
            session.refresh(doc)
            new_docs.append(doc)
    return new_docs
