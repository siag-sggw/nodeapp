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
      ctx.body = { username: user.username }
    } else {
      ctx.status = 401;
      ctx.body = { status: "Invalid credentials" }
    }
  })(ctx);
});

router.get('/auth/logout', async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.status = 204;
    ctx.body = {};
  } else {
    ctx.status = 204;
    ctx.body = {};
  }
});

router.post('/auth/register', async (ctx) => {
  const user = await addUser(ctx.request.body);
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.login(user);
      ctx.status = 200;
      ctx.body = {}
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

router.put('/favorite', async (ctx) => {
  if (ctx.isAuthenticated()) {
    let data = ctx.request.body.stock
    var favorites = await arrayOfFavorites(ctx.state.user.username)
    if (!favorites.includes(data)) {
      favorites.push(data)
      writeArrayFavoritesToUser(ctx.state.user.username, favorites)
    }
        ctx.status = 200;
        ctx.body = { favorites: favorites }	
  } else {
    ctx.status = 403;
  }
});

router.delete('/favorite', async (ctx) => {
  if (ctx.isAuthenticated()) {
    let data = ctx.request.body.stock
    var favorites = await arrayOfFavorites(ctx.state.user.username)
    if (favorites.includes(data)) {
      console.log("TAK")
      favorites = favorites.filter(stock => stock != data) 
      writeArrayFavoritesToUser(ctx.state.user.username, favorites)
      ctx.status = 200;
      ctx.body = { favorites: favorites }	
    }
    ctx.status = 200;
    ctx.body = { favorites: favorites }	
  } else {
    ctx.status = 403;
  }
});

router.get('/favorite', async (ctx) => {
  if (ctx.isAuthenticated()) {
    let favorites = await arrayOfFavorites(ctx.state.user.username)
        ctx.status = 200;
        ctx.body = { favorites: favorites }	
  } else {
    ctx.status = 403;
  }
});

async function writeArrayFavoritesToUser(username, favoritesArray) {
  let string = favoritesArray.join(",")
  setUserFavorites(username, string)
}

async function setUserFavorites(username, favoritesString) {
  console.log(favoritesString)
  let newData = await knex('users')
  .where({ username: username })
  .update({ love_stocks: favoritesString }).returning("love_stocks")
  console.log("OLOOO "+newData)
}

async function arrayOfFavorites(username) {
  let raw = await getUserFavorites(username)
  let splited = raw[0].love_stocks.split(",")
  console.log(splited)
  return splited.filter(stock => stock != "")
}

function getUserFavorites(username) {
  return knex('users')
  .select('love_stocks')
  .where({ username: username });
}

// router.get('/favorite', async (ctx) => {
//   return passport.authenticate('local', (err, user, info, status) => {
//     if (user && ctx.isAuthenticated()) {
//       knex('users')
//         .where({ username: user.username })
//         .then(rows => {
//           ctx.status = 200;
//           ctx.body = { secret: user.username }	
//         })
//     } else {
//       ctx.status = 401;
//     }
//   })(ctx);
// });

app.use(router.routes());
app.listen(PORT);

