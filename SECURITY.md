# Sécurité et publication

## Données qui ne doivent jamais être versionnées

- clés API Groq ;
- credentials n8n ;
- base de données locale n8n ;
- exports bruts de workflows ;
- adresse email et identifiants du propriétaire n8n ;
- données personnelles contenues dans les candidatures ;
- CV et lettres générés pour une offre précise.

## Export public

Le script `scripts/sanitize-workflow.mjs` :

- désactive le workflow exporté ;
- retire les credentials ;
- retire les identifiants du workflow, du projet et du propriétaire ;
- retire les identifiants de Data Table ;
- retire les métadonnées de version locales ;
- vérifie qu'aucune adresse email ne subsiste.

Le workflow nettoyé exige une nouvelle sélection du credential Groq et de la Data Table après import.

Le script `scripts/validate-public-workflow.mjs` contrôle ensuite l'absence de credentials, d'identifiants locaux, d'adresse email et de connexions vers des nœuds absents.

## Signalement

Si un secret est publié par erreur, il faut d'abord le révoquer auprès du fournisseur, puis nettoyer l'historique Git. Supprimer uniquement le fichier dans un nouveau commit ne suffit pas.
