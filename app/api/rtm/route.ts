// app/api/rtm/route.ts
import { RtmTokenBuilder, RtmRole } from 'agora-token';
import { NextResponse } from 'next/server';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const APP_CERT = process.env.AGORA_APP_CERT!;
const EXPIRE_SECS = 60 * 60; // 1 hour

export async function POST(req: Request) {
  try {
    const { uid } = await req.json();
    if (!uid) return new NextResponse('uid required', { status: 400 });

    const expireTs = Math.floor(Date.now() / 1000) + EXPIRE_SECS;
    const token = RtmTokenBuilder.buildToken(
      APP_ID,
      APP_CERT,
      String(uid),
      RtmRole.Rtm_User,
      expireTs
    );

    return NextResponse.json({ token });
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }
}