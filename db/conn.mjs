// import postgres from "postgres";
import pkg from "pg";
const { Pool } = pkg

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const sql = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
      require: true,
    },
  });


export default sql;