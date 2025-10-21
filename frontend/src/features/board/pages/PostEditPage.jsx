// src/features/board/pages/PostEditPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPost, getPost, updatePost } from "../api/posts.api";
import { useAuth } from "../../auth/state/AuthContext.jsx";
import { uploadImage } from "../../../shared/api/uploads.api.js";

const TITLE_MAX = 120;

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [form, setForm] = useState({
    boardType: "free",
    title: "",
    content: "",
    image: "",
  });
  const [filePreview, setFilePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const previewUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getPost(id, accessToken)
      .then((res) => {
        if (cancelled) return;
        setForm({
          boardType: res.boardType,
          title: res.title ?? "",
          content: res.content ?? "",
          image: res.image ?? "",
        });
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = "";
        }
        setFilePreview("");
        setSelectedFile(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "게시글 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }
    setError("");
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    const url = URL.createObjectURL(f);
    previewUrlRef.current = url;
    setSelectedFile(f);
    setForm((prev) => ({ ...prev, image: "" }));
    setFilePreview(url);
  };

  const validate = () => {
    if (!form.title.trim()) return "제목을 입력해주세요.";
    if (!form.content.trim()) return "내용을 입력해주세요.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    if (!accessToken) {
      setError("로그인이 필요합니다.");
      return;
    }
    setError("");
    setSubmitting(true);
    let imageUrl = form.image.trim();
    if (selectedFile) {
      try {
        const uploaded = await uploadImage(selectedFile, accessToken);
        imageUrl = uploaded.url;
      } catch (uploadErr) {
        setError(
          uploadErr.message ?? "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
        );
        setSubmitting(false);
        return;
      }
    }

    const payload = {
      boardType: form.boardType,
      title: form.title.trim(),
      content: form.content.trim(),
      image: imageUrl,
    };
    try {
      if (id) {
        const updated = await updatePost(id, accessToken, payload);
        navigate(`/posts/${updated.id}`);
      } else {
        const created = await createPost(accessToken, payload);
        navigate(`/posts/${created.id}`, { state: { from: "editor" } });
      }
      setSelectedFile(null);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setFilePreview("");
    } catch (err) {
      setError(err.message ?? "게시글 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const titleCount = useMemo(() => form.title.length, [form.title]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{id ? "글 수정" : "새 글 작성"}</h1>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 게시판 선택 */}
        <div>
          <label className="mb-1 block text-sm font-medium">게시판</label>
          <select
            className="w-full rounded border px-3 py-2 text-sm"
            value={form.boardType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, boardType: e.target.value }))
            }
          >
            <option value="free">자유</option>
            <option value="question">질문</option>
          </select>
        </div>

        {/* 제목 */}
        <div>
          <label className="mb-1 block text-sm font-medium">제목</label>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            maxLength={TITLE_MAX}
          />
          <p className="mt-1 text-right text-xs text-gray-500">
            {titleCount}/{TITLE_MAX}
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="mb-1 block text-sm font-medium">내용</label>
          <textarea
            className="h-48 w-full rounded border px-3 py-2 text-sm"
            placeholder="내용을 입력하세요"
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
          />
        </div>

        {/* 이미지 */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              대표 이미지 URL (선택)
            </label>
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="https://example.com/cover.png"
              value={form.image}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, image: e.target.value }));
                setSelectedFile(null);
                if (previewUrlRef.current) {
                  URL.revokeObjectURL(previewUrlRef.current);
                  previewUrlRef.current = "";
                }
                setFilePreview("");
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              이미지 파일 (선택)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="w-full text-sm"
            />
          </div>

          {(filePreview || form.image) && (
            <div className="sm:col-span-2">
              <div className="rounded border bg-white p-3">
                <div className="mb-1 text-xs text-gray-500">미리보기</div>
                <img
                  src={filePreview || form.image}
                  alt="preview"
                  className="max-h-64 w-full rounded object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "저장 중..." : id ? "수정 저장" : "작성 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
