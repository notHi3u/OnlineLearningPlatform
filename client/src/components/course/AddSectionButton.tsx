import { api } from "../../api/http";

export default function AddSectionButton({ courseId, onAdd }: any) {
    const add = async () => {
      const title = prompt("Section title?");
      if (!title) return;
  
      await api.post(`/courses/${courseId}/sections`, { title });
      onAdd();
    };
  
    return (
      <button
        onClick={add}
        className="w-full border border-dashed rounded-xl py-4
                   text-indigo-600 hover:bg-indigo-50"
      >
        + Add section
      </button>
    );
  }
  