const Koa = require('koa');
const bcrypt = require('bcryptjs');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const session = require('koa-session');
const cors = require('@koa/cors');
const knex = require('./db/connection');
const passport = require('koa-passport');
const router = new Router();
const app = new Koa();
const PORT = process.env.PORT || 5000

app.keys = ['super-secret-key'];
app.use(cors({
    origin(ctx) { return ctx.request.get("Origin") },
    credentials: true
}));
app.use(session(app));

app.use(bodyParser());

require('./auth');
app.use(passport.initialize());
app.use(passport.session());

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

function addUser(user) {
  if (!user.password) { console.log("No password parameter") }
  if (!user.username) { console.log("No username parameter") }
  return knex('users')
  .insert({
    username: user.username,
    password: user.password,
  })
  .returning('*');
}

router.post('/auth/login', async (ctx) => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.login(user);
      ctx.status = 200;
    } else {
      ctx.status = 401;
    }
  })(ctx);
});

router.get('/auth/logout', async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.status = 204;
  } else {
    ctx.status = 204;
  }
});

router.post('/auth/register', async (ctx) => {
  const user = await addUser(ctx.request.body);
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.login(user);
      ctx.status = 200;
    } else {
      ctx.status = 401;
    }
  })(ctx);
});

router.get('/secret', async (ctx) => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user && ctx.isAuthenticated()) {
      ctx.status = 200;
      ctx.body = { secret: "42" }	
    } else {
      ctx.status = 401;
    }
  })(ctx);
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

