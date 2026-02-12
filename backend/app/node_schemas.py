"""Node type schema definitions for all source/transform/sink node types."""

from __future__ import annotations

from typing import Optional

from .schemas import NodeTypeSchema, FieldSchema

NODE_SCHEMAS: list[NodeTypeSchema] = [
    # ===== SOURCE NODES =====
    NodeTypeSchema(
        node_type="kafka",
        category="source",
        label="Kafka Source",
        description="Read data from Apache Kafka topic",
        fields=[
            FieldSchema(name="brokers", type="array", required=True, default=["localhost:9092"], description="Kafka broker addresses"),
            FieldSchema(name="topic", type="string", required=True, description="Topic to consume from"),
            FieldSchema(name="group_id", type="string", required=True, description="Consumer group ID"),
            FieldSchema(name="offset_reset", type="string", required=False, default="earliest", description="Auto offset reset policy", options=["earliest", "latest"]),
        ],
    ),
    NodeTypeSchema(
        node_type="mysql",
        category="source",
        label="MySQL Source",
        description="Read data from MySQL database",
        fields=[
            FieldSchema(name="host", type="string", required=True, default="localhost", description="MySQL host"),
            FieldSchema(name="port", type="integer", required=True, default=3306, description="MySQL port"),
            FieldSchema(name="database", type="string", required=True, description="Database name"),
            FieldSchema(name="table", type="string", required=True, description="Table name"),
            FieldSchema(name="username", type="string", required=True, description="Username"),
            FieldSchema(name="password", type="string", required=True, description="Password"),
        ],
    ),
    NodeTypeSchema(
        node_type="http",
        category="source",
        label="HTTP Source",
        description="Fetch data from HTTP endpoint",
        fields=[
            FieldSchema(name="url", type="string", required=True, description="Request URL"),
            FieldSchema(name="method", type="string", required=False, default="GET", description="HTTP method", options=["GET", "POST", "PUT", "DELETE"]),
            FieldSchema(name="headers", type="object", required=False, default={}, description="HTTP headers"),
            FieldSchema(name="interval", type="integer", required=False, default=60, description="Polling interval in seconds"),
        ],
    ),
    NodeTypeSchema(
        node_type="file",
        category="source",
        label="File Source",
        description="Read data from file",
        fields=[
            FieldSchema(name="path", type="string", required=True, description="File path"),
            FieldSchema(name="format", type="string", required=True, default="csv", description="File format", options=["csv", "json", "parquet"]),
        ],
    ),
    NodeTypeSchema(
        node_type="postgres",
        category="source",
        label="PostgreSQL Source",
        description="Read data from PostgreSQL database",
        fields=[
            FieldSchema(name="host", type="string", required=True, default="localhost", description="PostgreSQL host"),
            FieldSchema(name="port", type="integer", required=True, default=5432, description="PostgreSQL port"),
            FieldSchema(name="database", type="string", required=True, description="Database name"),
            FieldSchema(name="table", type="string", required=True, description="Table name"),
            FieldSchema(name="username", type="string", required=True, description="Username"),
            FieldSchema(name="password", type="string", required=True, description="Password"),
        ],
    ),

    # ===== TRANSFORM NODES =====
    NodeTypeSchema(
        node_type="filter",
        category="transform",
        label="Filter",
        description="Filter records by condition",
        fields=[
            FieldSchema(name="condition", type="string", required=True, description="Filter condition expression"),
        ],
    ),
    NodeTypeSchema(
        node_type="map",
        category="transform",
        label="Map",
        description="Transform fields using expressions",
        fields=[
            FieldSchema(name="expression", type="string", required=True, description="Transformation expression"),
            FieldSchema(name="output_fields", type="array", required=False, default=[], description="Output field names"),
        ],
    ),
    NodeTypeSchema(
        node_type="split",
        category="transform",
        label="Split",
        description="Split a field into multiple records",
        fields=[
            FieldSchema(name="delimiter", type="string", required=True, default=",", description="Delimiter character"),
            FieldSchema(name="field", type="string", required=True, description="Field to split"),
        ],
    ),
    NodeTypeSchema(
        node_type="aggregate",
        category="transform",
        label="Aggregate",
        description="Aggregate records by group",
        fields=[
            FieldSchema(name="group_by", type="array", required=True, description="Fields to group by"),
            FieldSchema(name="function", type="string", required=True, default="count", description="Aggregation function", options=["sum", "count", "avg", "max", "min"]),
            FieldSchema(name="field", type="string", required=True, description="Field to aggregate"),
        ],
    ),
    NodeTypeSchema(
        node_type="join",
        category="transform",
        label="Join",
        description="Join two data streams",
        fields=[
            FieldSchema(name="join_type", type="string", required=True, default="inner", description="Join type", options=["inner", "left", "right", "full"]),
            FieldSchema(name="left_key", type="string", required=True, description="Left join key"),
            FieldSchema(name="right_key", type="string", required=True, description="Right join key"),
        ],
    ),

    # ===== SINK NODES =====
    NodeTypeSchema(
        node_type="kafka",
        category="sink",
        label="Kafka Sink",
        description="Write data to Kafka topic",
        fields=[
            FieldSchema(name="brokers", type="array", required=True, default=["localhost:9092"], description="Kafka broker addresses"),
            FieldSchema(name="topic", type="string", required=True, description="Topic to produce to"),
        ],
    ),
    NodeTypeSchema(
        node_type="mysql",
        category="sink",
        label="MySQL Sink",
        description="Write data to MySQL database",
        fields=[
            FieldSchema(name="host", type="string", required=True, default="localhost", description="MySQL host"),
            FieldSchema(name="port", type="integer", required=True, default=3306, description="MySQL port"),
            FieldSchema(name="database", type="string", required=True, description="Database name"),
            FieldSchema(name="table", type="string", required=True, description="Table name"),
            FieldSchema(name="username", type="string", required=True, description="Username"),
            FieldSchema(name="password", type="string", required=True, description="Password"),
        ],
    ),
    NodeTypeSchema(
        node_type="http",
        category="sink",
        label="HTTP Sink",
        description="Send data to HTTP endpoint",
        fields=[
            FieldSchema(name="url", type="string", required=True, description="Request URL"),
            FieldSchema(name="method", type="string", required=False, default="POST", description="HTTP method", options=["POST", "PUT", "PATCH"]),
            FieldSchema(name="headers", type="object", required=False, default={}, description="HTTP headers"),
        ],
    ),
    NodeTypeSchema(
        node_type="file",
        category="sink",
        label="File Sink",
        description="Write data to file",
        fields=[
            FieldSchema(name="path", type="string", required=True, description="Output file path"),
            FieldSchema(name="format", type="string", required=True, default="json", description="Output format", options=["csv", "json", "parquet"]),
        ],
    ),
    NodeTypeSchema(
        node_type="elasticsearch",
        category="sink",
        label="Elasticsearch Sink",
        description="Write data to Elasticsearch",
        fields=[
            FieldSchema(name="hosts", type="array", required=True, default=["http://localhost:9200"], description="Elasticsearch hosts"),
            FieldSchema(name="index", type="string", required=True, description="Index name"),
            FieldSchema(name="doc_type", type="string", required=False, default="_doc", description="Document type"),
        ],
    ),
    NodeTypeSchema(
        node_type="clickhouse",
        category="sink",
        label="ClickHouse Sink",
        description="Write data to ClickHouse",
        fields=[
            FieldSchema(name="host", type="string", required=True, default="localhost", description="ClickHouse host"),
            FieldSchema(name="port", type="integer", required=True, default=8123, description="ClickHouse HTTP port"),
            FieldSchema(name="database", type="string", required=True, description="Database name"),
            FieldSchema(name="table", type="string", required=True, description="Table name"),
            FieldSchema(name="username", type="string", required=False, default="default", description="Username"),
            FieldSchema(name="password", type="string", required=False, default="", description="Password"),
        ],
    ),
]


def get_all_schemas() -> list[NodeTypeSchema]:
    return NODE_SCHEMAS


def get_schemas_by_category(category: str) -> list[NodeTypeSchema]:
    return [s for s in NODE_SCHEMAS if s.category == category]


def get_schema(category: str, node_type: str) -> Optional[NodeTypeSchema]:
    for s in NODE_SCHEMAS:
        if s.category == category and s.node_type == node_type:
            return s
    return None
