import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // 빌드타임 고정/캐싱 방지(항상 요청 시 실행)

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ characterName: string }> }, // Promise로 받기
) {
  const { characterName } = await ctx.params; // await로 unwrap

  const baseUrl = process.env.LOSTARK_BASE_URL;
  const jwt = process.env.LOSTARK_JWT?.trim();

  // ✅ 요청이 실제로 들어왔을 때만 env를 읽음
  if (!baseUrl || !jwt) {
    return NextResponse.json(
      { message: "Server env is missing (LOSTARK_BASE_URL or LOSTARK_JWT)" },
      { status: 500 },
    );
  }

  const name = characterName?.trim();
  if (!name) {
    return NextResponse.json(
      { message: "characterName is required" },
      { status: 400 },
    );
  }

  // 한글/특수문자 대비
  const encodedName = encodeURIComponent(characterName.trim());
  const url = `${baseUrl}/characters/${encodedName}/siblings`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `bearer ${jwt}`,
      },
      // Next 서버에서 외부 API 호출은 캐시 끄는 게 개발 단계에 편함
      cache: "no-store", // 요청 시마다 새로
    });

    const text = await res.text();

    // 외부 API가 JSON이 아닐 수도 있어서 안전 파싱
    // 업스트림 JSON 강제
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
