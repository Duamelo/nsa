module.exports = {
   type: "mysql",
   host: "localhost",
   port: 3306,
   username: "root",
   password: "root",
   database: "dev_db",
   synchronize: true,
   logging: false,
   migrationsRun: true,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
};
