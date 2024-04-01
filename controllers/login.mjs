import sql from "../db/conn.mjs";
import bcrypt from 'bcrypt';

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query the database to find the user by email
        const result = await sql`
            SELECT * FROM users WHERE email = ${email};
        `;
        
        // If user exists
        if (result.length > 0) {
            const user = result[0];
            // Compare passwords
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            // If password matches
            if (passwordMatch) {
                res.status(200).send({"Done": "Logged IN"});
            } else {
                res.status(401).send("Invalid Credentials!");
            }
        } else {
            res.status(401).send("Invalid Credentials!");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    } finally {
        // Close the database connection
        await sql.end();
    }
};

export default login;
