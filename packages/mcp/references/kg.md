# Knowledge Graph Verbs

4 verbs for typed entities and relationships across arbitrary domains. Nodes are deduplicated on `(type, name, scope)` with lowercase+trim normalization. Edges are deduplicated on `(subject_id, predicate, object_id, scope)`. Neighborhood traversal uses recursive CTE with depth 0–2 (default 1) and a server-enforced `max_tokens` budget.

## kg.upsert_node

Create or update a typed node. Repeating the same `(type, name, scope)` returns the existing node id.

```json
{
  "type": "Person",
  "name": "Alice",
  "props": {"role": "engineer", "team": "platform"}
}
```

Normalization: `type` and `name` are lowercased and trimmed before deduplication. Props are shallow-merged on conflict (new keys override existing; existing keys not in the payload are kept).

Response: `KgNodeDto` with `{id, type, name, props, user_id, project_id, source_agent, ...}`.

## kg.upsert_edge

Create or update a directed edge from `subject_id` to `object_id`.

```json
{
  "subject_id": "01JNODE...",
  "predicate": "knows",
  "object_id": "01JOTHER..."
}
```

Edge dedup on `(subject_id, predicate, object_id, scope)`. Props shallow-merged on conflict same as nodes.

Response: `KgEdgeDto`.

## kg.neighborhood

Traverse the graph outward from a node. Bounded BFS with depth 0–2 (default 1) and `max_tokens` budget. Returns a node-centric subgraph.

```json
{
  "node_id": "01JNODE...",
  "depth": 1,
  "max_tokens": 1000
}
```

Optional: `strict_scope: true` (only project rows, no scope inheritance).

Response: `{node: KgNodeDto, edges: {predicate, direction: "out", node: KgNodeDto, props}[], meta: {depth, truncated, total_edges_discovered}}`.

Node-centric shape: the queried node is always returned (not counted against budget). Edges are added in BFS order until the budget is exhausted. `truncated` signals incomplete traversal.

## kg.get_node

Retrieve a full node by id. Scope-filtered.

```json
{"id": "01JNODE..."}
```

Not found within scope → `-32602 "KG node not found in scope"`.

### Design notes

The knowledge graph uses SQLite recursive CTEs for traversal (not a separate graph DB). The `GraphStore` interface abstracts the storage so a future swap to Neo4j/LadybugDB is possible without touching the service or handler layers. Entity resolution is limited to lowercase+trim in v1 — no alias table or semantic merge.