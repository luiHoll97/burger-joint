import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import filePath from "./filePath";
import { Pool } from "pg";
import userFunctions from "./controllers/user";

const app = express();
// To parse JSON bodies (as sent by API clients)
app.use(express.json());
// To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
app.use(cors());
// Always make sure this is before you access any environment variables
dotenv.config();

const connectionString = process.env.DB_URL;

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
    const pathToFile = filePath("../public/index.html");
    res.sendFile(pathToFile);
});

// GET /items
app.get("/items`", async (req, res) => {
    //const allSignatures = getAllDbItems();
    const allSignatures = await pool.query("SELECT * from customers");
    console.log(allSignatures);
    res.status(200).json(allSignatures.rows);
    console.log(allSignatures);
});

app.post("/user", async (req, res) => {
    const postData = req.body;
    const doesUserExist = await userFunctions.checkExistingUser(
        postData.email,
        pool
    );
    if (doesUserExist) {
        res.status(409).send("User already exists");
        return;
    }
    try {
        await userFunctions.createUser(postData, pool);
        res.send("Success: User created");
    } catch (error) {
        console.error(error);
        res.status(500).send("failure");
    }
});

app.listen(PORT_NUMBER, () => {
    console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
