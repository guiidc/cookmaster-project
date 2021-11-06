const express = require('express');
const BodyParser = require('body-parser');

const app = express();
app.use(BodyParser.json());
const router = require('../../routes');
// Não remover esse end-point, ele é necessário para o avaliador
app.get('/', (request, response) => {
  response.send();
});
// Não remover esse end-point, ele é necessário para o avaliador
app.use(router);

module.exports = app;
