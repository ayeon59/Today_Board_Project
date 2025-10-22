const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
// path로 받은 경로를 "http://localhost:3000" 뒤에 붙여서 url을 만들어줌
export async function apiRequest(path, options = {}) {
  // 기본값으로 GET 설정해두고 다른 HTTP 메서드라면 options에 정보를 담아서 보냄
  const { method = "GET", body, token, query, headers } = options;
  // 경로 설정
  const url = new URL(`${API_BASE}${path}`);

  /* query를 URL 객체에 붙여주는 코드
   * listPosts({ tab: "all", sort: "latest" })를 예시로 들면
   * 최종 요청 주소가 http://localhost:3000/posts?tab=all&sort=latest가 되는 것
   */
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  /* HTTP 요청이나 응답에 붙이는 메타데이터 설정 */
  const reqHeaders = new Headers(headers ?? {});

  if (body && !reqHeaders.has("Content-Type")) {
    reqHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    reqHeaders.set("Authorization", `Bearer ${token}`);
  }

  /* fetch로 실제 요청을 보내고 비동기 처리를 약속하는 promise를 반환한다. */
  const res = await fetch(url.toString(), {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  /* 응답 본문을 문자열로 읽는다. res.text()도 Promise라 await로 문자열을 기다린다. */
  const text = await res.text();
  let data = null;
  /* 응답 본문 파싱이 성공하면 data에 JSON 객체가, 실패하면 null 값이 들어간다.*/
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  /* HTTP 요청 실패 핸들러 구현 */
  if (!res.ok) {
    const message = Array.isArray(data?.message)
      ? data.message[0]
      : data?.message ?? "요청에 실패했습니다.";
    throw new Error(message);
  }

  return data;
}

/* apiClient 자체는 단순히 객체 export 하는 함수
 * 클라이언트의 HTTP 요청에 대한 응답을 처리하는 apiRequest를 내보내면 응답도 같이 담겨서 나간다.
 * 즉, 원하는 데이터를 서버에서 받아올 수 있다.
 */
export const apiClient = {
  request: apiRequest,
  API_BASE,
};

export default API_BASE;
