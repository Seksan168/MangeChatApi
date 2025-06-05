import { Database } from "bun:sqlite";
import bcrypt from "bcrypt";

const db = new Database("mydb.sqlite");

// Ensure users table exists
db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`).run();

const createUser = async (user: { email: string; password: string }) => {
    try {
        // Check if email already exists
        const existing = db.query(`SELECT * FROM users WHERE email = $email`).get({ $email: user.email });

        if (existing) {
            return { success: false, message: "Email already exists." };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insert new user
        const query = db.query(`
            INSERT INTO users ("email", "password") 
            VALUES ($email, $password);
        `);
        query.run({
            $email: user.email,
            $password: hashedPassword
        });

        return { success: true, message: "User created successfully." };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, message: "Error creating user." };
    }
};

// Test it
createUser({
    email: 'test3@gmail.com',
    password: '1234'
}).then(console.log);
