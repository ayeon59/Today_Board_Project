const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}/uploads/image`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const message = data?.message ?? "이미지 업로드에 실패했습니다.";
    throw new Error(message);
  }

  if (!data?.url) {
    throw new Error("유효한 업로드 경로를 받지 못했습니다.");
  }

  return data;
}

export const uploadApi = {
  uploadImage,
};
