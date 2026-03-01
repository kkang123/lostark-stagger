type ApiErrorPayload = { message?: string; status?: number } | null;

export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const status = (body as ApiErrorPayload)?.status ?? res.status;
    const msg =
      typeof (body as ApiErrorPayload)?.message === "string"
        ? (body as ApiErrorPayload)!.message
        : "Request failed";

    throw new Error(`${msg} (status: ${status})`);
  }

  return body as T;
}
