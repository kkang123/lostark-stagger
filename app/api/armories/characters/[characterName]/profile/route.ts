// 캐릭터 기본 프로필
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ characterName: string }> },
) {
  const { characterName } = await ctx.params;

  const baseUrl = process.env.LOSTARK_BASE_URL;
  const jwt = process.env.LOSTARK_JWT?.trim();

  if (!baseUrl || !jwt) {
    return NextResponse.json(
      { message: "Server env is missing (LOSTARK_BASE_URL or LOSTARK_JWT)" },
      { status: 500 },
    );
  }

  if (!characterName?.trim()) {
    return NextResponse.json(
      { message: "characterName is required" },
      { status: 400 },
    );
  }

  // ✅ 안전하게: decode → encode
  const decodedName = decodeURIComponent(characterName).trim();
  const encodedName = encodeURIComponent(decodedName);

  // ✅ LostArk 프로필 엔드포인트는 profiles(복수)
  const url = `${baseUrl}/armories/characters/${encodedName}/profiles`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `bearer ${jwt}`,
      },
      cache: "no-store",
    });

    const text = await res.text();

    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        {
          message: "Upstream returned non-JSON",
          status: res.status,
          raw: text,
        },
        { status: 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: "Lostark API error", status: res.status, data },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Network error while calling Lostark API" },
      { status: 500 },
    );
  }
}
