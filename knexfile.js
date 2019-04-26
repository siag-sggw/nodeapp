// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/src/server/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds/development',
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/src/server/db/migrations',
    },
    seeds: {
      directory: __dirname + '/src/server/db/seeds/production',
    }
  }

};
