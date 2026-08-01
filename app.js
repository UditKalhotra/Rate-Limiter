const express = require('express');
const ruleRoutes = require('./route/ruleRoute');
const testRoutes = require("./route/testroute");
const APIRoute = require('./route/apikeyroute');
const app = express();
const connectDB = require('./db/db');

connectDB();

app.use(express.json());

app.use('/api-key', APIRoute);
app.use('/', ruleRoutes);
app.use("/api", testRoutes);



module.exports = app;