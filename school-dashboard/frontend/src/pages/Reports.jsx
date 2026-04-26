import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function BarRow({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-slate-700">{label}</div>

      <div className="flex-1">
        <div className="h-3 w-full rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-blue-700 transition-all duration-500"
            style={{ width: `${safeValue}%` }}
          />
        </div>
      </div>

      <div className="w-16 text-right text-sm font-semibold text-slate-900">
        {safeValue}%
      </div>
    </div>
  );
}

export default function Reports() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [passRate, setPassRate] = useState(0);

  const [grade, setGrade] = useState("ALL");
  const [tab, setTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/classes"),
      api.get("/dashboard/exam-performance"),
      api.get("/dashboard/pass-rate"),
    ])
      .then(([classesRes, performanceRes, passRateRes]) => {
        setClasses(classesRes.data);
        setExams(performanceRes.data);
        setPassRate(passRateRes.data.pass_rate || 0);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch reports");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) =>
      grade === "ALL" ? true : exam.class_name === grade,
    );
  }, [exams, grade]);

  const summary = useMemo(() => {
    if (!filteredExams.length) {
      return {
        average: 0,
        pass: passRate,
        count: 0,
      };
    }

    const average =
      filteredExams.reduce(
        (acc, exam) => acc + (Number(exam.average_score) || 0),
        0,
      ) / filteredExams.length;

    return {
      average: Math.round(average),
      pass: Math.round(passRate),
      count: filteredExams.length,
    };
  }, [filteredExams, passRate]);

  if (loading) {
    return <p className="text-slate-700">Loading reports...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6 text-base">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTab("overview")}
              className={`h-11 px-5 rounded-xl text-base font-semibold border transition-all ${
                tab === "overview"
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setTab("exams")}
              className={`h-11 px-5 rounded-xl text-base font-semibold border transition-all ${
                tab === "exams"
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Exam List
            </button>
          </div>

          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="h-11 w-60 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-blue-300"
          >
            <option value="ALL">All Grades</option>
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.classes_name}>
                {classItem.classes_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <p>
            Exams:{" "}
            <span className="font-semibold text-slate-900">
              {summary.count}
            </span>
          </p>

          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
            {grade === "ALL" ? "All Grades" : grade}
          </span>
        </div>
      </div>

      {tab === "overview" ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900">
              Overall Performance
            </h3>
            <p className="text-sm text-slate-600 mt-1">Average and pass rate</p>

            <div className="mt-6 space-y-4">
              <BarRow label="Average" value={summary.average} />
              <BarRow label="Pass rate" value={summary.pass} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900">
              Quick Stats
            </h3>
            <p className="text-sm text-slate-600 mt-1">Useful indicators</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Selected grade</p>
                <p className="text-base font-semibold text-slate-900">
                  {grade === "ALL" ? "All Grades" : grade}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Exams in view</p>
                <p className="text-base font-semibold text-slate-900">
                  {summary.count}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Data mode</p>
                <p className="text-base font-semibold text-slate-900">API</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "exams" ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Exam List</h3>
            <p className="text-sm text-slate-600">
              {filteredExams.length} exams
            </p>
          </div>

          <div className="max-h-[calc(100vh-290px)] overflow-y-auto custom-scroll">
            <table className="w-full text-base">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left font-semibold px-6 py-4">Subject</th>
                  <th className="text-left font-semibold px-6 py-4">Grade</th>
                  <th className="text-left font-semibold px-6 py-4">
                    Total Mark
                  </th>
                  <th className="text-right font-semibold px-6 py-4">
                    Average
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.exam_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {exam.subject}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {exam.class_name}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {exam.total_mark}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">
                      {exam.average_score}
                    </td>
                  </tr>
                ))}

                {filteredExams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-base text-slate-600"
                    >
                      No exams found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
