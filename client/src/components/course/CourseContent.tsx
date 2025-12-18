import { useEffect, useRef, useState } from "react";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";
import ExamModal, { type ExamQuestion } from "../exam/ExamModal";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../../components/shared/DialogProvider";

/* ================= TYPES ================= */

interface LessonItem {
  id: string;
  kind: "lesson";
  title: string;
  lessonType: "video" | "document";
  contentUrl?: string;
  order: number;
}

interface ExamItem {
  id: string;
  kind: "exam";
  title: string;
  description?: string;
  order: number;
  durationMinutes?: number | null;
  passPercent?: number;
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
  teacherId?: string;
}

/* ================= COMPONENT ================= */

export default function CourseContent({
  courseId,
  enrolled,
  teacherId,
}: Props) {
  const { user } = useAuth();

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { showDialog } = useDialog();

  /* ===== COMPLETED ITEMS ===== */
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  // tránh spam API khi click nhiều lần
  const completedRef = useRef<Set<string>>(new Set());

  /* ===== EXAM MODAL ===== */
  const [activeExam, setActiveExam] = useState<{
    examId: string;
    questions: ExamQuestion[];
  } | null>(null);

  const navigate = useNavigate();

  /* ================= PERMISSIONS ================= */
  const isOwner =
    user?.role === "teacher" &&
    teacherId &&
    user.id === teacherId;

    const canViewContent =
    user?.role === "admin" ||
    isOwner ||
    enrolled;
  
  const canViewExamQuestions =
    user?.role === "admin" ||
    isOwner;

  /* ================= LOAD CONTENT ================= */

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

  /* ================= HANDLER ================= */
  const handleTakeExam = (examId: string) => {
    if (!user) return;
  
    showDialog({
      title: "Start exam",
      variant: "warning",
      message:
        "Start exam now?\n\n• You must submit before leaving\n• Time will start immediately",
      confirmLabel: "Start exam",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        try {
          // 🔥 tạo hoặc lấy userExam đang in_progress
          await api.get(`/user-exams/${examId}/active`);
  
          // 👉 redirect sang trang thi
          navigate(`/exam/take/${examId}`);
        } catch (err) {
          console.error("Take exam failed", err);
          showDialog({
            title: "Error",
            variant: "error",
            message: "Cannot start exam. Please try again.",
          });
        }
      },
    });
  };
  
  
  /* ================= LOAD PROGRESS ================= */

  useEffect(() => {
    if (!user || (!enrolled && user.role === "student")) return;

    const loadProgress = async () => {
      try {
        const res = await api.get(
          `/courses/${courseId}/progress`,
          { params: { limit: 1000 } }
        );

        const set = new Set<string>();
        res.data.items?.forEach((p: any) => {
          set.add(`${p.itemType}:${p.itemId}`);
        });

        setCompletedSet(set);
        completedRef.current = new Set(set);
      } catch (err) {
        console.error("Load progress error:", err);
      }
    };

    loadProgress();
  }, [courseId, user, enrolled]);

  /* ================= PROGRESS TRACK ================= */

  const markLessonCompleted = async (lessonId: string) => {
    if (!user) return;
  
    const isTeacherNotOwner =
      user.role === "teacher" && user.id !== teacherId;
  
    if (user.role !== "student" && !isTeacherNotOwner) return;
  
    const key = `lesson:${lessonId}`;
    if (completedRef.current.has(key)) return;
  
    completedRef.current.add(key);
    setCompletedSet(new Set(completedRef.current));
  
    try {
      await api.post(`/courses/${courseId}/progress`, {
        itemType: "lesson",
        itemId: lessonId,
      });
    } catch (err) {
      console.error("Update progress failed", err);
      completedRef.current.delete(key);
    }
  };
  
  /* ================= LOAD EXAM QUESTIONS ================= */

  const openExamQuestions = async (examId: string) => {
    try {
      const res = await api.get(`/exams/${examId}/questions`);
      setActiveExam({
        examId,
        questions: res.data || [],
      });
    } catch (err) {
      console.error("Load exam questions error:", err);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="mt-6 text-sm text-gray-500">Loading content...</p>;
  }

  if (!sections.length) {
    return <p className="mt-6 text-sm text-gray-500">No content available.</p>;
  }

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">Course Content</h2>

      {sections.map((sec, si) => (
        <div key={sec.id} className="space-y-3">
          <h3 className="font-semibold text-lg">
            {si + 1}. {sec.title}
          </h3>

          <div className="ml-4 space-y-2">
            {sec.items.map((item, ii) => {
              const key = `${item.kind}:${item.id}`;
              const isCompleted = completedSet.has(key);

              /* ---------- LESSON ---------- */
              if (item.kind === "lesson") {
                return (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg ${
                      isCompleted
                        ? "bg-green-50 border-green-300"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-sm">
                      {si + 1}.{ii + 1} {item.title}
                    </div>

                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.lessonType === "video"
                        ? "🎥 Video"
                        : "📄 Document"}
                    </div>

                    {item.contentUrl && canViewContent ? (
                      <a
                        href={item.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markLessonCompleted(item.id)}
                        className="text-sm text-indigo-600 hover:underline mt-1 block"
                      >
                        {item.lessonType === "video"
                          ? "▶ Watch video"
                          : "📄 Open document"}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 mt-1 block">
                        🔒 Enroll to unlock
                      </span>
                    )}
                  </div>
                );
              }

              /* ---------- EXAM ---------- */
              const examKey = `exam:${item.id}`;
              const isExamCompleted = completedSet.has(examKey);

              return (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg ${
                    isExamCompleted
                      ? "bg-green-50 border-green-300"
                      : "bg-orange-50"
                  }`}
                >
                  <div className="font-semibold text-sm text-orange-700">
                    {si + 1}.{ii + 1} 📝 {item.title}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                    {item.durationMinutes && (
                      <span>⏱ {item.durationMinutes} min</span>
                    )}
                    {item.passPercent !== undefined && (
                      <span>✅ Pass: {item.passPercent}%</span>
                    )}
                  </div>

                  {/* ADMIN / TEACHER */}
                  {canViewExamQuestions && (
                    <button
                      type="button"
                      onClick={() => openExamQuestions(item.id)}
                      className="mt-2 text-xs text-indigo-600 underline"
                    >
                      View questions
                    </button>
                  )}

                  {/* STUDENT TAKE EXAM */}
                  {enrolled && !isExamCompleted && (
                    <button
                      type="button"
                      onClick={() => handleTakeExam(item.id)}
                      className="mt-2 px-3 py-1 text-sm rounded
                                bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Take exam
                    </button>
                  )}

                  {/* COMPLETED LABEL (optional) */}
                  {isExamCompleted && (
                    <div className="mt-2 text-xs font-medium text-green-700">
                      ✅ Completed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {activeExam && (
        <ExamModal
          open
          value={activeExam.questions}
          readOnly
          onClose={() => setActiveExam(null)}
          onSave={() => {}}
        />
      )}
    </div>
  );
}
