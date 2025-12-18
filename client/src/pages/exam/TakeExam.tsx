import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useDialog } from "../../components/shared/DialogProvider";

interface ExamOptionUI {
  index: number;
  text: string;
}

interface ExamQuestionUI {
  id: string;
  question: string;
  options: ExamOptionUI[];
  selectedIndexes: number[];
}

export default function TakeExam() {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(1);
  const [questions, setQuestions] = useState<ExamQuestionUI[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showDialog } = useDialog();

  useEffect(() => {
    if (!examId) return;
  
    const load = async () => {
      try {
        const res = await api.get(`/user-exams/${examId}/active`);
        const exam = res.data;
  
        setAttempt(exam.attempt);
        setTotalScore(exam.totalScore);
        setCourseId(exam.course);
        setDuration(exam.durationMinutes ?? null);
  
        setQuestions(
          exam.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            selectedIndexes: [],
          }))
        );
      } catch {
        alert("Cannot load exam");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
  
    load();
  }, [examId, navigate]);
  

  const toggleAnswer = (qid: string, idx: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === qid
          ? {
              ...q,
              selectedIndexes: q.selectedIndexes.includes(idx)
                ? q.selectedIndexes.filter(i => i !== idx)
                : [...q.selectedIndexes, idx],
            }
          : q
      )
    );
  };

  const submit = () => {
    if (!examId || !courseId) return;
  
    showDialog({
      title: "Submit exam",
      message:
        "Are you sure you want to submit?\nYou cannot change answers after this.",
      variant: "warning",
      confirmLabel: "Submit",
      cancelLabel: "Cancel",
      onConfirm: async () => {
        setSubmitting(true);
        try {
          await api.post(`/user-exams/${examId}/submit`, {
            attempt,
            answers: questions.map(q => ({
              questionId: q.id,
              selectedOptionIndexes: q.selectedIndexes,
            })),
          });
  
          navigate(`/courses/${courseId}`);
        } catch {
          showDialog({
            title: "Error",
            message: "Submit failed. Please try again.",
            variant: "error",
          });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Loading exam...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Exam ({totalScore} pts)
      </h1>

      {duration && (
        <p className="text-sm text-gray-500">
          ⏱ Time limit: {duration} minutes
        </p>
      )}

      {questions.map((q, i) => (
        <div key={q.id} className="border rounded-lg p-4 space-y-2">
          <p className="font-medium">
            {i + 1}. {q.question}
          </p>

          {q.options.map(o => (
            <label key={o.index} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={q.selectedIndexes.includes(o.index)}
                onChange={() => toggleAnswer(q.id, o.index)}
              />
              {o.text}
            </label>
          ))}
        </div>
      ))}

      <button
        disabled={submitting}
        onClick={submit}
        className="px-6 py-2 bg-indigo-600 text-white rounded
                   hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit exam"}
      </button>
    </div>
  );
}
