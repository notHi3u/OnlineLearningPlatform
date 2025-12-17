export default function LessonItem({
  lesson,
  index,
  sectionIndex,
  canViewLink,
  mode,
}: {
  lesson: any;
  index: number;
  sectionIndex: number;
  canViewLink: boolean;
  mode: "view" | "edit";
}) {
  return (
    <div className="rounded-lg border bg-gray-50 px-3 py-2">
      {/* TITLE */}
      <div className="text-sm font-medium">
        {sectionIndex + 1}.{index + 1} {lesson.title}
      </div>

      {/* 🔓 LINK: chỉ teacher(owner) + admin */}
      {mode === "view" && canViewLink && lesson.contentUrl && (
        <a
          href={lesson.contentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-indigo-600 hover:underline"
        >
          {lesson.type === "video"
            ? "▶ Watch video"
            : "📄 Open PDF"}
        </a>
      )}
    </div>
  );
}
