// client/src/pages/courses/CreateCourse.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { useDialog } from "../../components/shared/DialogProvider";
import { useAuth } from "../../store/auth";

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showDialog({
        title: "Validation",
        message: "Title is required.",
        variant: "error",
      });
      return;
    }

    if (!user?.id) {
      showDialog({
        title: "Not authenticated",
        message: "You must be logged in to create a course.",
        variant: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      formData.append("isPublished", String(isPublished));
      formData.append("teacherId", user.id); // backend đang nhận teacherId từ body

      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      const res = await api.post("/courses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showDialog({
        title: "Course created",
        message: res.data.message || "Course has been created successfully.",
        variant: "success",
      });

      navigate("/courses");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Failed to create course. Please try again.";
      showDialog({
        title: "Error",
        message: msg,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Create New Course
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. React for Beginners"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[80px]"
              placeholder="Short summary of the course..."
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-gray-700 mb-1">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-gray-700"
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="mt-3 h-32 w-56 object-cover rounded-lg border"
              />
            )}
            <p className="mt-1 text-xs text-gray-500">
              Recommended ratio ~16:9. Max size depends on Cloudinary plan.
            </p>
          </div>

          {/* Published */}
          <div className="flex items-center space-x-2">
            <input
              id="isPublished"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="isPublished" className="text-gray-700">
              Publish this course
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
