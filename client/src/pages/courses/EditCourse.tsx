import React, { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useAuth } from "../../store/auth";
import { useDialog } from "../../components/shared/DialogProvider";
import CourseContentBuilder from "../../components/course/CourseContentBuilder";
import { validateCourseContent } from "../../utils/contentValidator";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  isPublished: boolean;
  teacher?: Teacher;
}

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showDialog } = useDialog();

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [content, setContent] = useState<any[]>([]); // 🔥 builder content

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  /* ================= LOAD COURSE ================= */
  const loadCourse = async () => {
    if (!id) return;
  
    try {
      const [courseRes, contentRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/content`), // 🔥 ADD
      ]);
  
      const data: Course = courseRes.data;
  
      setCourse(data);
      setTitle(data.title);
      setDescription(data.description || "");
      setIsPublished(data.isPublished);
      setThumbnailUrl(data.thumbnail);
  
      setContent(contentRes.data); // 🔥 SET BUILDER DATA
  
      if (user) {
        const isOwner =
          user.role === "teacher" &&
          data.teacher?._id === user.id;
  
        if (user.role !== "admin" && !isOwner) {
          setForbidden(true);
        }
      }
    } catch {
      showDialog({
        title: "Error",
        message: "Failed to load course",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    loadCourse();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !course) return;

    // 🔥 VALIDATE YOUTUBE LINKS
  const errors = validateCourseContent(content);
  if (errors.length) {
    showDialog({
      title: "Invalid YouTube link",
      message: errors.join("\n"),
      variant: "error",
    });
    return;
  }
  
    try {
      setSaving(true);
  
      // 1️⃣ save course meta
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("isPublished", String(isPublished));
  
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }
  
      await api.put(`/courses/${id}`, formData);
  
      // 2️⃣ save builder content
      await api.put(`/courses/${id}/builder`, {
        sections: content,
      });
  
      showDialog({
        title: "Saved",
        message: "Course updated successfully",
        variant: "success",
      });
  
      navigate(`/courses/${id}`);
    } catch (err) {
      showDialog({
        title: "Error",
        message: "Failed to save course",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };  

  /* ================= UI ================= */
  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (forbidden || !course) {
    return <div className="text-center py-20">Forbidden</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-xl shadow"
      >
        {/* Title */}
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description */}
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Publish */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Published
        </label>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail
          </label>

          <div className="flex items-center gap-6">
            {/* Preview box */}
            <label
              htmlFor="thumbnail"
              className="group relative w-64 h-36 rounded-xl overflow-hidden
                        bg-gray-100 cursor-pointer border border-dashed
                        border-gray-300 hover:border-indigo-500 transition"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                />
              ) : thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                                text-sm text-gray-400">
                  No thumbnail
                </div>
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40 opacity-0
                          group-hover:opacity-100 transition
                          flex items-center justify-center
                          text-white text-sm font-medium"
              >
                Change thumbnail
              </div>
            </label>

            {/* Hidden input */}
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />

            {/* Hint */}
            <div className="text-xs text-gray-500 leading-relaxed">
              Click image to upload new thumbnail.<br />
              Recommended ratio: <b>16:9</b>
            </div>
          </div>
        </div>
              
        {/* 🔥 Course Builder */}
        <CourseContentBuilder
          courseId={id!}
          value={content}
          onChange={setContent}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
