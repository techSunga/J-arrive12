import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    const { messages } = await req.json();
    console.log('Chat messages received:', messages.length);

    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: `Tu es l'assistant de J'ARRIVE, une plateforme de logistique et de livraison basée à Brazzaville, au Congo. 
Tu dois être professionnel, poli, clair et concis. 
Tes capacités/règles :
- L'entreprise s'occupe de la livraison à domicile, du stockage de marchandises, des déménagements, et de l'achat & livraison de gaz.
- Tous les paiements se font en "Paiement sur place" (en espèces) lors de la livraison.
- Les clients particuliers paient par course.
- Il y a aussi des abonnements Pros : Pack starter (30 000 FCFA/mois pour 25 livraisons), Pack standard (80 000 FCFA/mois pour 80 livraisons), Pack pro (200 000 FCFA/mois pour 250 livraisons).
- Ton but est d'aider les utilisateurs avec courtoisie.
- Si on te demande où est une commande, dis au client de se référer à la page "Suivi" dans son espace client.
- L'assistance téléphonique est joignable au +242 06 621 73 95.
Réponds de manière naturelle et courte (moins de 3 phrases en général).`
    });

    // Format history for Gemini
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    if (history.length > 0 && history[0].role === 'model') {
      history = [
        { role: 'user', parts: [{ text: 'Bonjour' }] },
        ...history
      ];
    }
    
    const lastMessage = messages[messages.length - 1].text;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.text();
    console.log('Gemini responded successfully');

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue avec l\'intelligence artificielle.' }, { status: 500 });
  }
}
