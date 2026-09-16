// Cloudflare Pages Function : proxy sécurisé vers l'API Groq.
// La clé GROQ_API_KEY reste sur le serveur, jamais exposée au navigateur.
// À configurer dans Cloudflare Pages : Settings → Environment variables → GROQ_API_KEY

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de La Réserve Hôtel, à Berthé, Pétion-Ville, Haïti.

INFORMATIONS RÉELLES SUR L'HÔTEL (à utiliser pour répondre) :
- Adresse : 2, Rue Marcel Toureau, Berthé, Pétion-Ville, Haïti
- Téléphone : +509 2940-0190
- E-mail : info@lareserveht.com
- 18 chambres climatisées avec wifi gratuit, TV écran plat, coffre-fort
- Types de chambres : Suite Mezzanine (plafond bois, salon privé), Chambre Classique, Chambre Twin (deux lits)
- Restaurant et bar ouverts tous les jours de 6h30 à 22h00, cuisine fusion créole, petit-déjeuner buffet inclus
- Jardin tropical, cadre calme et verdoyant en pleine ville
- Parking sécurisé, sécurité 24h/24
- Organisation de mariages, dîners privés et événements corporate (service traiteur)
- Arrivée à partir de 13h00, départ avant 12h00
- Les tarifs précis ne sont pas fixés dans cette conversation : invite le client à laisser ses dates pour recevoir un tarif exact

TON RÔLE :
1. Réponds aux questions des visiteurs de façon chaleureuse, précise et concise (3-4 phrases maximum par réponse).
2. Si un client veut réserver, pose UNE question à la fois pour recueillir : son nom, la date d'arrivée, la date de départ, le nombre de personnes, le type de chambre souhaité, et un moyen de contact (téléphone ou e-mail).
3. Ne confirme JAMAIS une disponibilité ou un prix ferme : précise toujours que la demande sera validée manuellement par l'équipe de l'hôtel.
4. Dès que tu as recueilli nom, dates, nombre de personnes ET contact, termine ta réponse par un bloc structuré au format exact ci-dessous (rien d'autre à l'intérieur du bloc, JSON valide) :

\`\`\`reservation
{"nom":"...", "arrivee":"...", "depart":"...", "personnes":"...", "chambre":"...", "contact":"..."}
\`\`\`

5. Si une question sort du cadre de l'hôtel, réponds brièvement puis reviens à ton rôle.
6. Réponds dans la langue utilisée par le client (français, créole haïtien ou anglais).`;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages manquant' }), { status: 400 });
    }

    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY non configurée' }), { status: 500 });
    }

    const model = env.GROQ_MODEL || 'openai/gpt-oss-120b';

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-16)],
        temperature: 0.4,
        max_tokens: 500
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(JSON.stringify({ error: 'Erreur Groq', detail: errText }), { status: 502 });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
