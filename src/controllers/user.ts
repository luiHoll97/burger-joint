import { SignUp } from "../db";
import { Pool } from "pg";
import bcrypt from "bcrypt";

const UserController = () => {
    const createUser = async (postData: SignUp, pool: Pool): Promise<void> => {
        const client = await pool.connect();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(postData.password, salt);
        postData.password = hashedPassword;
        try {
            await client.query("BEGIN");
            await client.query("SELECT add_new_user($1, $2, $3, $4)", [
                postData.password,
                postData.email,
                postData.firstName,
                postData.surname,
            ]);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.log("Error in createUser:", error);
            throw error;
        }
    };

    const checkExistingUser = async (
        email: string,
        pool: Pool
    ): Promise<boolean> => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const check = await client.query(
                "SELECT * FROM check_existing_user($1)",
                [email]
            );
            await client.query("COMMIT");
            if (check.rows.length > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            await client.query("ROLLBACK");
            console.log("Cant do it");
            throw error;
        }
    };

    return {
        createUser,
        checkExistingUser,
    };
};

const dbFunctions = UserController();

export default dbFunctions;
