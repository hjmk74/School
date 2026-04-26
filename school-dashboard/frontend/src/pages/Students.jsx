import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedExams, setSelectedExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [examLoading, setExamLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/students"), api.get("/classes")])
      .then(([studentsRes, classesRes]) => {
        setStudents(studentsRes.data);
        setClasses(classesRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch students data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getGradeName = (className) => {
    const found = classes.find((c) => c.classes_name === className);
    return found?.classes_name || className;
  };

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedId) || null,
    [students, selectedId],
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return students
      .filter((s) => (grade === "ALL" ? true : s.class === grade))
      .filter((s) =>
        query ? s.full_name.toLowerCase().includes(query) : true,
      );
  }, [students, q, grade]);

  const gradeOptions = useMemo(() => {
    return classes.map((c) => ({
      id: c.classes_name,
      name: c.classes_name,
    }));
  }, [classes]);

  const handleOpenGrades = (student) => {
    setSelectedId(student.id);
    setSelectedExams([]);
    setExamLoading(true);

    api
      .get(`/students/${student.id}/results`)
      .then((res) => {
        setSelectedExams(res.data);
      })
      .catch((err) => {
        console.error(err);
        setSelectedExams([]);
      })
      .finally(() => {
        setExamLoading(false);
      });
  };

  if (loading) {
    return <p className="text-slate-700">Loading students...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6 text-base">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student name..."
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

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filtered.length}
            </span>{" "}
            students
          </p>
          <p className="text-slate-500">
            Click a student name to view exam grades
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Students</h2>
          <span className="text-sm text-slate-600">
            {grade === "ALL" ? "All grades" : getGradeName(grade)}
          </span>
        </div>

        <div className="max-h-[calc(100vh-260px)] overflow-y-auto custom-scroll p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <button
                  onClick={() => handleOpenGrades(s)}
                  className="text-left w-full"
                >
                  <p className="text-lg font-semibold text-slate-900 hover:text-blue-700 transition-colors">
                    {s.full_name}
                  </p>
                </button>

                <div className="mt-3 space-y-2 text-base">
                  <p className="text-slate-700">
                    <span className="text-slate-500">Grade:</span>{" "}
                    {getGradeName(s.class)}
                  </p>

                  <p className="text-slate-700">
                    <span className="text-slate-500">Average:</span>{" "}
                    <span className="font-semibold text-slate-900">
                      {s.avgarge}
                    </span>
                  </p>

                  {s.phone_number ? (
                    <p className="text-slate-700">
                      <span className="text-slate-500">Phone:</span>{" "}
                      {s.phone_number}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-slate-600">ID: {s.id}</span>
                  <button
                    onClick={() => handleOpenGrades(s)}
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    View grades →
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center text-base text-slate-600">
                No students found.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedStudent}
        title={
          selectedStudent ? `${selectedStudent.full_name} — Exam Grades` : ""
        }
        onClose={() => {
          setSelectedId(null);
          setSelectedExams([]);
        }}
      >
        {selectedStudent ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-slate-900">
                  {getGradeName(selectedStudent.class)}
                </p>
                <p className="text-base text-slate-700">
                  Average:{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedStudent.avgarge}
                  </span>
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Student ID: {selectedStudent.id}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <p className="text-base font-semibold text-slate-900">Exams</p>
                <p className="text-sm text-slate-600">
                  {selectedExams.length} records
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto custom-scroll">
                {examLoading ? (
                  <p className="p-5 text-slate-600">Loading exam results...</p>
                ) : (
                  <table className="w-full text-base">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700">
                      <tr>
                        <th className="text-left font-semibold px-5 py-4">
                          Subject
                        </th>
                        <th className="text-left font-semibold px-5 py-4">
                          Date
                        </th>
                        <th className="text-right font-semibold px-5 py-4">
                          Mark
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {selectedExams.map((e) => (
                        <tr
                          key={e.exam_id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {e.subject}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {" "}
                            {new Date(e.date).toLocaleDateString("en-CA")}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold text-slate-900">
                            {e.mark} / 100
                          </td>
                        </tr>
                      ))}

                      {selectedExams.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-5 py-8 text-center text-base text-slate-600"
                          >
                            No exam results for this student yet.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
