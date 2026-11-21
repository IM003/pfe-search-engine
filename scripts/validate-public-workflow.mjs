import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , workflowArgument = 'workflow/pfe-search-engine.json'] = process.argv;
const workflowPath = resolve(workflowArgument);
const parsed = JSON.parse(await readFile(workflowPath, 'utf8'));
const workflow = Array.isArray(parsed) ? parsed[0] : parsed;

if (!workflow || !Array.isArray(workflow.nodes)) {
  throw new Error('Le fichier ne contient pas un workflow n8n valide.');
}

const errors = [];
const nodeNames = new Set(workflow.nodes.map((node) => node.name));
const serialized = JSON.stringify(workflow);

if (workflow.active !== false) {
  errors.push('Le workflow public doit être inactif.');
}

const forbiddenTopLevelKeys = [
  'id',
  'shared',
  'versionId',
  'activeVersionId',
  'sourceWorkflowId',
  'staticData',
  'meta',
];

for (const key of forbiddenTopLevelKeys) {
  if (Object.hasOwn(workflow, key)) {
    errors.push(`Métadonnée privée présente : ${key}`);
  }
}

for (const node of workflow.nodes) {
  if (node.credentials) {
    errors.push(`Credential présent dans le nœud : ${node.name}`);
  }

  if (node.type === 'n8n-nodes-base.dataTable') {
    const tableId = node.parameters?.dataTableId?.value;

    if (tableId) {
      errors.push(`Identifiant de Data Table présent dans le nœud : ${node.name}`);
    }
  }
}

for (const [sourceName, connectionTypes] of Object.entries(
  workflow.connections ?? {},
)) {
  if (!nodeNames.has(sourceName)) {
    errors.push(`Connexion issue d'un nœud absent : ${sourceName}`);
  }

  const visit = (value) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (!value || typeof value !== 'object') {
      return;
    }

    if (typeof value.node === 'string' && !nodeNames.has(value.node)) {
      errors.push(`Connexion vers un nœud absent : ${value.node}`);
    }

    Object.values(value).forEach(visit);
  };

  visit(connectionTypes);
}

const forbiddenPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /"credentials"\s*:/i,
  /"projectId"\s*:/i,
  /"creatorId"\s*:/i,
  /"shared"\s*:/i,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(serialized)) {
    errors.push(`Motif privé détecté : ${pattern}`);
  }
}

if (!nodeNames.has('Groq Chat Model (GPT-OSS 120B)')) {
  errors.push("Le nœud public du modèle GPT-OSS 120B n'a pas été trouvé.");
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(
  `Workflow public valide : ${workflow.nodes.length} nœuds, aucun secret ni identifiant local détecté.`,
);
