import { useEffect, useRef, useState } from "react";
import { api } from "../api/http";

/* ================= TYPES ================= */

export type BuilderItemType = "lesson" | "exam";

/* ---------- LESSON ---------- */
export interface BuilderLesson {
  id?: string;
  tempId: string;
  kind: "lesson";
  title: string;
  lessonType: "video" | "pdf";
  contentUrl?: string;
  order: number;
}

/* ---------- EXAM ---------- */
export interface BuilderExam {
  id?: string;
  tempId: string;
  kind: "exam";
  title: string;
  description?: string;
  totalScore: number;
  order: number;
  questions: ExamQuestion[];
}

/* ---------- UNION ---------- */
export type BuilderItem = BuilderLesson | BuilderExam;

/* ---------- SECTION ---------- */
export interface BuilderSection {
  id?: string;
  tempId: string;
  title: string;
  order: number;
  items: BuilderItem[];
}

/* ---------- EXAM QUESTION ---------- */
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

/* ================= HOOK ================= */

export function useCourseBuilder(
  courseId: string,
  value?: BuilderSection[]
) {
  const [sections, setSections] = useState<BuilderSection[]>([]);
  const [saving, setSaving] = useState(false);

  const hydratedRef = useRef(false);

  /* ================= HYDRATE FROM BACKEND ================= */
  useEffect(() => {
    if (!value || hydratedRef.current) return;

    const hydrate = async () => {
      const result: BuilderSection[] = [];

      for (const [si, s] of value.entries()) {
        const items: BuilderItem[] = [];

        const examItems = (s.items ?? []).filter(
          i => i.kind === "exam" && i.id
        ) as BuilderExam[];

        /* 🔥 load all exam questions in parallel */
        const examQuestionMap = new Map<string, ExamQuestion[]>();

        await Promise.all(
          examItems.map(async exam => {
            const res = await api.get(`/exams/${exam.id}/questions`);
            examQuestionMap.set(
              exam.id!,
              res.data.map((q: any) => ({
                tempId: crypto.randomUUID(),
                question: q.question,
                options: q.options.map((o: any) => ({
                  tempId: crypto.randomUUID(),
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              }))
            );
          })
        );

        for (const [ii, it] of (s.items ?? []).entries()) {
          /* ---------- EXAM ---------- */
          if (it.kind === "exam") {
            items.push({
              id: it.id,
              tempId: crypto.randomUUID(),
              kind: "exam",
              title: it.title,
              description: it.description,
              totalScore: it.totalScore ?? 1,
              order: it.order ?? ii + 1,
              questions: it.id
                ? examQuestionMap.get(it.id) ?? []
                : [],
            });
            continue;
          }

          /* ---------- LESSON ---------- */
          items.push({
            id: it.id,
            tempId: crypto.randomUUID(),
            kind: "lesson",
            title: it.title,
            lessonType: it.lessonType,
            contentUrl: it.contentUrl,
            order: it.order ?? ii + 1,
          });
        }

        result.push({
          id: s.id,
          tempId: crypto.randomUUID(),
          title: s.title,
          order: s.order ?? si + 1,
          items,
        });
      }

      setSections(result);
      hydratedRef.current = true;
    };

    hydrate();
  }, [value]);

  /* ================= ADD ================= */

  const addSection = () => {
    setSections(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        title: "New section",
        order: prev.length + 1,
        items: [],
      },
    ]);
  };

  const addLesson = (sectionTempId: string) => {
    setSections(prev =>
      prev.map(sec =>
        sec.tempId === sectionTempId
          ? {
              ...sec,
              items: [
                ...sec.items,
                {
                  tempId: crypto.randomUUID(),
                  kind: "lesson",
                  title: "New lesson",
                  lessonType: "video",
                  contentUrl: "",
                  order: sec.items.length + 1,
                },
              ],
            }
          : sec
      )
    );
  };

  const addExam = (sectionTempId: string) => {
    setSections(prev =>
      prev.map(sec =>
        sec.tempId === sectionTempId
          ? {
              ...sec,
              items: [
                ...sec.items,
                {
                  tempId: crypto.randomUUID(),
                  kind: "exam",
                  title: "New exam",
                  description: "",
                  totalScore: 1,
                  order: sec.items.length + 1,
                  questions: [],
                },
              ],
            }
          : sec
      )
    );
  };

  /* ================= UPDATE ================= */

  const updateSectionTitle = (tempId: string, title: string) => {
    setSections(prev =>
      prev.map(sec =>
        sec.tempId === tempId ? { ...sec, title } : sec
      )
    );
  };

  const updateItem = (
    sectionTempId: string,
    itemTempId: string,
    data: Partial<BuilderLesson> | Partial<BuilderExam>
  ) => {
    setSections(prev =>
      prev.map(sec =>
        sec.tempId === sectionTempId
          ? {
              ...sec,
              items: sec.items.map(it =>
                it.tempId === itemTempId
                  ? ({ ...it, ...data, kind: it.kind } as BuilderItem)
                  : it
              ),
            }
          : sec
      )
    );
  };

  /* ================= REMOVE ================= */

  const removeSection = (sectionTempId: string) => {
    setSections(prev =>
      prev
        .filter(sec => sec.tempId !== sectionTempId)
        .map((sec, i) => ({ ...sec, order: i + 1 }))
    );
  };

  const removeItem = (sectionTempId: string, itemTempId: string) => {
    setSections(prev =>
      prev.map(sec =>
        sec.tempId === sectionTempId
          ? {
              ...sec,
              items: sec.items
                .filter(it => it.tempId !== itemTempId)
                .map((it, i) => ({ ...it, order: i + 1 })),
            }
          : sec
      )
    );
  };

  /* ================= SAVE ================= */

  const saveContent = async () => {
    try {
      setSaving(true);

      const payload = {
        sections: sections.map((s, si) => ({
          id: s.id,
          title: s.title,
          order: si + 1,
          items: s.items.map((it, ii) => ({
            ...it,
            order: ii + 1,
          })),
        })),
      };

      await api.put(`/courses/${courseId}/builder`, payload);
    } finally {
      setSaving(false);
    }
  };

  return {
    sections,
    setSections,
    addSection,
    addLesson,
    addExam,
    updateSectionTitle,
    updateItem,
    removeItem,
    removeSection,
    saveContent,
    saving,
  };
}
