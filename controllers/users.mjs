import sql from "../db/conn.mjs";
import bcrypt from "bcrypt";

const getUsers = async (req, res) => {
  try {
    const result = await sql.query(`
        SELECT * FROM users;
    `);
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};

const deleteUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const query = sql.query(`
        SELECT * FROM users WHERE email = '${email}';
    `);
    const result = await query;

    if (result.rows[0] === undefined) {
      res.status(404).send("User not found");
      return;
    }

    const existingUser = result.rows[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      password,
      existingUser.password_hash
    );

    if (passwordMatch) {
      // Delete the user
      const deleteQuery = sql.query(`
            DELETE FROM users WHERE email = '${email}';
        `);
      await deleteQuery;
      res.status(200).send("User deleted");
    } else {
      res.status(401).send("Invalid Password");
    }
  } catch (error) {
    console.error("Error during user deletion:", error);
    res.status(500).send("Internal Server Error");
  }
};

const updatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Fetch the user from the database
    const userQuery = `
        SELECT * FROM users WHERE email = '${email}';
    `;
    const userResult = await sql.query(userQuery);

    if (userResult.rows.length === 0) {
      res.status(404).send("User not found");
      return;
    }

    const user = userResult.rows[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      res.status(401).send("Incorrect current password");
      return;
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateQuery = `
            UPDATE users SET password_hash = '${hashedNewPassword}' WHERE email = '${email}';
        `;
    await sql.query(updateQuery);

    res.status(200).send("Password updated successfully");
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default {
  getUsers,
  deleteUser,
  updatePassword,
};
