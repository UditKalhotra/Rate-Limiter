const express = require('express');
const cors = require("cors");
const ruleRoutes = require('./route/ruleRoute');
const testRoutes = require("./route/testroute");
const APIRoute = require('./route/apikeyroute');
const analysisReq = require("./route/analytics");
const signUp = require("./route/authRoute");
const errorhandler = require("./middleware/errorHandler");
const app = express();
const connectDB = require('./db/db');

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api-key', APIRoute);
app.use('/', ruleRoutes);
app.use("/api", testRoutes);
app.use("/analysis",analysisReq);
app.use('/auth',signUp)
app.use('/api/v1', require('./route/checkRoute'));

app.use(errorhandler);

module.exports = app;