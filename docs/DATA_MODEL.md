# Modèle de données

La Data Table `pfe_offers` centralise la découverte, l'extraction, l'analyse et le suivi. Le fichier [`../schema/pfe_offers.csv`](../schema/pfe_offers.csv) contient l'en-tête importable.

## Identité et état de l'offre

- `offer_id` : identifiant déterministe généré après normalisation.
- `is_stage_offer` : indique si le contenu présente réellement un stage.
- `etat_offre` : `ouverte`, `fermee` ou `non_precisee`.
- `extraction_status` : résultat du contrôle technique.
- `content_hash` : réservé à la détection future des modifications.

## Contenu extrait

- `entreprise`
- `poste`
- `description`
- `missions`
- `profil_cible`
- `competences_cles`
- `domaine`
- `type_stage`

## Localisation et organisation

- `pays`
- `ville`
- `mode_travail`
- `date_publication`
- `date_limite`
- `date_debut`
- `duree`

## Rémunération

- `remuneration_status`
- `remuneration_priority`
- `remuneration_amount`
- `remuneration_currency`
- `remuneration_period`
- `remuneration_details`
- `remuneration_evidence`

La priorité est calculée ainsi :

| Statut | Priorité |
| --- | --- |
| `confirmee` | `prioritaire` |
| `non_precisee` | `a_confirmer` |
| `non_remuneree` | `faible` |

## Traçabilité

- `source_url`
- `url_candidature`
- `source_domain`
- `contact_candidature`
- `extraction_notes`
- `completeness_score`
- `detected_at`
- `first_seen_at`
- `last_seen_at`
- `updated_at`

## Analyse future

- `analysis_status`
- `relevance_score`
- `viability_status`
- `priority_level`
- `analysis_report`
- `selected_for_application`
- `rejection_reason`

## Documents et suivi

- `cv_status`, `cv_path`
- `cover_letter_status`, `cover_letter_path`
- `trello_status`, `trello_card_id`, `trello_card_url`
- `application_status`, `sent_at`
- `follow_up_count`, `next_follow_up_at`
- `terminal_reason`

Ces colonnes ne signifient pas que l'envoi est automatique. Elles servent à suivre les décisions et les actions réalisées par l'utilisateur.
