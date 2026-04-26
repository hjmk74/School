import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [counts, setCounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/dashboard/top-students"),
      api.get("/teachers"),
      api.get("/dashboard/students-per-class"),
    ])
      .then(([summaryRes, topStudentsRes, teachersRes, countsRes]) => {
        setSummary(summaryRes.data);
        setTopStudents(topStudentsRes.data);
        setTeachers(teachersRes.data);
        setCounts(countsRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch dashboard data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-slate-700">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  const totalStudents = summary?.total_students || 0;
  const totalTeachers = summary?.total_teachers || 0;
  const schoolAvg = summary?.school_average || 0;

  return (
    <div className="space-y-8 text-base">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-600">Total Students</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalStudents}
          </p>
          <p className="mt-2 text-sm text-slate-600">All grades</p>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-600">Total Teachers</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {totalTeachers}
          </p>
          <p className="mt-2 text-sm text-slate-600">Active staff</p>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-600">School Average</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {schoolAvg}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Based on student averages
          </p>
        </div>

        <div className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-600">System Status</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-blue-600" />
            <p className="text-base font-semibold text-slate-900">
              Operational
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-600">API connected</p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 shadow-md">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Top Students
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Top students based on average
            </p>
          </div>

          <button className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
            View all
          </button>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto custom-scroll">
          <table className="w-full text-base">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="text-left font-semibold px-6 py-4">Student</th>
                <th className="text-left font-semibold px-6 py-4">Grade</th>
                <th className="text-right font-semibold px-6 py-4">Average</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {topStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {s.full_name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{s.class_name}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    {s.avgarge}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6 rounded-xl bg-white border border-slate-200 shadow-md">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Teachers</h2>
            <p className="text-sm text-slate-600 mt-1">Staff directory</p>
          </div>

          <div className="max-h-96 overflow-y-auto p-6 space-y-4 custom-scroll">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 text-base">
                      {t.full_name}
                    </p>
                    <p className="text-sm text-slate-700 mt-1">{t.subject}</p>
                  </div>
                  <span className="text-sm text-slate-600">ID: {t.id}</span>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Phone: {t.phone_number}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 rounded-xl bg-white border border-slate-200 shadow-md">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Students by Grade
            </h2>
            <p className="text-sm text-slate-600 mt-1">Distribution</p>
          </div>

          <div className="max-h-96 overflow-y-auto p-6 space-y-4 custom-scroll">
            {counts.map((c) => {
              const pct = totalStudents
                ? Math.round((c.total_students / totalStudents) * 100)
                : 0;

              return (
                <div
                  key={c.class_name}
                  className="rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {c.class_name}
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {c.total_students} students
                      </p>
                    </div>
                    <p className="text-base font-semibold text-slate-900">
                      {pct}%
                    </p>
                  </div>

                  <div className="mt-4 h-3 w-full rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
