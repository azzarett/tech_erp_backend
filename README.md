# NestJS Project

## Prerequisites

You need to have NVM (Node Version Manager) on your local machine.

## Installation

```bash
# install required version of node
$ nvm install

# select required version of node
$ nvm use

# installs dependencies from package-lock.json
$ npm ci
```

## Environment

```bash
# create local environment file
$ cp .env.example .env
```

Fill `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`.

## Docker (MySQL)

```bash
# start mysql container in background
$ docker compose up -d

# check running containers
$ docker compose ps

# view mysql logs
$ docker compose logs -f mysql

# stop containers
$ docker compose down

# stop containers and remove database volume
$ docker compose down -v
```

## Running the app

```bash
# run migrations before first start
$ npm run migration:run

# seed mock data
$ npm run database:seed

# run app in watch mode
$ npm run start:dev

# run app in debug watch mode
$ npm run start:debug

# run production build
$ npm run build
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# unit tests in watch mode
$ npm run test:watch

# test coverage
$ npm run test:cov

# debug tests
$ npm run test:debug

# e2e tests
$ npm run test:e2e
```

## Lint and format

```bash
# run eslint
$ npm run lint

# run eslint with auto-fix
$ npm run lint:fix

# format files
$ npm run format

# check formatting
$ npm run format:check
```

## Database scripts

```bash
# runs new migrations
$ npm run migration:run

# reverts last migration
$ npm run migration:revert

# deletes all tables and content in database
$ npm run database:clear

# populates database with seed data
$ npm run database:seed

# clears database, runs migrations and populates with seeds
$ npm run database:reset

# full reset + optional upload script
$ npm run database:upload

# creates new migrations file
$ npm run typeorm migration:create -n database/migrations/<migration-file-name>
```
