import { api } from "../../api/http";

export default function AddLessonButton({ sectionId }: { sectionId: string }) {
  const add = async () => {
    const title = prompt("Lesson title?");
    if (!title) return;

    await api.post(`/sections/${sectionId}/lessons`, {
      title,
      type: "video",
    });

    window.location.reload(); // tạm, day 3 ok
  };

  return (
    <button className="text-sm text-indigo-600 hover:underline">
      + Add lesson
    </button>
  );
}
