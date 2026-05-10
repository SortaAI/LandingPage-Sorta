export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const endpoint = process.env.FORMSPREE_URL;
  if (!endpoint) {
    return res.status(500).json({ ok: false, error: 'Missing FORMSPREE_URL' });
  }

  try {
    // Accept either JSON (from fetch) or urlencoded (from plain HTML forms).
    const contentType = req.headers['content-type'] || '';
    let payload = {};

    if (contentType.includes('application/json')) {
      payload = typeof req.body === 'object' && req.body ? req.body : {};
    } else {
      // Vercel parses urlencoded bodies into req.body for Node functions.
      payload = typeof req.body === 'object' && req.body ? req.body : {};
    }

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      return res.status(502).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
}

