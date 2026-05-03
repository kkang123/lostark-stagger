// 카드

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

  const decodedName = decodeURIComponent(characterName).trim();
  const encodedName = encodeURIComponent(decodedName);

  const url = `${baseUrl}/armories/characters/${encodedName}/cards`;

  const res = await fetch(url, {
    headers: {
      Authorization: `bearer ${jwt}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { message: "Lostark API error", status: res.status, detail: text },
      { status: res.status },
    );
  }

  // const data = await res.json();
  // return NextResponse.json(data);

  const data = await res.json();

  // api 데이터 묶음 콘솔
  console.log("✅ card API response:", data);

  return NextResponse.json(data);
}
