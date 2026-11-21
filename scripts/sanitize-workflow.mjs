import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';

const [, , inputArgument, outputArgument] = process.argv;

if (!inputArgument || !outputArgument) {
  console.error(
    'Usage: node scripts/sanitize-workflow.mjs <raw-export.json> <public-workflow.json>',
  );
  process.exit(1);
}

const inputPath = resolve(inputArgument);
const outputPath = resolve(outputArgument);
const parsed = JSON.parse(await readFile(inputPath, 'utf8'));
const source = Array.isArray(parsed) ? parsed[0] : parsed;

if (!source || !Array.isArray(source.nodes)) {
  throw new Error('Le fichier ne contient pas un workflow n8n valide.');
}

const workflow = structuredClone(source);

const privateTopLevelKeys = [
  'updatedAt',
  'createdAt',
  'id',
  'shared',
  'versionId',
  'activeVersionId',
  'versionCounter',
  'triggerCount',
  'sourceWorkflowId',
  'staticData',
  'meta',
  'versionMetadata',
];

for (const key of privateTopLevelKeys) {
  delete workflow[key];
}

workflow.active = false;
workflow.pinData = {};
workflow.tags = [];

const oldModelName = 'Groq Chat Model (Llama)';
const publicModelName = 'Groq Chat Model (GPT-OSS 120B)';

for (const node of workflow.nodes) {
  delete node.credentials;

  if (node.name === oldModelName) {
    node.name = publicModelName;
  }

  if (node.type === 'n8n-nodes-base.dataTable') {
    node.parameters.dataTableId = {
      __rl: true,
      value: '',
      mode: 'list',
      cachedResultName: 'pfe_offers',
    };
  }
}

if (workflow.connections?.[oldModelName]) {
  workflow.connections[publicModelName] = workflow.connections[oldModelName];
  delete workflow.connections[oldModelName];
}

for (const group of workflow.nodeGroups ?? []) {
  if (group.name === 'Récupérer la page') {
    group.name = 'Préparer et dédupliquer la source';
    group.description =
      'Vérifie les URLs déjà collectées et prépare un texte court. Les nœuds HTTP et Markdown sont réservés aux futures sources web.';
  }

  if (group.name === "Extraire l'offre de stage") {
    group.description =
      "GPT-OSS 120B extrait les faits de l'annonce, puis le workflow normalise, contrôle et enregistre le résultat.";
  }
}

const serialized = `${JSON.stringify(workflow, null, 2)}\n`;

const forbiddenPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /"credentials"\s*:/i,
  /"projectId"\s*:/i,
  /"creatorId"\s*:/i,
  /"shared"\s*:/i,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(serialized)) {
    throw new Error(`Métadonnée privée détectée après nettoyage : ${pattern}`);
  }
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, serialized, 'utf8');

console.log(`Workflow public créé : ${outputPath}`);
