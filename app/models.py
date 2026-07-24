from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Source(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    type: str  # "rss" or "mastodon" or "other"
    url: str
    metadata: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Document(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_id: Optional[int] = Field(default=None, foreign_key="source.id")
    url: Optional[str]
    title: Optional[str]
    text: str
    raw: Optional[str]
    hash: Optional[str]
    ingest_timestamp: datetime = Field(default_factory=datetime.utcnow)

class Entity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    canonical_name: str
    type: Optional[str]  # PERSON, ORG, GPE, etc.
    aliases: Optional[str] = None

class Mention(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: Optional[int] = Field(default=None, foreign_key="document.id")
    entity_id: Optional[int] = Field(default=None, foreign_key="entity.id")
    span: Optional[str] = None
    sentence: Optional[str] = None
    confidence: Optional[float] = None
