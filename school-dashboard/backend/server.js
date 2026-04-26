require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    return;
  }

  console.log("Connected to MySQL");
});

// Root route
app.get("/", (req, res) => {
  res.send("School API is running");
});

// =========================
// Students
// =========================

app.get("/api/students", (req, res) => {
  const sql = "SELECT * FROM students";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching students:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM students WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching student:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result[0]);
  });
});

app.post("/api/students", (req, res) => {
  const { full_name, class: className, avgarge, phone_number } = req.body;

  if (!full_name || !className || avgarge === undefined || !phone_number) {
    return res.status(400).json({
      error: "full_name, class, avgarge, and phone_number are required",
    });
  }

  const sql =
    "INSERT INTO students (full_name, `class`, avgarge, phone_number) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [full_name, className, avgarge, phone_number],
    (err, result) => {
      if (err) {
        console.error("Error adding student:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Student added successfully",
        student: {
          id: result.insertId,
          full_name,
          class: className,
          avgarge,
          phone_number,
        },
      });
    },
  );
});

// =========================
// Teachers
// =========================

app.get("/api/teachers", (req, res) => {
  const sql = "SELECT * FROM teachers";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching teachers:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// =========================
// Classes
// =========================

app.get("/api/classes", (req, res) => {
  const sql = "SELECT * FROM classes";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching classes:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// =========================
// Notifications
// =========================

app.get("/api/notifications", (req, res) => {
  const sql = "SELECT * FROM notifications";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching notifications:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// =========================
// Exams
// =========================

app.get("/api/exams", (req, res) => {
  const sql = "SELECT * FROM exams";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching exams:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/exams/:id/results", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      exam_results.exam_id,
      exam_results.student_id,
      students.full_name AS student_name,
      exam_results.mark
    FROM exam_results
    JOIN students 
      ON exam_results.student_id = students.id
    WHERE exam_results.exam_id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching exam results:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "No results found for this exam",
      });
    }

    res.json(result);
  });
});

// =========================
// Dashboard APIs
// =========================

app.get("/api/dashboard/students-per-class", (req, res) => {
  const sql = `
    SELECT 
      students.\`class\` AS class_name,
      COUNT(*) AS total_students
    FROM students
    GROUP BY students.\`class\`
    ORDER BY students.\`class\` ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching students per class:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/top-students", (req, res) => {
  const sql = `
    SELECT 
      id,
      full_name,
      students.\`class\` AS class_name,
      avgarge
    FROM students
    ORDER BY avgarge DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching top students:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/average-marks", (req, res) => {
  const sql = `
    SELECT 
      IFNULL(ROUND(AVG(avgarge), 2), 0) AS school_average
    FROM students
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching average marks:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result[0]);
  });
});

app.get("/api/dashboard/pass-rate", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS total_results,
      IFNULL(SUM(CASE WHEN mark >= 50 THEN 1 ELSE 0 END), 0) AS passed_students,
      IFNULL(
        ROUND(
          (SUM(CASE WHEN mark >= 50 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0),
          2
        ),
        0
      ) AS pass_rate
    FROM exam_results
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching pass rate:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result[0]);
  });
});

app.get("/api/dashboard/class-averages", (req, res) => {
  const sql = `
    SELECT 
      students.\`class\` AS class_name,
      IFNULL(ROUND(AVG(avgarge), 2), 0) AS average_mark
    FROM students
    GROUP BY students.\`class\`
    ORDER BY average_mark DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching class averages:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/exams-per-class", (req, res) => {
  const sql = `
    SELECT 
      class_name,
      COUNT(*) AS total_exams
    FROM exams
    GROUP BY class_name
    ORDER BY class_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching exams per class:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/exam-performance", (req, res) => {
  const sql = `
    SELECT 
      exams.id AS exam_id,
      exams.subject,
      exams.class_name,
      exams.total_mark,
      IFNULL(ROUND(AVG(exam_results.mark), 2), 0) AS average_score
    FROM exams
    LEFT JOIN exam_results
      ON exams.id = exam_results.exam_id
    GROUP BY exams.id, exams.subject, exams.class_name, exams.total_mark, exams.date
    ORDER BY exams.date DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching exam performance:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/top-students-from-exams", (req, res) => {
  const sql = `
    SELECT 
      students.id,
      students.full_name,
      students.\`class\` AS class_name,
      IFNULL(ROUND(AVG(exam_results.mark), 2), 0) AS average_exam_mark
    FROM students
    LEFT JOIN exam_results
      ON exam_results.student_id = students.id
    GROUP BY students.id, students.full_name, students.\`class\`
    ORDER BY average_exam_mark DESC
    LIMIT 5
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching top students from exams:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/dashboard/summary", (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM students) AS total_students,
      (SELECT COUNT(*) FROM teachers) AS total_teachers,
      (SELECT COUNT(*) FROM classes) AS total_classes,
      (SELECT IFNULL(ROUND(AVG(avgarge), 2), 0) FROM students) AS school_average,
      (
        SELECT IFNULL(
          ROUND(
            (SUM(CASE WHEN mark >= 50 THEN 1 ELSE 0 END) * 100.0) / NULLIF(COUNT(*), 0),
            2
          ),
          0
        )
        FROM exam_results
      ) AS pass_rate
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching dashboard summary:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result[0]);
  });
});

app.get("/api/students/:id/results", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      exams.id AS exam_id,
      exams.subject,
      exams.date,
      exams.total_mark,
      exam_results.mark
    FROM exam_results
    JOIN exams
      ON exam_results.exam_id = exams.id
    WHERE exam_results.student_id = ?
    ORDER BY exams.date DESC
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error fetching student exam results:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

app.get("/api/lectures", (req, res) => {
  const sql = "SELECT * FROM lectures";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching lectures:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(result);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
