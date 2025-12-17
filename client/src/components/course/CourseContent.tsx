import { useEffect, useState } from "react";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";

/* ================= TYPES ================= */

interface LessonItem {
  id: string;
  kind: "lesson";
  title: string;
  lessonType: "video" | "pdf";
  contentUrl?: string;
  order: number;
}

interface ExamItem {
  id: string;
  kind: "exam";
  title: string;
  description?: string;
  order: number;
}

type ContentItem = LessonItem | ExamItem;

interface Section {
  id: string;
  title: string;
  order: number;
  items: ContentItem[];
}

interface Props {
  courseId: string;
  enrolled: boolean;
}

/* ================= COMPONENT ================= */

export default function CourseContent({ courseId, enrolled }: Props) {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ quyền xem content
  const canViewContent =
    user?.role === "admin" ||
    user?.role === "teacher" ||
    enrolled;

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!courseId) return;

    const load = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/content`);
        setSections(res.data || []);
      } catch (err) {
        console.error("Load course content error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  if (loading) {
    return <p className="mt-6 text-sm text-gray-500">Loading content...</p>;
  }

  if (!sections.length) {
    return (
      <p className="mt-6 text-sm text-gray-500">
        No content available.
      </p>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">Course Content</h2>

      {sections.map((sec, si) => (
        <div key={sec.id} className="space-y-3">
          {/* ===== SECTION ===== */}
          <h3 className="font-semibold text-lg">
            {si + 1}. {sec.title}
          </h3>

          {/* ===== ITEMS ===== */}
          <div className="ml-4 space-y-2">
            {sec.items.map((item, ii) => {
              /* ---------- LESSON ---------- */
              if (item.kind === "lesson") {
                return (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="font-medium text-sm">
                      {si + 1}.{ii + 1} {item.title}
                    </div>

                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.lessonType === "video" ? "🎥 Video" : "📄 PDF"}
                    </div>

                    {/* ✅ LINK / LOCK */}
                    {item.contentUrl ? (
                      canViewContent ? (
                        <a
                          href={item.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline mt-1 block"
                        >
                          {item.lessonType === "video"
                            ? "▶ Watch video"
                            : "📄 Open PDF"}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 mt-1 block">
                          🔒 Enroll to unlock
                        </span>
                      )
                    ) : (
                      <span className="text-sm text-gray-400 mt-1 block">
                        No content
                      </span>
                    )}
                  </div>
                );
              }

              /* ---------- EXAM ---------- */
              return (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg bg-orange-50"
                >
                  <div className="font-semibold text-sm text-orange-700">
                    {si + 1}.{ii + 1} 📝 {item.title}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}

                  {enrolled ? (
                    <button
                      type="button"
                      className="mt-2 px-3 py-1 text-sm rounded bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Start Exam
                    </button>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      🔒 Enroll to take this exam
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
