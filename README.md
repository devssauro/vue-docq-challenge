# DocQ Coding challenge

The project corresponds to a coding challenge described on the file sent by email from Luciano, the current CEO. The current backlog for the project is in a [https://docs.google.com/document/d/1UsIjmaAoY4wjgwfItMGfYurhI0AcK9IsQLyblwq-O30/edit?usp=sharing](Google Docs file).

## Project local setup

```
# Install the libraries to run the project
yarn

# To compile and use the hot-reload to 
yarn dev

```

## Docker configuration

```
Run all the project on docker
docker compose up --build

Run only the backend to use the frontend on yarn
docker compose up backend && yarn dev
```

## Selenium tests

```
Run an specific test
mocha test/path/to/yourTest.spec.js
```