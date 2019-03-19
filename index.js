const Koa = require('koa');
const app = new Koa();
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

app.use(async ctx => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      ctx.body = results;
      client.release();
    } catch (err) {
      console.error(err);
      ctx.body = "Error " + err;
    }
});

app.listen(PORT);

