import { apiRequest } from "../../../shared/api/client";

export function listComments(postId, token) {
  return apiRequest(`/posts/${postId}/comments`, { token });
}

export function createComment(postId, token, payload) {
  return apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function removeComment(postId, commentId, token) {
  return apiRequest(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
}

export const commentsApi = {
  listComments,
  createComment,
  removeComment,
};
