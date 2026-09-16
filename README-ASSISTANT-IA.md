# Assistant IA — La Réserve Hôtel

Le site inclut désormais une bulle de chat (en bas à droite) propulsée par **Groq**. Elle répond aux questions des visiteurs et recueille les demandes de réservation (nom, dates, nombre de personnes, contact), qui apparaissent ensuite dans une fiche avec des boutons **WhatsApp** et **e-mail** pré-remplis à envoyer à l'hôtel. Rien n'est envoyé automatiquement : chaque demande est validée manuellement par vous.

## 1. Récupérer une clé API Groq

1. Créez un compte sur [console.groq.com](https://console.groq.com)
2. Allez dans **API Keys** → **Create API Key**
3. Copiez la clé (elle ne sera affichée qu'une fois)

## 2A. Déploiement sur Netlify

1. Déposez tout le dossier (avec `index.html`, `assets/`, `netlify/`) dans un dépôt Git, ou glissez-déposez-le directement sur [app.netlify.com](https://app.netlify.com)
2. Une fois le site créé : **Site configuration → Environment variables → Add a variable**
   - `GROQ_API_KEY` = votre clé Groq
3. Netlify détecte automatiquement `netlify/functions/chat.js` et l'expose sur `/.netlify/functions/chat`. Le widget appelle `/api/chat` : ajoutez ce fichier `netlify.toml` à la racine pour rediriger l'un vers l'autre (déjà inclus dans ce zip).
4. Redéployez. Testez la bulle de chat en bas à droite du site.

## 2B. Déploiement sur Cloudflare Pages

1. Connectez votre dépôt (ou glissez-déposez le dossier) sur [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages**
2. Une fois le projet créé : **Settings → Environment variables → Add variable**
   - `GROQ_API_KEY` = votre clé Groq
3. Cloudflare Pages détecte automatiquement `functions/api/chat.js` et l'expose directement sur `/api/chat` (aucune configuration supplémentaire nécessaire).
4. Redéployez. Testez la bulle de chat.

## Personnaliser le comportement de l'assistant

Le "cerveau" de l'assistant (les informations qu'il connaît sur l'hôtel et ses instructions) se trouve dans la constante `SYSTEM_PROMPT`, dupliquée dans :
- `netlify/functions/chat.js`
- `functions/api/chat.js`

Modifiez le même texte dans les deux fichiers si vous changez d'hébergeur ou voulez garder les deux en parallèle : tarifs, politique d'annulation, nouvelles chambres, ton de voix, etc.

## Changer de modèle Groq

Par défaut le code utilise `openai/gpt-oss-120b` (modèle recommandé par Groq, rapide et gratuit en usage raisonnable). Pour changer, ajoutez une variable d'environnement `GROQ_MODEL` avec l'identifiant du modèle souhaité, sans modifier le code.

## Limites à connaître

- L'assistant **ne consulte pas un vrai calendrier de disponibilité** : il collecte des demandes, il ne confirme jamais une réservation ferme. C'est volontaire, conforme à ce qui a été demandé (traitement manuel par l'équipe).
- Si vous voulez plus tard une confirmation automatique en temps réel, il faudra connecter un vrai système de gestion hôtelière (PMS) ou un channel manager : c'est une étape supplémentaire, dites-le-moi si vous voulez l'explorer.
