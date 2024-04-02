import sql from "../db/conn.mjs";

const getCourses = async (req, res) => {
  try {
    // Extract query parameters for filtering and pagination
    const { category, lvl, page = 1, limit = 10 } = req.query;

    // Construct SQL query with optional filters
    let query = `SELECT * FROM courses`;
    const values = [];

    if (category) {
      query += ` WHERE category = '${category}'`;
      values.push(category);
    }
    if (lvl) {
      if (values.length === 0) {
        query += " WHERE";
      } else {
        query += " AND";
      }
      query += ` lvl = '${lvl}'`;
      values.push(lvl);
    }

    // Add pagination
    query += ` LIMIT ${limit} OFFSET ${(page - 1) * limit};`;

    // Execute the SQL query
    const result = await sql.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const enrollCourse = async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    // Check if the user is already enrolled in the course
    const checkEnrollmentQuery = {
      text: "SELECT * FROM user_enrollments WHERE user_id = $1 AND course_id = $2",
      values: [userId, courseId],
    };
    const enrollmentCheckResult = await sql.query(checkEnrollmentQuery);
    if (enrollmentCheckResult.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already enrolled in this course" });
    }

    // If not already enrolled, proceed with enrollment
    const enrollQuery = {
      text: "INSERT INTO user_enrollments (user_id, course_id, enrollment_date) VALUES ($1, $2, CURRENT_DATE)",
      values: [userId, courseId],
    };
    await sql.query(enrollQuery);

    res.status(200).json({ message: "Enrollment successful" });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const viewEnrolledCourses = async (req, res) => {
  const userId = req.params.userId;

  try {
    const enrolledCoursesQuery = {
      text: "SELECT courses.id, courses.title, courses.description, courses.category, courses.lvl FROM courses INNER JOIN user_enrollments ON courses.id = user_enrollments.course_id WHERE user_enrollments.user_id = $1",
      values: [userId],
    };
    const result = await sql.query(enrolledCoursesQuery);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addCourse = async (req, res) => {
  // Superadmin authentication check
  if (!req.headers["x-superadmin"]) {
    return res
      .status(403)
      .json({ message: "Only superadmin users can create courses" });
  }

  const { title, description, category, level, popularity, createdByUserId } =
    req.body;

  try {
    const queryText =
      "INSERT INTO courses (title, description, category, lvl, popularity, created_by_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";
    const { rows } = await sql.query(queryText, [
      title,
      description,
      category,
      level,
      popularity,
      createdByUserId,
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCourse = async (req, res) => {
  // Superadmin authentication check
  if (!req.headers["x-superadmin"]) {
    return res
      .status(403)
      .json({ message: "Only superadmin users can update courses" });
  }

  const courseId = req.params.id;
  const { title, description, category, level, popularity, createdByUserId } =
    req.body;

  try {
    const queryText =
      "UPDATE courses SET title = $1, description = $2, category = $3, lvl = $4, popularity = $5, created_by_user_id = $6 WHERE id = $7 RETURNING *";
    const { rows } = await sql.query(queryText, [
      title,
      description,
      category,
      level,
      popularity,
      createdByUserId,
      courseId,
    ]);

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCourse = async (req, res) => {
  // Superadmin authentication check
  if (!req.headers["x-superadmin"]) {
    return res
      .status(403)
      .json({ message: "Only superadmin users can delete courses" });
  }

  const courseId = req.params.id;

  try {
    const queryText = "DELETE FROM courses WHERE id = $1 RETURNING *";
    const { rows } = await sql.query(queryText, [courseId]);

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error deleting course:", error);
    res
      .status(500)
      .json({ message: "Maybe Some Users are Enrolled in this course" });
  }
};

export default {
  getCourses,
  enrollCourse,
  viewEnrolledCourses,
  addCourse,
  updateCourse,
  deleteCourse,
};
