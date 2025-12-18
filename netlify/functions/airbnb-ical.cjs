const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  const url =
    process.env.AIRBNB_ICAL_URL ||
    process.env.VITE_AIRBNB_ICAL_URL ||
    process.env.ICAL_URL ||
    '';

  if (!url) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8' },
      body: 'Missing AIRBNB_ICAL_URL env var.',
    };
  }

  try {
    const response = await fetch(url, { method: 'GET' });
    const body = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8' },
        body: `Upstream iCal fetch failed (${response.status}).`,
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'content-type': 'text/calendar; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
      body,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8' },
      body: 'Failed to fetch upstream iCal feed.',
    };
  }
};

