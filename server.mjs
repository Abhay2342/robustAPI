import express from "express";
import "./loadEnvironment.mjs";
import cors from 'cors';
import login from './controllers/login.mjs';
import signup from "./controllers/signup.mjs";
import sql from "./db/conn.mjs"
let { PORT } = process.env;

const app = express();
const port = PORT || 3000;


async function getPgVersion() {
  const result = await sql`select version()`;
  console.log(result[0]);
}

getPgVersion();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Running 3000");
});

app.post("/login", (req, res) => {
    login(req, res);
});

app.put("/signup", (req, res) => {
    signup(req, res);
});


app.listen(port, () => {
    console.log(`app is on port ${port}`);
});