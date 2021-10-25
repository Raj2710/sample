const express = require("express");
const app = express();
require("dotenv").config();
const { ObjectId } = require("mongodb");

const cors = require("cors");

const mongo = require("./Shared/mongo");
const jwt = require("jsonwebtoken");

//Import all routes
const authRoute = require("./Routes/auth.route");
const urlRoute = require("./Routes/url.route");
const displayUrlRoute = require("./Routes/displayurl.route");

var PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Connected to ${PORT} Server...`);
});

async function loadApp() {
    try {
        await mongo.connect();
        app.use(cors());
        app.use(express.json());
        app.use("/auth", authRoute);

        app.get('/verify/:token', async (req, res) => {
            try {
                const { userId } = jwt.verify(req.params.token, process.env.JWT_PRIVATE_KEY);
                await mongo.db.collection("register").findOneAndUpdate({ _id: ObjectId(userId) }, { $set: { isActive: 1 } });
                res.sendStatus(200);
            } catch (error) {
                res.status(401).send({ error: "Invalid token" });
            }
        });

        app.use("/url", urlRoute);
        app.use((req, res, next) => {
            const token = req.headers["access-token"];
            if (token) {
                try {
                    const { userId } = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
                    req.user = userId;
                    next();
                }
                catch (error) {
                    res.status(401).send({ error: "Invalid token" });
                }
            } else {
                res.status(401).send({ error: "Token is missing" });
            }

        });

        app.use("/displayurlroute", displayUrlRoute);

    }
    catch (err) {
        console.error(err);
        process.exit();
    }
}

loadApp();
