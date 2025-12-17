import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";

/* ================= TYPES ================= */

export interface ExamOption {
  tempId: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  tempId: string;
  question: string;
  options: ExamOption[];
}

interface Props {
  open: boolean;
  value: ExamQuestion[];
  onClose: () => void;
  onSave: (questions: ExamQuestion[]) => void;
  readOnly?: boolean;
}

/* ================= COMPONENT ================= */

export default function ExamModal({
  open,
  value,
  onClose,
  onSave,
  readOnly = false,
}: Props) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* hydrate khi mở modal */
  useEffect(() => {
    if (open) {
      setQuestions(value || []);
      setError(null);
    }
  }, [open, value]);

  if (!open) return null;

  /* ================= QUESTION ================= */

  const addQuestion = () => {
    setQuestions(qs => [
      ...qs,
      {
        tempId: crypto.randomUUID(),
        question: "",
        options: [
          {
            tempId: crypto.randomUUID(),
            text: "",
            isCorrect: false,
          },
          {
            tempId: crypto.randomUUID(),
            text: "",
            isCorrect: false,
          },
        ],
      },
    ]);
  };

  const updateQuestion = (qid: string, text: string) => {
    setQuestions(qs =>
      qs.map(q =>
        q.tempId === qid ? { ...q, question: text } : q
      )
    );
  };

  const removeQuestion = (qid: string) => {
    setQuestions(qs => qs.filter(q => q.tempId !== qid));
  };

  /* ================= OPTION ================= */

  const addOption = (qid: string) => {
    setQuestions(qs =>
      qs.map(q =>
        q.tempId === qid
          ? {
              ...q,
              options: [
                ...q.options,
                {
                  tempId: crypto.randomUUID(),
                  text: "",
                  isCorrect: false,
                },
              ],
            }
          : q
      )
    );
  };

  const updateOption = (
    qid: string,
    oid: string,
    data: Partial<ExamOption>
  ) => {
    setQuestions(qs =>
      qs.map(q =>
        q.tempId === qid
          ? {
              ...q,
              options: q.options.map(o =>
                o.tempId === oid ? { ...o, ...data } : o
              ),
            }
          : q
      )
    );
  };

  const removeOption = (qid: string, oid: string) => {
    setQuestions(qs =>
      qs.map(q =>
        q.tempId === qid
          ? {
              ...q,
              options: q.options.filter(o => o.tempId !== oid),
            }
          : q
      )
    );
  };

  /* ================= VALIDATE ================= */

  const validate = (): boolean => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (q.options.length < 2) {
        setError(`Question ${i + 1} must have at least 2 answers`);
        return false;
      }

      const hasCorrect = q.options.some(o => o.isCorrect);
      if (!hasCorrect) {
        setError(`Question ${i + 1} must have at least 1 correct answer`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!validate()) return;
    onSave(questions);
    onClose();
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {readOnly ? "Exam Questions" : "Edit Exam Questions"}
          </h2>
          <button type="button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* ERROR */}
        {error && !readOnly && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {questions.map((q, qi) => (
            <div
              key={q.tempId}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Question */}
              <div className="flex gap-2">
                <input
                  disabled={readOnly}
                  className="flex-1 border-b outline-none disabled:bg-transparent"
                  placeholder={`Question ${qi + 1}`}
                  value={q.question}
                  onChange={e =>
                    updateQuestion(q.tempId, e.target.value)
                  }
                />

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.tempId)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="ml-4 space-y-2">
                {q.options.map((o, oi) => (
                  <div
                    key={o.tempId}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={o.isCorrect}
                      onChange={e =>
                        updateOption(q.tempId, o.tempId, {
                          isCorrect: e.target.checked,
                        })
                      }
                    />

                    <input
                      disabled={readOnly}
                      className="flex-1 border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                      placeholder={`Option ${oi + 1}`}
                      value={o.text}
                      onChange={e =>
                        updateOption(q.tempId, o.tempId, {
                          text: e.target.value,
                        })
                      }
                    />

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          removeOption(q.tempId, o.tempId)
                        }
                        className="text-red-500"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => addOption(q.tempId)}
                    className="text-xs text-indigo-600"
                  >
                    + Add option
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4">
          {!readOnly && (
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 text-sm text-indigo-600"
            >
              <FaPlus /> Add question
            </button>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-sm"
            >
              Close
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
