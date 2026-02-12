"""TOML generation engine: converts graph_data (nodes + edges) into TOML configuration."""

from __future__ import annotations

import toml
from collections import defaultdict

from .schemas import GraphData, Node, Edge
from .node_schemas import get_schema


def generate_toml(graph_data: GraphData) -> str:
    """Convert graph_data (nodes + edges) into a TOML configuration string.

    The engine:
    1. Builds a topology from edges to determine data flow order
    2. Groups nodes by category (source, transform, sink)
    3. For each node, creates a TOML section with its type and config
    4. Handles multiple nodes of the same category with array-of-tables or indexed keys
    """
    nodes_by_id: dict[str, Node] = {n.id: n for n in graph_data.nodes}
    adjacency: dict[str, list[str]] = defaultdict(list)
    in_degree: dict[str, int] = defaultdict(int)

    for edge in graph_data.edges:
        adjacency[edge.source].append(edge.target)
        in_degree[edge.target] = in_degree.get(edge.target, 0) + 1
        if edge.source not in in_degree:
            in_degree[edge.source] = 0

    # Topological sort to determine processing order
    ordered_ids = _topological_sort(nodes_by_id, adjacency, in_degree)

    # Group nodes by category, preserving topological order
    category_nodes: dict[str, list[Node]] = defaultdict(list)
    for node_id in ordered_ids:
        node = nodes_by_id[node_id]
        category = node.data.category
        if category:
            category_nodes[category].append(node)

    # Build the TOML document
    doc: dict = {}
    category_order = ["source", "transform", "sink"]

    for category in category_order:
        nodes = category_nodes.get(category, [])
        if not nodes:
            continue

        if len(nodes) == 1:
            node = nodes[0]
            section = _build_node_section(node)
            doc[category] = section
        else:
            # Multiple nodes of same category: use indexed keys
            sections = []
            for node in nodes:
                section = _build_node_section(node)
                sections.append(section)
            doc[category] = sections

    return toml.dumps(doc)


def _build_node_section(node: Node) -> dict:
    """Build a TOML section dict for a single node."""
    section: dict = {}
    node_type = node.data.node_type
    if node_type:
        section["type"] = node_type

    if node.data.label:
        section["name"] = node.data.label

    config = node.data.config
    if config:
        for key, value in config.items():
            section[key] = value

    return section


def _topological_sort(
    nodes_by_id: dict[str, Node],
    adjacency: dict[str, list[str]],
    in_degree: dict[str, int],
) -> list[str]:
    """Return node IDs in topological order. Nodes not in edges are appended at the end."""
    queue = [nid for nid in nodes_by_id if in_degree.get(nid, 0) == 0]
    queue.sort()  # deterministic ordering
    ordered = []
    visited = set()

    while queue:
        nid = queue.pop(0)
        if nid not in nodes_by_id:
            continue
        ordered.append(nid)
        visited.add(nid)
        for neighbor in sorted(adjacency.get(nid, [])):
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Append any remaining unvisited nodes
    for nid in nodes_by_id:
        if nid not in visited:
            ordered.append(nid)

    return ordered


def validate_graph(graph_data: GraphData) -> list[str]:
    """Validate the graph_data and return a list of error messages."""
    errors: list[str] = []

    if not graph_data.nodes:
        errors.append("Graph must contain at least one node.")
        return errors

    nodes_by_id = {n.id: n for n in graph_data.nodes}

    # Check for duplicate node IDs
    if len(nodes_by_id) != len(graph_data.nodes):
        errors.append("Duplicate node IDs found.")

    # Check edges reference valid nodes
    for edge in graph_data.edges:
        if edge.source not in nodes_by_id:
            errors.append(f"Edge references unknown source node: {edge.source}")
        if edge.target not in nodes_by_id:
            errors.append(f"Edge references unknown target node: {edge.target}")

    # Check each node has valid category and type
    valid_categories = {"source", "transform", "sink"}
    has_source = False
    has_sink = False

    for node in graph_data.nodes:
        category = node.data.category
        node_type = node.data.node_type

        if not category:
            errors.append(f"Node '{node.id}' is missing a category.")
            continue

        if category not in valid_categories:
            errors.append(f"Node '{node.id}' has invalid category: '{category}'.")
            continue

        if category == "source":
            has_source = True
        if category == "sink":
            has_sink = True

        # Validate node type exists in schema
        schema = get_schema(category, node_type)
        if not schema:
            errors.append(f"Node '{node.id}': unknown type '{node_type}' for category '{category}'.")
            continue

        # Validate required fields
        config = node.data.config
        for field in schema.fields:
            if field.required and field.name not in config:
                errors.append(
                    f"Node '{node.id}' ({category}/{node_type}): missing required field '{field.name}'."
                )

    if not has_source:
        errors.append("Graph must contain at least one source node.")
    if not has_sink:
        errors.append("Graph must contain at least one sink node.")

    # Check for cycles
    adjacency: dict[str, list[str]] = defaultdict(list)
    for edge in graph_data.edges:
        adjacency[edge.source].append(edge.target)

    if _has_cycle(nodes_by_id, adjacency):
        errors.append("Graph contains a cycle. Data flow must be acyclic.")

    return errors


def _has_cycle(nodes_by_id: dict[str, Node], adjacency: dict[str, list[str]]) -> bool:
    """Detect cycles using DFS."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color: dict[str, int] = {nid: WHITE for nid in nodes_by_id}

    def dfs(nid: str) -> bool:
        color[nid] = GRAY
        for neighbor in adjacency.get(nid, []):
            if neighbor not in color:
                continue
            if color[neighbor] == GRAY:
                return True
            if color[neighbor] == WHITE and dfs(neighbor):
                return True
        color[nid] = BLACK
        return False

    for nid in nodes_by_id:
        if color[nid] == WHITE:
            if dfs(nid):
                return True
    return False
