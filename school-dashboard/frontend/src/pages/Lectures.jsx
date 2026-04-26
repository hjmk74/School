import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function Lectures() {
  const [lectures, setLectures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [grade, setGrade] = useState("ALL");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/lectures"),
      api.get("/classes"),
      api.get("/teachers"),
    ])
      .then(([lecturesRes, classesRes, teachersRes]) => {
        setLectures(lecturesRes.data);
        setClasses(classesRes.data);
        setTeachers(teachersRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch lectures data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const gradeName = (className) => {
    const found = classes.find((c) => c.classes_name === className);
    return found?.classes_name || className;
  };

  const teacherName = (teacherId) => {
    const found = teachers.find((t) => String(t.id) === String(teacherId));
    return found?.full_name || "Unknown teacher";
  };

  const formatDays = (days) => {
    if (!days) return "-";
    return days;
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return lectures
      .filter((l) => (grade === "ALL" ? true : l.class_name === grade))
      .filter((l) => (query ? l.title?.toLowerCase().includes(query) : true));
  }, [lectures, grade, q]);

  const gradeOptions = useMemo(() => {
    return classes.map((c) => ({
      id: c.classes_name,
      name: c.classes_name,
    }));
  }, [classes]);

  if (loading) {
    return <p className="text-slate-700">Loading lectures...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6 text-base">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-12 lg:col-span-7">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lecture title..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-blue-300"
            />
          </div>

          <div className="col-span-12 lg:col-span-5">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-blue-300"
            >
              <option value="ALL">All Grades</option>
              {gradeOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>{" "}
            lectures
          </p>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
            {grade === "ALL" ? "All grades" : gradeName(grade)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Lectures</h2>
          <span className="text-sm text-slate-600">API data</span>
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-y-auto custom-scroll p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-slate-900 truncate">
                    {l.title}
                  </p>

                  <div className="mt-3 text-base text-slate-700 space-y-2">
                    <p>
                      <span className="text-slate-500">Teacher:</span>{" "}
                      {teacherName(l.teacher_id)}
                    </p>

                    <p>
                      <span className="text-slate-500">Grade:</span>{" "}
                      {gradeName(l.class_name)}
                    </p>

                    <p>
                      <span className="text-slate-500">Subject:</span>{" "}
                      {l.subjects || "-"}
                    </p>

                    <p>
                      <span className="text-slate-500">Days:</span>{" "}
                      {formatDays(l.days)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-sm text-slate-600">ID: {l.id}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {l.class_name}
                  </span>
                </div>
              </div>
            ))}

            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center text-base text-slate-600">
                No lectures found.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
