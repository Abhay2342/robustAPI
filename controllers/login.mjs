import sql from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the database to find the user by email
    const result = await sql.query(`
        SELECT * FROM users WHERE email = '${email}';
    `);

    // If user exists
    if (result.rows.length > 0) {
      const user = result.rows[0];
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      // If password matches
      if (passwordMatch) {
        // Generate JWT token
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          "your_secret_key",
          { expiresIn: "1h" }
        );

        // Send token in response
        res.status(200).json({ token });
      } else {
        res.status(401).send("Invalid Credentials!");
      }
    } else {
      res.status(401).send("Invalid Credentials!");
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default login;
