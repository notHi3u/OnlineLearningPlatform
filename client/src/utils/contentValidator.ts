import type { BuilderSection, BuilderItem } from "../hooks/useCourseBuilder";

const YOUTUBE_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/i;

export function validateCourseContent(sections: BuilderSection[]) {
  const errors: string[] = [];

  if (!Array.isArray(sections)) return errors;

  sections.forEach((sec, si) => {
    if (!Array.isArray(sec.items)) return;

    sec.items.forEach((item: BuilderItem, ii) => {
      // ✅ CHỈ CHECK LESSON VIDEO
      if (item.kind !== "lesson") return;
      if (item.lessonType !== "video") return;
      if (!item.contentUrl) return;

      if (!YOUTUBE_REGEX.test(item.contentUrl)) {
        errors.push(
          `Section ${si + 1} - Item ${ii + 1}: Invalid YouTube link`
        );
      }
    });
  });

  return errors;
}
