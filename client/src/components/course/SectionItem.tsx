import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LessonItem from "./LessonItem";
import AddLessonButton from "./AddLessonButton";

export default function SectionItem({
  section,
  index,
  mode,
  canViewLink, // ✅ ADD
}: {
  section: any;
  index: number;
  mode: "view" | "edit";
  canViewLink: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border bg-white p-4 space-y-3"
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between">
        <h3
          {...attributes}
          {...listeners}
          className="font-semibold cursor-grab"
        >
          {index + 1}. {section.title}
        </h3>

        {mode === "edit" && <AddLessonButton sectionId={section._id} />}
      </div>

      {/* LESSONS */}
      <div className="space-y-2">
        {section.lessons.map((l: any, i: number) => (
          <LessonItem
            key={l._id}
            lesson={l}
            index={i}
            sectionIndex={index}
            canViewLink={canViewLink}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}
