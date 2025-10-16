import { NextResponse, type NextRequest } from 'next/server';

type CorsHeaders = {
  origin: string;
  allowCredentials: boolean;
};

function resolveCorsHeaders(request: NextRequest): CorsHeaders {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const requestOrigin = request.headers.get('origin');

  if (!requestOrigin || !allowedOrigins || allowedOrigins.includes('*')) {
    return { origin: '*', allowCredentials: false };
  }

  if (allowedOrigins.includes(requestOrigin)) {
    return { origin: requestOrigin, allowCredentials: true };
  }

  return { origin: allowedOrigins[0] ?? '*', allowCredentials: false };
}

function applyCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const { origin, allowCredentials } = resolveCorsHeaders(request);

  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, apikey, X-Client-Info, Prefer'
  );
  response.headers.set('Access-Control-Max-Age', '86400');

  if (allowCredentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else {
    response.headers.delete('Access-Control-Allow-Credentials');
  }

  return response;
}

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(response, request);
  }

  const response = NextResponse.next();
  return applyCorsHeaders(response, request);
}

export const config = {
  matcher: ['/api/:path*']
};
