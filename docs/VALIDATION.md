# Validation de la V1

## Environnement

- Date du test : 20 novembre 2026.
- n8n : 2.48.7.
- Node.js : 24.20.0.
- Modèle : `openai/gpt-oss-120b` via Groq.
- Source : flux RSS Dreamjob Stage.

## Scénario principal

1. Lancement manuel du workflow publié.
2. Lecture de 30 éléments RSS.
3. Filtrage de 14 articles candidats PFE.
4. Contrôle de l'absence des URLs dans `pfe_offers`.
5. Extraction de 14 résultats structurés.
6. Normalisation de 14 résultats.
7. Enregistrement de 14 lignes.

Résultat : succès.

## Scénario de déduplication

1. Relance du workflow avec les mêmes 30 éléments RSS.
2. Filtrage des mêmes 14 URLs candidates.
3. Contrôle dans `pfe_offers`.
4. Arrêt avant le nœud LLM.

Résultat : succès. Aucun nouvel appel au modèle et aucune ligne dupliquée.

## Contrôles de qualité observés

- Une information absente reste vide.
- Une rémunération non mentionnée devient `non_precisee`.
- Une annonce non reconnue comme stage devient `rejetee_non_stage`.
- Une offre sans entreprise, poste ou pays devient `a_verifier`.
- Les paramètres UTM sont retirés des URLs.
- L'identifiant reste déterministe pour une même identité d'offre.

## Limites du test

- Le test couvre une seule source.
- Le RSS ne contient pas toujours l'annonce complète.
- Les pages protégées par Cloudflare ne sont pas enrichies dans la V1.
- Les colonnes d'analyse, de documents et de Trello ne sont pas encore alimentées.
