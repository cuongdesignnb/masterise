export function collectGraphNodes(documents) {
  return documents.flatMap((document) => (Array.isArray(document?.['@graph']) ? document['@graph'] : [document]));
}

function canonicalOrigin(canonical) {
  try {
    return new URL(canonical).origin;
  } catch {
    return '';
  }
}

function hasOrigin(value, origin) {
  if (!origin || typeof value !== 'string') return false;
  try {
    return new URL(value).origin === origin;
  } catch {
    return false;
  }
}

function collectReferences(value, origin, references, nodeId, path, isTopLevelId = false) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectReferences(entry, origin, references, nodeId, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== 'object') return;

  for (const [key, entry] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (key === '@id' && typeof entry === 'string') {
      if (!isTopLevelId && hasOrigin(entry, origin)) {
        references.push({ id: entry, nodeId, path: nextPath });
      }
      continue;
    }
    collectReferences(entry, origin, references, nodeId, nextPath);
  }
}

export function analyzeGraph(documents, canonical) {
  const nodes = collectGraphNodes(documents).filter((node) => node && typeof node === 'object');
  const ids = nodes.map((node) => node['@id']).filter((id) => typeof id === 'string');
  const defined = new Set(ids);
  const origin = canonicalOrigin(canonical);
  const references = [];

  nodes.forEach((node, index) => {
    const nodeId = typeof node['@id'] === 'string' ? node['@id'] : `@graph[${index}]`;
    for (const [key, value] of Object.entries(node)) {
      collectReferences(value, origin, references, nodeId, `@graph[${index}].${key}`, key === '@id');
    }
  });

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const danglingReferences = references.filter((reference) => !defined.has(reference.id));
  const emptyNodes = nodes.filter((node) => Object.keys(node).length === 0);

  return {
    duplicateIds,
    danglingReferences,
    emptyNodes,
    ids,
    nodes,
  };
}

export function formatDanglingReferences(references) {
  return references
    .map((reference) => `${reference.id} referenced by ${reference.nodeId} at ${reference.path}`)
    .join('; ');
}
