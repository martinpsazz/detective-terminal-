export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return corsResponse();
    }

    try {
      if (url.pathname === '/new-case') {
        return await createCase(env);
      }

      if (url.pathname === '/chat') {
        return await chat(request, env);
      }

      if (url.pathname === '/case') {
        const caseId = url.searchParams.get('id');
        const data = await env.CASES.get(caseId);

        if (!data) {
          return jsonResponse({ error: 'Case not found' }, 404);
        }

        const parsed = JSON.parse(data);

        return jsonResponse({
          caseId: parsed.caseId,
          title: parsed.title,
          suspects: parsed.suspects
        });
      }

      return jsonResponse({ error: 'Route not found' }, 404);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};

async function createCase(env) {
  const prompt = `You are the hidden detective case engine.
Generate ONE murder mystery.
Return valid JSON only.
{
"title":"",
"victim":"",
"culprit":"",
"motive":"",
"weapon":"",
"difficulty":"Medium",
"suspects":[{"name":"","occupation":"","background":"","motive":"","alibi":""}],
"locations":[],
"timeline":[],
"evidence":[{"item":"","description":"","location":"","owner":""}],
"redHerrings":[],
"solution":""
}`;

  const result = await githubChat(env, [
    { role: 'system', content: prompt },
    { role: 'user', content: 'Create a detective case.' }
  ]);

  const caseData = JSON.parse(result);
  caseData.caseId = crypto.randomUUID();

  await env.CASES.put(caseData.caseId, JSON.stringify(caseData));

  return jsonResponse({
    caseId: caseData.caseId,
    title: caseData.title,
    suspects: caseData.suspects
  });
}

async function chat(request, env) {
  const body = await request.json();

  const raw = await env.CASES.get(body.caseId);
  if (!raw) {
    return jsonResponse({ error: 'Case not found' }, 404);
  }

  const caseData = JSON.parse(raw);

  const prompt = buildPrompt(
    body.agent,
    caseData,
    body.suspectName || ''
  );

  const reply = await githubChat(env, [
    { role: 'system', content: prompt },
    { role: 'user', content: body.message }
  ]);

  return jsonResponse({ reply });
}

function buildPrompt(agent, caseData, suspectName) {
  const secret = JSON.stringify(caseData);

  if (agent === 'gm') {
    return `You are a detective game master. Secret case:${secret}
Never reveal culprit or solution. Reveal clues gradually.`;
  }

  if (agent === 'forensics') {
    return `You are a forensic analyst. Secret case:${secret}
Provide scientific evidence analysis only.`;
  }

  if (agent === 'police') {
    return `You are a police records database. Secret case:${secret}
Provide records, reports and witness information.`;
  }

  if (agent === 'suspect') {
    const suspect = (caseData.suspects || []).find(
      s => s.name === suspectName
    );

    return `You are this suspect:${JSON.stringify(suspect)}
Secret case:${secret}
Stay in character and do not reveal the solution.`;
  }

  return `Detective assistant. Secret case:${secret}`;
}

async function githubChat(env, messages) {
  const response = await fetch(
    'https://models.github.ai/inference/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages,
        temperature: 0.8
      })
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    }
  });
}

function corsResponse() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*'
    }
  });
}
