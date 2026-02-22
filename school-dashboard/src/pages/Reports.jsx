import { useMemo, useState } from "react";
import { exams } from "../data/exams";
import { classes } from "../data/classes";

function gradeName(classId) {
  return classes.find((c) => c.id === classId)?.name || classId;
}

function avgFromResults(results, totalMark = 100) {
  if (!results?.length) return 0;
  const sum = results.reduce((acc, r) => acc + (r.mark || 0), 0);
  const avg = sum / results.length;
  return Math.round((avg / totalMark) * 1000) / 10;
}

function passRate(results, passMark = 50) {
  if (!results?.length) return 0;
  const passCount = results.filter((r) => (r.mark || 0) >= passMark).length;
  return Math.round((passCount / results.length) * 1000) / 10;
}

function scoreBands(results) {
  const bands = { A: 0, B: 0, C: 0, F: 0 };
  for (const r of results || []) {
    const m = r.mark || 0;
    if (m >= 90) bands.A++;
    else if (m >= 75) bands.B++;
    else if (m >= 50) bands.C++;
    else bands.F++;
  }
  return bands;
}

function BarRow({ label, value, tone = "blue" }) {
  const barClass =
    tone === "green"
      ? "bg-emerald-600"
      : tone === "slate"
        ? "bg-slate-700"
        : "bg-blue-700";

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 shrink-0 text-sm text-slate-700">{label}</div>
      <div className="flex-1">
        <div className="h-3 w-full rounded-full bg-slate-200">
          <div
            className={`h-3 rounded-full ${barClass} transition-all duration-500`}
            style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          />
        </div>
      </div>
      <div className="w-16 shrink-0 text-right text-sm font-semibold text-slate-900">
        {value}%
      </div>
    </div>
  );
}

function MiniBars({ items }) {
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <BarRow
          key={it.label}
          label={it.label}
          value={it.value}
          tone={it.tone}
        />
      ))}
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("overview");
  const [grade, setGrade] = useState("ALL");

  const gradeOptions = useMemo(() => {
    const order = ["G6", "G5", "G4", "G3", "G2", "G1"];
    return order.map((id) => classes.find((c) => c.id === id)).filter(Boolean);
  }, []);

  const filteredExams = useMemo(() => {
    return exams
      .filter((e) => (grade === "ALL" ? true : e.classId === grade))
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [grade]);

  const summary = useMemo(() => {
    const allResults = filteredExams.flatMap((e) => e.results || []);
    const totalMark = 100;

    const overallAvg = allResults.length
      ? Math.round(
          (allResults.reduce((acc, r) => acc + (r.mark || 0), 0) /
            allResults.length) *
            10,
        ) / 10
      : 0;

    const overallAvgPct = Math.round((overallAvg / totalMark) * 1000) / 10;

    const overallPass = allResults.length ? passRate(allResults, 50) : 0;
    const bands = scoreBands(allResults);
    const total = allResults.length || 1;

    const bandPct = {
      A: Math.round((bands.A / total) * 1000) / 10,
      B: Math.round((bands.B / total) * 1000) / 10,
      C: Math.round((bands.C / total) * 1000) / 10,
      F: Math.round((bands.F / total) * 1000) / 10,
    };

    return {
      overallAvgPct,
      overallPass,
      bandPct,
      countExams: filteredExams.length,
    };
  }, [filteredExams]);

  const gradePerformance = useMemo(() => {
    const order = ["G6", "G5", "G4", "G3", "G2", "G1"];
    const rows = order.map((cid) => {
      const list = exams.filter((e) => e.classId === cid);
      const avgs = list.map((e) =>
        avgFromResults(e.results, e.totalMark || 100),
      );
      const avg = avgs.length
        ? Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10
        : 0;
      return { classId: cid, name: gradeName(cid), avgPct: avg };
    });
    return rows;
  }, []);

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
              onClick={() => setTab("grades")}
              className={`h-11 px-5 rounded-xl text-base font-semibold border transition-all ${
                tab === "grades"
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Group by Grades
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

          <div className="flex gap-3 items-center">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-11 w-60 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none focus:border-blue-300"
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
            Exams:{" "}
            <span className="font-semibold text-slate-900">
              {summary.countExams}
            </span>
          </p>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
            {grade === "ALL" ? "All Grades" : gradeName(grade)}
          </span>
        </div>
      </div>

      {tab === "overview" ? (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900">
              Overall Performance
            </h3>
            <p className="text-sm text-slate-600 mt-1">Average and pass rate</p>

            <div className="mt-6 space-y-4">
              <MiniBars
                items={[
                  { label: "Average", value: summary.overallAvgPct, tone: "blue" },
                  { label: "Pass rate", value: summary.overallPass, tone: "green" },
                ]}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900">
              Score Distribution
            </h3>
            <p className="text-sm text-slate-600 mt-1">A / B / C / F bands</p>

            <div className="mt-6 space-y-4">
              <MiniBars
                items={[
                  { label: "A (90-100)", value: summary.bandPct.A, tone: "blue" },
                  { label: "B (75-89)", value: summary.bandPct.B, tone: "slate" },
                  { label: "C (50-74)", value: summary.bandPct.C, tone: "green" },
                  { label: "F (<50)", value: summary.bandPct.F, tone: "slate" },
                ]}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900">Quick Stats</h3>
            <p className="text-sm text-slate-600 mt-1">Useful indicators</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Selected grade</p>
                <p className="text-base font-semibold text-slate-900">
                  {grade === "ALL" ? "All Grades" : gradeName(grade)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Exams in view</p>
                <p className="text-base font-semibold text-slate-900">
                  {summary.countExams}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                <p className="text-sm text-slate-600">Data mode</p>
                <p className="text-base font-semibold text-slate-900">Local</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "grades" ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Performance by Grade
            </h3>
            <p className="text-sm text-slate-600 mt-1">Average % per grade</p>
          </div>

          <div className="p-6 space-y-5">
            {gradePerformance.map((g) => (
              <BarRow
                key={g.classId}
                label={g.name}
                value={g.avgPct}
                tone="blue"
              />
            ))}
          </div>
        </div>
      ) : null}

      {tab === "exams" ? (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Exam List</h3>
            <p className="text-sm text-slate-600">{filteredExams.length} exams</p>
          </div>

          <div className="max-h-[calc(100vh-290px)] overflow-y-auto custom-scroll">
            <table className="w-full text-base">
              <thead className="sticky top-0 bg-slate-100 text-slate-700">
                <tr>
                  <th className="text-left font-semibold px-6 py-4">Subject</th>
                  <th className="text-left font-semibold px-6 py-4">Grade</th>
                  <th className="text-left font-semibold px-6 py-4">Date</th>
                  <th className="text-right font-semibold px-6 py-4">Avg %</th>
                  <th className="text-right font-semibold px-6 py-4">Pass %</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredExams.map((e) => {
                  const avgPct = avgFromResults(e.results, e.totalMark || 100);
                  const passPct = passRate(e.results, 50);

                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {e.subject}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {gradeName(e.classId)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{e.date}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {avgPct}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {passPct}%
                      </td>
                    </tr>
                  );
                })}

                {filteredExams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
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