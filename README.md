### JS Stack

[https://expressjs.com/](https://expressjs.com/)

[https://sequelize.org/docs/v6/getting-started/](https://sequelize.org/docs/v6/getting-started/)

[ESLint](https://eslint.org/)

### Setup .env file copy format from .env.sample.env

```
# NODE_ENV="development"
# PORT=4000
# DEV_DB_USERNAME=root
# DEV_DB_PASSWORD=mysecretpassword
# DEV_DB_NAME=cnp1837

```

### NodeJS Setup

```
npm install
```

npm start

### Migration run command

npm run migrate:up
npm run migrate:undo

npx sequelize-cli migration:generate --name [migration-name]

### seeder run command

npx sequelize-cli seed:generate --name demo-user
npx sequelize-cli db:seed:all (run all seeder)
npx sequelize-cli db:seed --seed my_seeder_file.js (run specific seeder)
