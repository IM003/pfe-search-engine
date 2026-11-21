# Installation et configuration

## 1. Prérequis

- Node.js 24 ou une version compatible avec n8n.
- n8n 2.48.7 ou une version compatible.
- Un compte Groq.
- Windows pour reproduire le démarrage automatique documenté ici.

Installation locale de n8n :

```powershell
npm install --global n8n
n8n.cmd --version
```

## 2. Importer le workflow

Dans n8n :

1. créer ou ouvrir un projet ;
2. choisir l'import depuis un fichier ;
3. sélectionner `workflow/pfe-search-engine.json` ;
4. conserver le workflow inactif pendant la configuration.

L'export public ne contient aucun credential ni identifiant local.

## 3. Créer la Data Table

1. Ouvrir `Data tables`.
2. Créer une table nommée `pfe_offers`.
3. Importer `schema/pfe_offers.csv`.
4. Revenir au workflow.
5. Sélectionner cette table dans :
   - `Ignorer les URLs déjà collectées` ;
   - `Enregistrer ou mettre à jour l'offre`.

## 4. Configurer Groq

1. Créer un credential Groq dans n8n.
2. Ne jamais placer la clé dans le workflow ou dans un fichier du dépôt.
3. Sélectionner le credential dans `Groq Chat Model (GPT-OSS 120B)`.
4. Vérifier le modèle `openai/gpt-oss-120b`.
5. Conserver la température à `0`.

Le traitement utilise un lot d'un élément et une pause de 30 000 ms entre les lots.

## 5. Définir le fuseau horaire

Avant de lancer n8n sous PowerShell :

```powershell
$env:GENERIC_TIMEZONE = "Africa/Casablanca"
$env:TZ = "Africa/Casablanca"
n8n.cmd start
```

## 6. Tester

1. Lancer une exécution manuelle.
2. Vérifier que le flux RSS produit des éléments.
3. Vérifier que l'extracteur renvoie des objets structurés.
4. Vérifier que les lignes sont créées dans `pfe_offers`.
5. Relancer immédiatement le workflow.
6. Vérifier que les URLs connues s'arrêtent avant le LLM.

## 7. Publier

Publier le workflow seulement après les tests. Le `Schedule Trigger` est configuré pour 11h.

## 8. Démarrage automatique sous Windows

La configuration validée utilise une tâche Windows qui :

- démarre n8n à la connexion de l'utilisateur ;
- tente également un démarrage quotidien à 10h45 ;
- ignore la seconde demande si n8n tourne déjà ;
- lance PowerShell avec une fenêtre masquée ;
- définit le fuseau `Africa/Casablanca`.

Le chemin de `n8n.cmd`, le compte Windows et le dossier de travail doivent être adaptés à chaque machine.

## 9. Mise à jour sûre du workflow public

Exporter le workflow local dans un fichier temporaire, puis exécuter :

```powershell
node scripts/sanitize-workflow.mjs `
  chemin\vers\workflow.raw.json `
  workflow\pfe-search-engine.json
```

Ne jamais publier directement un export brut n8n.

Valider ensuite le fichier public :

```powershell
npm run validate
```
