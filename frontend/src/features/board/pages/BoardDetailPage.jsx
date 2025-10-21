// src/features/board/pages/BoardDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getPost, listPosts, toggleLike } from "../api/posts.api";
import {
  listComments,
  createComment,
  removeComment,
} from "../api/comments.api";
import { useAuth } from "../../auth/state/AuthContext.jsx";

const BOARD_LABEL = { free: "자유게시판", question: "질문게시판" };

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function readingTime(text) {
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 250));
}

export default function BoardDetailPage() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error
  const [error, setError] = useState("");
  const [likeError, setLikeError] = useState("");
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [likePending, setLikePending] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentLoadError, setCommentLoadError] = useState("");
  const [commentSubmitError, setCommentSubmitError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentDeletingId, setCommentDeletingId] = useState("");
  const fromEditor = location.state?.from === "editor";
  const postId = post?.id ?? null;

  useEffect(() => {
    if (!id) {
      setStatus("empty");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setError("");
    getPost(id, accessToken)
      .then((res) => {
        if (cancelled) return;
        setPost(res);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setPost(null);
        setError(err.message ?? "게시글을 불러오지 못했습니다.");
        setStatus("empty");
      });

    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  useEffect(() => {
    if (!post) {
      setRelatedPosts([]);
      return;
    }
    let cancelled = false;
    listPosts({ tab: post.boardType, sort: "popular" }, accessToken)
      .then((res) => {
        if (cancelled) return;
        setRelatedPosts(
          (res ?? []).filter((p) => p.id !== post.id).slice(0, 3)
        );
      })
      .catch(() => {
        if (cancelled) return;
        setRelatedPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [post, accessToken]);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      setCommentLoadError("");
      setCommentsLoading(false);
      return;
    }
    let cancelled = false;
    setCommentsLoading(true);
    setCommentLoadError("");
    setCommentInput("");
    setCommentSubmitError("");
    listComments(postId, accessToken)
      .then((res) => {
        if (cancelled) return;
        setComments(res ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setCommentLoadError(err.message ?? "댓글을 불러오지 못했습니다.");
        setComments([]);
      })
      .finally(() => {
        if (cancelled) return;
        setCommentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId, accessToken]);

  const createdAt = useMemo(() => formatDate(post?.createdAt), [post]);
  const estimatedMinutes = useMemo(
    () => readingTime(post?.content || ""),
    [post?.content]
  );
  const authorName = post?.author?.nickname || "익명";
  const hasImage = Boolean(post?.image && post.image.trim().length);
  const coverImage = hasImage ? post.image : null;
  const handleCoverImageError = (event) => {
    const target = event.currentTarget;
    if (target.dataset.fallbackApplied) return;
    target.dataset.fallbackApplied = "true";
    target.src = "/images/placeholder-16x9.svg";
  };
  const commentCount = post?.comments ?? comments.length;
  const commentPlaceholder = user
    ? "댓글을 입력하세요"
    : "로그인 후 댓글을 작성할 수 있습니다.";

  const handleGoBack = () => {
    if (fromEditor) {
      navigate("/posts");
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/posts");
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!postId) return;
    if (!user || !accessToken) {
      navigate("/login", { state: { from: `/posts/${postId}` } });
      return;
    }
    const content = commentInput.trim();
    if (!content.length) {
      setCommentSubmitError("댓글 내용을 입력해주세요.");
      return;
    }
    setCommentSubmitError("");
    setCommentSubmitting(true);
    createComment(postId, accessToken, { content })
      .then((created) => {
        setComments((prev) => [...prev, created]);
        setPost((prev) =>
          prev
            ? { ...prev, comments: (prev.comments ?? 0) + 1 }
            : prev
        );
        setCommentInput("");
      })
      .catch((err) => {
        const message =
          err.message ?? "댓글 작성에 실패했습니다.";
        if (message.toLowerCase().includes("unauthorized")) {
          navigate("/login", { state: { from: `/posts/${postId}` } });
          return;
        }
        setCommentSubmitError(message);
      })
      .finally(() => {
        setCommentSubmitting(false);
      });
  };

  const handleDeleteComment = (commentId) => {
    if (!postId || !commentId) return;
    if (!user || !accessToken) {
      navigate("/login", { state: { from: `/posts/${postId}` } });
      return;
    }
    if (!window.confirm("댓글을 삭제하시겠어요?")) return;
    setCommentSubmitError("");
    setCommentDeletingId(commentId);
    removeComment(postId, commentId, accessToken)
      .then(() => {
        setComments((prev) => prev.filter((item) => item.id !== commentId));
        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: Math.max(0, (prev.comments ?? 0) - 1),
              }
            : prev
        );
      })
      .catch((err) => {
        const message =
          err.message ?? "댓글 삭제에 실패했습니다.";
        if (message.toLowerCase().includes("unauthorized")) {
          navigate("/login", { state: { from: `/posts/${postId}` } });
          return;
        }
        setCommentSubmitError(message);
      })
      .finally(() => {
        setCommentDeletingId("");
      });
  };

  if (status === "loading") {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 h-10 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="h-4 w-full animate-pulse rounded bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-red-600">
          {error || "게시글을 불러오지 못했습니다."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/posts")}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-800">
          게시글을 찾을 수 없습니다.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          삭제되었거나 주소가 잘못되었을 수 있어요.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
          >
            이전 페이지
          </button>
          <button
            type="button"
            onClick={() => navigate("/posts")}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            게시글 목록
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <article className="flex-1 space-y-6">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          목록으로
        </button>

        <div className="rounded-3xl border bg-white shadow-sm">
          <header className={`${hasImage ? "border-b" : ""} p-6`}>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="rounded-full bg-gray-900 px-3 py-1 font-medium text-white">
                {BOARD_LABEL[post.boardType] || "게시판"}
              </span>
              {createdAt && <span className="text-gray-500">{createdAt}</span>}
              <span className="inline-flex items-center gap-1 text-gray-500">
                <i className="fa-regular fa-clock" aria-hidden="true" />
                {estimatedMinutes}분 정도 소요
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-gray-900">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <i className="fa-solid fa-user" aria-hidden="true" />
                {authorName}
              </span>
              <span className="inline-flex items-center gap-1 text-pink-600">
                <i className="fa-solid fa-heart" aria-hidden="true" />
                {post.likes ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 text-cyan-600">
                <i className="fa-solid fa-comment-dots" aria-hidden="true" />
                {post.comments ?? 0}
              </span>
            </div>
          </header>

          {hasImage && (
            <div className="border-b px-6 pb-6">
              <div className="overflow-hidden rounded-2xl bg-gray-50 p-3">
                <img
                  src={coverImage}
                  alt=""
                  onError={handleCoverImageError}
                  className="mx-auto max-h-96 w-full rounded-xl object-contain"
                />
              </div>
            </div>
          )}

          <section className="space-y-5 p-6 text-sm leading-relaxed text-gray-800">
            {(post.content || "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>마음에 드셨다면 공감 버튼을 눌러주세요!</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
              <i className="fa-solid fa-heart" aria-hidden="true" />
              {post.likes ?? 0}
            </span>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            {likeError && (
              <span className="text-xs text-red-500">{likeError}</span>
            )}
            <button
              type="button"
              onClick={() => {
                if (!accessToken) {
                  navigate("/login", { state: { from: `/posts/${id}` } });
                  return;
                }
                setLikeError("");
                setLikePending(true);
                toggleLike(id, accessToken)
                  .then((res) => {
                    setPost((prev) =>
                      prev
                        ? {
                            ...prev,
                            likes: res.likes,
                            myLike: res.liked,
                          }
                        : prev
                    );
                    setLikeAnimating(true);
                    setTimeout(() => setLikeAnimating(false), 400);
                  })
                  .catch((err) => {
                    const message = err.message ?? "공감 처리에 실패했습니다.";
                    if (message.toLowerCase().includes("unauthorized")) {
                      navigate("/login", { state: { from: `/posts/${id}` } });
                      return;
                    }
                    setLikeError(message);
                  })
                  .finally(() => {
                    setLikePending(false);
                  });
              }}
              className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-white transition ${
                post?.myLike ? "bg-pink-600 hover:bg-pink-500" : "bg-gray-900 hover:bg-gray-800"
              } ${
                likePending ? "cursor-not-allowed opacity-70" : ""
              }`}
              disabled={likePending}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full bg-white text-pink-600 ${
                  likeAnimating ? "heart-pop" : ""
                }`}
              >
                <i
                  className={`fa-${post?.myLike ? "solid" : "regular"} fa-heart`}
                  aria-hidden="true"
                />
              </span>
              <span>{post?.myLike ? "공감 취소" : "공감하기"}</span>
            </button>
          </div>
        </div>

        <section className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">댓글</h2>
            <span className="text-sm text-gray-500">{commentCount}개</span>
          </div>

          <form
            onSubmit={handleSubmitComment}
            className="rounded-2xl border bg-gray-50 p-4"
          >
            <label className="mb-2 block text-sm font-medium text-gray-700">
              댓글 작성
            </label>
            <textarea
              value={commentInput}
              onChange={(e) => {
                setCommentInput(e.target.value);
                if (commentSubmitError) setCommentSubmitError("");
              }}
              placeholder={commentPlaceholder}
              className="h-24 w-full resize-none rounded border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              disabled={!user || commentSubmitting}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              {commentSubmitError && (
                <span className="text-red-500">{commentSubmitError}</span>
              )}
              <div className="flex items-center gap-2">
                {!user && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/login", {
                        state: { from: `/posts/${postId}` },
                      })
                    }
                    className="rounded border px-3 py-1 text-xs font-medium hover:bg-gray-100"
                  >
                    로그인하기
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!user || commentSubmitting}
                  className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {commentSubmitting ? "등록 중..." : "댓글 달기"}
                </button>
              </div>
            </div>
          </form>

          {commentLoadError ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {commentLoadError}
            </div>
          ) : commentsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-2xl border bg-gray-50 p-4"
                >
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-12 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 px-3 py-4 text-sm text-gray-500">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </div>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {comment.author?.nickname || "익명"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {comment.isMine && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={commentDeletingId === comment.id}
                        className="text-xs text-gray-400 transition hover:text-red-500 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {comment.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>

      <aside className="w-full max-w-xs space-y-4">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">작성자 정보</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-900 text-white">
              {authorName?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {authorName}
              </p>
              <p className="text-xs text-gray-500">
                {BOARD_LABEL[post.boardType] || "게시판"} 활동가
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">
            이런 글은 어떠세요?
          </h2>
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            {relatedPosts.length === 0 && (
              <li className="rounded border bg-gray-50 px-3 py-2 text-xs text-gray-500">
                아직 추천할 글이 없어요.
              </li>
            )}
            {relatedPosts.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/posts/${item.id}`)}
                  className="w-full rounded-xl border px-3 py-2 text-left transition hover:border-gray-300 hover:bg-gray-50"
                >
                  <p className="text-xs text-gray-500">
                    {BOARD_LABEL[item.boardType] || "게시판"}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {item.preview}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
