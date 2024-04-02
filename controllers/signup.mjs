import sql from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
let { RESEND_URI, LIVE_URI } = process.env;

const resend = new Resend(RESEND_URI);

const signup = async (req, res) => {
  let { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const result = await sql.query(`
        SELECT * FROM users WHERE email = '${email}';
    `);

    if (result.rows.length > 0) {
      res.status(400).send("User already exists");
      return;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user with the hashed password
    await sql.query(`
        INSERT INTO users (name, email, password_hash)
        VALUES ('${name}', '${email}', '${hashedPassword}');
    `);

    // Generate JWT token
    const token = jwt.sign({ email }, "your_secret_key", { expiresIn: "1h" });

    // Send verification email
    await sendVerificationEmail(email);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Function to send verification email using resend.com API
const sendVerificationEmail = async (email) => {
  try {
    // Create verification link
    const verificationLink = `${LIVE_URI}verify/${email}`;

    // Send a POST request to resend.com API
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Email Verification",
      html: `<p>Please verify your email <a href="${verificationLink}">here</a>!</p>`,
    });

    console.log("Verification email sent:", response.data);
  } catch (error) {
    console.error("Error sending verification email:", error.response.data);
    throw new Error("Error sending verification email");
  }
};

const emailVerify = async (req, res) => {
  let email = req.params.email;
  try {
    // Update the user's verification status in the database
    await sql.query(`
        UPDATE users
        SET verified = TRUE
        WHERE email = '${email}';
    `);

    res.status(200).send("Email verified successfully");
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default { signup, emailVerify };
