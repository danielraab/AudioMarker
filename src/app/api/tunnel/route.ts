export async function POST(req: Request) {

  const envelope = await req.text();
  const [headerLine] = envelope.split('\n');
  if (!headerLine) return new Response('Bad envelope', { status: 400 });

  const header = JSON.parse(headerLine) as { dsn?: string };
  if (!header?.dsn) return new Response('Missing DSN', { status: 400 });

  const dsnUrl = new URL(header.dsn);
  const projectId = dsnUrl.pathname.slice(1);
  const publicKey = dsnUrl.username;
  if (!publicKey) return new Response('Missing DSN key', { status: 400 });
  const upstream = `https://${dsnUrl.host}/api/${projectId}/envelope/?sentry_key=${encodeURIComponent(publicKey)}&sentry_version=7`;

  const res = await fetch(upstream, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-sentry-envelope' },
    body: envelope,
    redirect: 'manual',
  });
  return new Response(res.body, { status: res.status });
}
