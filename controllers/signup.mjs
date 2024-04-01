import sql from "../db/conn.mjs";
import bcrypt from 'bcrypt';

const signup = async (req, res) => {
    let { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const result = await sql`
            SELECT * FROM users WHERE email = ${email};
        `;

        if (result.length > 0) {
            res.status(400).send("User already exists");
            return;
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user with the hashed password
        await sql`
            INSERT INTO users (name, email, password_hash)
            VALUES (${name}, ${email}, ${hashedPassword});
        `;

        res.status(200).send({"Done": "User Created"});

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    } finally {
        // Close the database connection
        // await sql.end();
    }
};

export default signup;
