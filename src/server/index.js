const Koa = require('koa');
const Router = require('koa-router');
const router = new Router();
const app = new Koa();
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

router.get('/', async (ctx) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      ctx.body = results;
      client.release();
    } catch (err) {
      console.error(err);
      ctx.body = "Error " + err;
    }
})
app.use(router.routes());
app.listen(PORT);

