import { apiRequest } from "../../../shared/api/client";
/* 프론트에서 백엔드로 보내는 모든 게시글 관련 요청 */
export async function listPosts(params = {}, token) {
  // quey에 게시글 관련 정보 및 토큰 받아옴
  return apiRequest("/posts", { query: params, token });
}

export async function getPost(id, token) {
  return apiRequest(`/posts/${id}`, { token });
}

export async function listMyPosts(token) {
  return apiRequest("/posts/me/list", { token });
}

export async function createPost(token, payload) {
  return apiRequest("/posts", { method: "POST", body: payload, token });
}

export async function updatePost(id, token, payload) {
  return apiRequest(`/posts/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}

export async function removePost(id, token) {
  return apiRequest(`/posts/${id}`, { method: "DELETE", token });
}

export async function toggleLike(id, token) {
  return apiRequest(`/posts/${id}/like`, { method: "POST", token });
}

export async function getHomeSummary(token) {
  return apiRequest("/posts/summary", { token });
}

export const postsApi = {
  listPosts,
  getPost,
  listMyPosts,
  createPost,
  updatePost,
  removePost,
  toggleLike,
  getHomeSummary,
};
