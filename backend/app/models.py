import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime

from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utcnow():
    return datetime.now(timezone.utc)


class Config(Base):
    __tablename__ = "configs"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    graph_data = Column(Text, nullable=False)  # JSON string
    toml_content = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
