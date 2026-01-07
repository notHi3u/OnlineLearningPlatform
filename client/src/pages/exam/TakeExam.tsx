import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useDialog } from "../../components/shared/DialogProvider";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

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

interface ExamResult {
  attempt: number;
  achievedScore: number;
  totalScore: number;
  passPercent: number;
  passed: boolean;
  submittedAt: string;
}

export default function TakeExam() {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [attempt, setAttempt] = useState(1);
  const [questions, setQuestions] = useState<ExamQuestionUI[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [courseId, setCourseId] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Timer state
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timeWarning, setTimeWarning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Result state for submitted exams
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Load exam
  useEffect(() => {
    if (!examId) return;
  
    const load = async () => {
      try {
        const res = await api.get(`/user-exams/${examId}/active`);
        const data = res.data;
  
        // Check if already submitted
        if (data.alreadySubmitted) {
          setAlreadySubmitted(true);
          setExamResult({
            attempt: data.attempt,
            achievedScore: data.achievedScore,
            totalScore: data.totalScore,
            passPercent: data.passPercent,
            passed: data.achievedScore / data.totalScore * 100 >= data.passPercent,
            submittedAt: data.submittedAt,
          });
          setLoading(false);
          return;
        }
  
        setAttempt(data.attempt);
        setTotalScore(data.totalScore);
        setCourseId(data.course);
        setDuration(data.durationMinutes ?? null);
        setRemainingMinutes(data.remainingMinutes ?? 0);
        setRemainingSeconds(data.remainingSeconds ?? 0);
  
        setQuestions(
          data.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            selectedIndexes: [],
          }))
        );
      } catch (err: any) {
        console.error("Failed to load exam:", err);
        if (err.response?.status === 403 || err.response?.status === 400) {
          // Try to get exam status
          try {
            const statusRes = await api.get(`/user-exams/${examId}/status`);
            if (statusRes.data.hasExam && statusRes.data.status === "submitted") {
              setAlreadySubmitted(true);
              setExamResult({
                attempt: statusRes.data.attempt,
                achievedScore: statusRes.data.achievedScore,
                totalScore: statusRes.data.totalScore,
                passPercent: statusRes.data.passPercent,
                passed: statusRes.data.achievedScore / statusRes.data.totalScore * 100 >= statusRes.data.passPercent,
                submittedAt: statusRes.data.submittedAt,
              });
            }
          } catch (statusErr) {
            showDialog({
              title: "Error",
              message: "Cannot access this exam. You may have already completed it.",
              variant: "error",
            });
            navigate(-1);
          }
        } else {
          showDialog({
            title: "Error",
            message: "Cannot load exam. Please try again.",
            variant: "error",
          });
          navigate(-1);
        }
      } finally {
        setLoading(false);
      }
    };
  
    load();
  }, [examId, navigate, showDialog]);

  // Timer effect
  useEffect(() => {
    if (alreadySubmitted || loading || (duration === 0)) return;

    const updateTimer = () => {
      setRemainingMinutes(prev => {
        if (prev === 0 && remainingSeconds === 0) {
          // Auto submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev;
      });
      
      setRemainingSeconds(prev => {
        if (prev > 0) return prev - 1;
        if (remainingMinutes > 0) return 59;
        return 0;
      });

      // Warning when less than 1 minute
      setTimeWarning(remainingMinutes === 0 && remainingSeconds <= 60);
    };

    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [remainingMinutes, remainingSeconds, loading, alreadySubmitted, duration]);

  // Auto submit function
  const handleAutoSubmit = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    showDialog({
      title: "Time's Up!",
      message: "Your time has expired. Submitting your current answers...",
      variant: "warning",
    });

    await performSubmit();
  }, [questions, attempt, examId, courseId, navigate, showDialog]);

  const performSubmit = async () => {
    if (!examId || !courseId) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/user-exams/${examId}/submit`, {
        attempt,
        answers: questions.map(q => ({
          questionId: q.id,
          selectedOptionIndexes: q.selectedIndexes,
        })),
      });

      // Show result
      const result = res.data;
      showDialog({
        title: result.passed ? "Congratulations! 🎉" : "Exam Submitted",
        message: `Score: ${result.achievedScore}/${result.totalScore} (${Math.round(result.achievedScore/result.totalScore*100)}%)\nPass: ${result.passPercent}%`,
        variant: result.passed ? "success" : "info",
      });

      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      console.error("Submit failed:", err);
      showDialog({
        title: "Error",
        message: "Failed to submit exam. Please try again.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  const validateAndSubmit = () => {
    // Check for empty answers
    const unansweredCount = questions.filter(q => q.selectedIndexes.length === 0).length;
    
    if (unansweredCount > 0) {
      showDialog({
        title: "Unanswered Questions",
        message: `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`,
        variant: "warning",
        confirmLabel: "Submit Anyway",
        cancelLabel: "Continue Editing",
        onConfirm: () => performSubmit(),
      });
      return;
    }

    showDialog({
      title: "Submit Exam",
      message: "Are you sure you want to submit? You cannot change answers after this.",
      variant: "warning",
      confirmLabel: "Submit",
      cancelLabel: "Cancel",
      onConfirm: () => performSubmit(),
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show result if already submitted
  if (alreadySubmitted && examResult) {
    const percent = Math.round(examResult.achievedScore / examResult.totalScore * 100);
    
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="mb-6">
            {examResult.passed ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {examResult.passed ? "Congratulations! 🎉" : "Exam Completed"}
          </h1>
          
          <p className="text-gray-600 mb-6">
            Submitted on {new Date(examResult.submittedAt).toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Score</p>
              <p className="text-3xl font-bold">
                {examResult.achievedScore}/{examResult.totalScore}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Percentage</p>
              <p className={`text-3xl font-bold ${examResult.passed ? "text-green-600" : "text-red-600"}`}>
                {percent}%
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Pass requirement: {examResult.passPercent}%
          </p>

          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (mins: number, secs: number) => {
    const m = mins.toString().padStart(2, "0");
    const s = secs.toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = questions.filter(q => q.selectedIndexes.length > 0).length;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header with timer */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-semibold">
          Exam ({totalScore} pts)
        </h1>

        {duration !== 0 && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeWarning 
              ? "bg-red-100 text-red-700 animate-pulse" 
              : "bg-gray-100 text-gray-700"
          }`}>
            <Clock size={20} />
            <span className="font-mono text-xl font-bold">
              {formatTime(remainingMinutes, remainingSeconds)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">
          Answered: {answeredCount}/{questions.length}
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q.id} className="border rounded-lg p-4 space-y-2">
          <p className="font-medium">
            {i + 1}. {q.question}
          </p>

          {q.options.map(o => (
            <label 
              key={o.index} 
              className={`flex gap-2 text-sm cursor-pointer p-2 rounded ${
                q.selectedIndexes.includes(o.index) 
                  ? "bg-indigo-50 border-indigo-200" 
                  : "hover:bg-gray-50"
              }`}
            >
              <input
                type="checkbox"
                checked={q.selectedIndexes.includes(o.index)}
                onChange={() => toggleAnswer(q.id, o.index)}
                className="mt-0.5"
              />
              <span>{o.text}</span>
            </label>
          ))}
        </div>
      ))}

      {/* Warning if unanswered */}
      {answeredCount < questions.length && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertTriangle size={16} />
          <span>You have {questions.length - answeredCount} unanswered question(s)</span>
        </div>
      )}

      {/* Submit button */}
      <button
        disabled={submitting}
        onClick={validateAndSubmit}
        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium
                   hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {submitting ? "Submitting..." : "Submit Exam"}
      </button>
    </div>
  );
}
