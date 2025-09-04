// app/api/rtm/route.ts
import { RtmTokenBuilder, RtmRole } from 'agora-token';
import { NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERT; // Server-side, no NEXT_PUBLIC_
const EXPIRE_SECS = parseInt(process.env.AGORA_TOKEN_EXPIRY || '3600', 10);

interface RequestBody {
  uid: string | number;
}

export async function POST(req: Request) {
  try {
    // Validate environment variables
    if (!APP_ID || !APP_CERT) {
      console.error('Missing Agora configuration');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    // Parse and validate request body
    const body: RequestBody = await req.json();
    const { uid } = body;
    if (!uid) {
      return new NextResponse('uid is required', { status: 400 });
    }

    // Generate token
    const uidStr = String(uid);
    const expireTs = Math.floor(Date.now() / 1000) + EXPIRE_SECS;
    const token = RtmTokenBuilder.buildToken(
      APP_ID,
      APP_CERT,
      uidStr,
      RtmRole.Rtm_User,
      expireTs
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating RTM token:', error);
    return new NextResponse('Bad request', { status: 400 });
  }
}

// Optional: Add CORS for cross-origin testing
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}