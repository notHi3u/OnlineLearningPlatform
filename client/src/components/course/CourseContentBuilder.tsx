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

interface Props {
  courseId: string;
  value: BuilderSection[];
  onChange: (data: BuilderSection[]) => void;
}

export default function CourseContentBuilder({
  courseId,
  value,
  onChange,
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

  /* ===== EXAM MODAL STATE (single source of truth) ===== */
  const [activeExam, setActiveExam] = useState<{
    sectionTempId: string;
    examTempId: string;
    questions: ExamQuestion[];
  } | null>(null);

  /* sync lên parent */
  useEffect(() => {
    onChange(sections);
  }, [sections, onChange]);

  return (
    <div className="mt-10 space-y-6">
      <h2 className="text-xl font-semibold">Course Content</h2>

      {sections.map(sec => (
        <div
          key={sec.tempId}
          className="border rounded-xl p-4 bg-white space-y-3"
        >
          {/* ===== SECTION HEADER ===== */}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 font-semibold border-b outline-none"
              value={sec.title}
              onChange={e =>
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

              return (
                <div
                  key={lesson.tempId}
                  className="ml-4 p-3 border rounded-lg space-y-2 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 text-sm border-b outline-none bg-transparent"
                      value={lesson.title}
                      onChange={e =>
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
                    onChange={e =>
                      updateItem(sec.tempId, lesson.tempId, {
                        lessonType: e.target.value as "video" | "pdf",
                      })
                    }
                  >
                    <option value="video">Video (YouTube)</option>
                    <option value="pdf">PDF</option>
                  </select>

                  <input
                    className="w-full text-sm border rounded px-2 py-1"
                    placeholder={
                      lesson.lessonType === "video"
                        ? "YouTube link"
                        : "Google Drive PDF link"
                    }
                    value={lesson.contentUrl || ""}
                    onChange={e =>
                      updateItem(sec.tempId, lesson.tempId, {
                        contentUrl: e.target.value,
                      })
                    }
                  />
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
                    onChange={e =>
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
                  onChange={e =>
                    updateItem(sec.tempId, exam.tempId, {
                      description: e.target.value,
                    })
                  }
                />

                {/* ===== EDIT QUESTIONS ===== */}
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
