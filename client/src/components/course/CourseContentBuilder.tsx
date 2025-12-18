import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import {
  useCourseBuilder,
  type BuilderSection,
  type BuilderItem,
  type BuilderLesson,
  type BuilderExam,
} from "../../hooks/useCourseBuilder";
import ExamModal, { type ExamQuestion } from "../exam/ExamModal";

/* ================= VALIDATION ================= */
const isValidLessonContent = (
  type: "video" | "document",
  url?: string
) => {
  if (!url || !url.trim()) return false;

  const trimmed = url.trim();

  if (type === "document") {
    // các đuôi file phổ biến
    const docExtRegex =
      /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)(\?.*)?$/i;

    return docExtRegex.test(trimmed);
  }

  // video: chỉ cần là URL hợp lệ
  return /^https?:\/\//i.test(trimmed);
};

interface Props {
  courseId: string;
  value: BuilderSection[];
  onChange: (data: BuilderSection[]) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export default function CourseContentBuilder({
  courseId,
  value,
  onChange,
  onValidityChange,
}: Props) {
  const {
    sections,
    addSection,
    addLesson,
    addExam,
    updateSectionTitle,
    updateItem,
    removeItem,
    removeSection,
  } = useCourseBuilder(courseId, value);

  /* ===== EXAM MODAL STATE ===== */
  const [activeExam, setActiveExam] = useState<{
    sectionTempId: string;
    examTempId: string;
    questions: ExamQuestion[];
  } | null>(null);

  /* ===== VALIDATION STATE ===== */
  const hasInvalidLesson = sections.some((sec) =>
    sec.items.some((item) => {
      if (item.kind !== "lesson") return false;
      const lesson = item as BuilderLesson;
      return !isValidLessonContent(
        lesson.lessonType,
        lesson.contentUrl
      );
    })
  );

  const hasInvalidExam = sections.some((sec) =>
    sec.items.some((item) => {
      if (item.kind !== "exam") return false;
      const exam = item as BuilderExam;
      return !exam.questions || exam.questions.length === 0;
    })
  );

  const isContentValid = !hasInvalidLesson && !hasInvalidExam;
  /* ===== SYNC TO PARENT ===== */

  useEffect(() => {
    onChange(sections);
    onValidityChange?.(isContentValid);
  }, [sections, isContentValid, onChange, onValidityChange]);

  

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">Course Content</h2>

      {sections.map((sec) => (
        <div
          key={sec.tempId}
          className="border rounded-xl p-4 bg-white space-y-3"
        >
          {/* ===== SECTION HEADER ===== */}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 font-semibold border-b outline-none"
              value={sec.title}
              onChange={(e) =>
                updateSectionTitle(sec.tempId, e.target.value)
              }
            />

            <button
              type="button"
              onClick={() => removeSection(sec.tempId)}
              className="text-red-500 hover:text-red-600"
            >
              <FaTrash size={14} />
            </button>
          </div>

          {/* ===== ITEMS ===== */}
          {sec.items.map((item: BuilderItem) => {
            /* ---------- LESSON ---------- */
            if (item.kind === "lesson") {
              const lesson = item as BuilderLesson;

              const isInvalid = !isValidLessonContent(
                lesson.lessonType,
                lesson.contentUrl
              );

              return (
                <div
                  key={lesson.tempId}
                  className="ml-4 p-3 border rounded-lg space-y-2 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 text-sm border-b outline-none bg-transparent"
                      value={lesson.title}
                      onChange={(e) =>
                        updateItem(sec.tempId, lesson.tempId, {
                          title: e.target.value,
                        })
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(sec.tempId, lesson.tempId)
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>

                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={lesson.lessonType}
                    onChange={(e) =>
                      updateItem(sec.tempId, lesson.tempId, {
                        lessonType: e.target.value as "video" | "document",
                        contentUrl: "", // reset khi đổi type
                      })
                    }
                  >
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>

                  <input
                    className={`w-full text-sm border rounded px-2 py-1 ${
                      isInvalid ? "border-red-500" : ""
                    }`}
                    placeholder={
                      lesson.lessonType === "video"
                        ? "Video link (YouTube / MP4 / etc)"
                        : "Document link (.pdf, .docx, .pptx, .xlsx...)"
                    }
                    value={lesson.contentUrl || ""}
                    onChange={(e) =>
                      updateItem(sec.tempId, lesson.tempId, {
                        contentUrl: e.target.value,
                      })
                    }
                  />

                  {isInvalid && (
                    <p className="text-xs text-red-500">
                      {lesson.lessonType === "document"
                        ? "Document must be a valid file (.pdf, .docx, .pptx, .xlsx...)"
                        : "Video link is required"}
                    </p>
                  )}
                </div>
              );
            }

            /* ---------- EXAM ---------- */
            const exam = item as BuilderExam;

            return (
              <div
                key={exam.tempId}
                className="ml-4 p-3 border rounded-lg space-y-2 bg-orange-50"
              >
                <div className="flex items-center gap-2">
                  <input
                    className="flex-1 text-sm font-medium border-b outline-none bg-transparent"
                    value={exam.title}
                    onChange={(e) =>
                      updateItem(sec.tempId, exam.tempId, {
                        title: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(sec.tempId, exam.tempId)
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                <textarea
                  className="w-full text-sm border rounded px-2 py-1"
                  placeholder="Exam description"
                  value={exam.description || ""}
                  onChange={(e) =>
                    updateItem(sec.tempId, exam.tempId, {
                      description: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-3">
                  {/* Duration */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full text-sm border rounded px-2 py-1"
                      placeholder="No limit"
                      value={exam.durationMinutes ?? ""}
                      onChange={(e) =>
                        updateItem(sec.tempId, exam.tempId, {
                          durationMinutes: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>

                  {/* Pass percent */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Pass %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-full text-sm border rounded px-2 py-1"
                      value={exam.passPercent}
                      onChange={(e) =>
                        updateItem(sec.tempId, exam.tempId, {
                          passPercent: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>


                <button
                  type="button"
                  className="text-xs text-indigo-600 underline"
                  onClick={() =>
                    setActiveExam({
                      sectionTempId: sec.tempId,
                      examTempId: exam.tempId,
                      questions: exam.questions || [],
                    })
                  }
                >
                  Edit questions ({exam.questions?.length || 0})
                </button>
              </div>
            );
          })}

          {/* ===== ACTIONS ===== */}
          <div className="flex gap-3 ml-4">
            <button
              type="button"
              onClick={() => addLesson(sec.tempId)}
              className="text-sm text-indigo-600"
            >
              + Add lesson
            </button>

            <button
              type="button"
              onClick={() => addExam(sec.tempId)}
              className="text-sm text-orange-600"
            >
              + Add exam
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full border border-dashed rounded-lg py-3 text-sm text-gray-600"
      >
        + Add section
      </button>

      {/* ===== EXAM MODAL ===== */}
      {activeExam && (
        <ExamModal
          open
          value={activeExam.questions}
          onClose={() => setActiveExam(null)}
          onSave={(questions) => {
            updateItem(
              activeExam.sectionTempId,
              activeExam.examTempId,
              { questions }
            );
            setActiveExam(null);
          }}
        />
      )}
    </div>
  );
}
