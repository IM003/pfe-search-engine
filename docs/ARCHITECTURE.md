# Architecture

## Objectif technique

PFE Search Engine sépare quatre responsabilités : la découverte, l'extraction, la normalisation et le stockage. Cette séparation permet d'ajouter de nouvelles sources sans modifier les règles de qualité des données.

## Parcours d'une annonce

### 1. Découverte

Le `Schedule Trigger` lance le workflow chaque jour à 11h. Le nœud `Collecter Dreamjob` lit le flux RSS dédié aux stages.

Le flux RSS a été retenu pour la V1 car les requêtes directes vers certaines pages Dreamjob sont protégées par Cloudflare et peuvent renvoyer une réponse HTTP 403. Le RSS fournit une source plus stable et évite de dépendre d'un contournement fragile.

### 2. Filtrage et déduplication

Le nœud `Filtrer les PFE Dreamjob` :

- détecte les formulations PFE et projet de fin d'études ;
- transforme le HTML RSS en texte ;
- normalise les URLs ;
- supprime les doublons présents dans un même lot.

Le nœud `Ignorer les URLs déjà collectées` interroge ensuite `pfe_offers` avec `source_url`. Une URL connue ne passe pas à l'étape LLM.

### 3. Extraction factuelle

Le nœud `Extraire les informations` utilise un JSON Schema strict. Le modèle doit renvoyer tous les champs attendus et laisser une chaîne vide lorsque l'information est absente.

Règles importantes :

- aucune connaissance extérieure ;
- aucune rémunération inférée ;
- aucune date inventée ;
- signalement des annonces contenant plusieurs offres ;
- distinction entre stage PFE, autre stage et contenu hors stage.

Le modèle utilisé est `openai/gpt-oss-120b` via Groq, avec une température de `0`. Les éléments sont traités un par un avec 30 secondes entre les lots.

### 4. Normalisation

Le nœud `Normaliser, contrôler et identifier` réalise les opérations déterministes qui ne doivent pas dépendre du modèle :

- nettoyage des valeurs ;
- aplatissement des listes ;
- normalisation des URLs ;
- retrait des paramètres UTM ;
- extraction du domaine source ;
- génération de l'identifiant `offer_id` avec FNV-1a ;
- calcul du score de complétude ;
- classement du statut d'extraction ;
- classement de la priorité de rémunération.

### 5. Stockage

Le dernier nœud effectue un upsert dans la Data Table `pfe_offers`, avec `offer_id` comme condition de correspondance.

La table contient également des colonnes réservées à l'analyse de pertinence, aux documents de candidature et au suivi Trello. Ces colonnes préparent l'évolution du système sans mélanger extraction factuelle et décision de candidature.

## Choix structurants

### Dédupliquer avant le LLM

Une URL connue ne consomme aucun token. Le second test complet a confirmé que les 14 URLs déjà enregistrées s'arrêtent avant l'extracteur.

### Séparer faits et recommandations

L'extracteur décrit l'annonce. Il ne décide pas si elle convient au candidat. Cette décision appartient à une future étape d'analyse, avec ses propres critères et son propre statut.

### Conserver les valeurs manquantes

Une valeur vide est plus fiable qu'une valeur plausible mais inventée. Le score de complétude rend ces lacunes visibles et permet de cibler un enrichissement ultérieur.

### Ne jamais automatiser l'envoi d'une candidature

Le système peut préparer des informations et des documents. La sélection finale, le contrôle du dossier et l'envoi restent sous la responsabilité exclusive de l'utilisateur.

## Extension à une nouvelle source

Une nouvelle source doit produire au minimum :

```json
{
  "url": "https://exemple.ma/offre",
  "texte": "Contenu nettoyé de l'annonce"
}
```

Elle peut ensuite rejoindre le flux avant `Extraire les informations`. Chaque connecteur doit gérer ses propres contraintes d'accès, son format et ses règles de filtrage.
