require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');

const PORT = process.env.PORT || 5000;
const app = express();
const corsOptions = {   origin: "*",   methods:
        "GET,HEAD,PUT,PATCH,POST,DELETE",  credentials: true,   preflightContinue: false,
    optionsSuccessStatus: 204 };
app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);

const main = async () => {
    try {
        await app.listen(PORT, (uri, callback) => {
            mongoose.connect(process.env.MONGO_URL, {useUnifiedTopology: true, useNewUrlParser: true});
            console.log(`SERVER STARTED ON PORT ${PORT}`);
        });
    }catch (err) {
        console.log(err.message || err);
    }
}

main();