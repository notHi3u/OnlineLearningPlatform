import { useEffect, useState } from "react";
import { api } from "../../api/http";

interface ExamHistoryItem {
  courseId: string;
  courseTitle: string;
  examId: string;
  examTitle: string;
  attempt: number;
  achievedScore: number;
  totalScore: number;
  percent: number;
  passPercent: number;
  passed: boolean;
  submittedAt: string;
}

export default function ExamHistory() {
  const [items, setItems] = useState<ExamHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState({
    page: 1,
    limit: 8,
    totalPages: 1,
    total: 0,
  });

  const load = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const res = await api.get(
        `/user-exams/history?page=${page}&limit=${data.limit}&search=${encodeURIComponent(
          search
        )}`
      );

      setItems(res.data.items || []);
      setData({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        totalPages: res.data.totalPages,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, keyword);
  }, []);

  if (loading)
    return <p className="p-6 text-gray-500">Loading history...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Exam History</h1>

      {/* Search */}
      <div className="flex gap-2 items-center">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search course or exam..."
          className="w-full max-w-md border rounded px-3 py-2 text-sm"
        />

        <button
          onClick={() => load(1, keyword)}
          className="px-4 py-2 border rounded text-sm hover:bg-gray-100"
        >
          Search
        </button>

        {keyword && (
          <button
            onClick={() => {
              setKeyword("");
              load(1, "");
            }}
            className="text-sm px-3 py-2 border rounded hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {!items.length && (
        <p className="text-gray-500">No exam history yet.</p>
      )}

      <div className="space-y-4">
        {items.map((x, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between"
          >
            <div>
              <p className="font-semibold">{x.courseTitle}</p>

              <p className="text-sm text-gray-600">📝 {x.examTitle}</p>

              <p className="text-xs text-gray-500 mt-1">
                Attempt #{x.attempt} —{" "}
                {new Date(x.submittedAt).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                {x.achievedScore}/{x.totalScore}
              </p>

              <p
                className={`text-sm font-semibold ${
                  x.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {x.percent}% (Pass: {x.passPercent}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {data.totalPages && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            disabled={data.page === 1}
            onClick={() => load(data.page - 1, keyword)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => load(p, keyword)}
                className={`px-3 py-1 border rounded text-sm ${
                  p === data.page
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={data.page === data.totalPages}
            onClick={() => load(data.page + 1, keyword)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
