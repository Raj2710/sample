const mongo = require("../Shared/mongo");
var randomize = require('randomatic');

const service = {
    async postUrl(req, res) {

        try {
            let data = req.body;
            const insertData = await mongo.db.collection("urlDetails").insertOne(data);
            await mongo.db.collection("urlDetails").findOneAndUpdate({ _id: insertData.insertedId }, {
                $set: { "shorturl": `http://localhost:3001/url/shorturl/${randomize('A0', 5)}`, "date": new Date().toISOString().slice(0, 10), "count": 0 }
            }, { upsert: true })
            const shortUrl = await mongo.db.collection("urlDetails").findOne({ _id: insertData.insertedId }, { projection: { _id: 0, shorturl: 1 } });
            res.send(shortUrl);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },

    async displayshortUrl() {
        try {
            const shortUrl = await mongo.db.collection("urlDetails").findOne();
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }

    },
    async urlCount(req, res) {
        try {
            const today = new Date();
            const month = today.getMonth() + 1;
            var alldata = await mongo.db.collection("urlDetails").aggregate([
                {
                    $group:
                    {
                        _id: { date: "$date" },
                        totalUrl: { $sum: 1 },
                    }
                }
            ]).toArray();

            res.send(alldata);
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },
    async redirectUrl(req, res) {
        try {
            const short = await mongo.db.collection("urlDetails").findOne({ shorturl: `http://localhost:3001/url/shorturl/${req.params.token}` });
            if (short) {
                const countval = await mongo.db.collection("urlDetails").
                    findOneAndUpdate({ shorturl: short.shorturl }, { $inc: { count: 1 } });
                return res.redirect(short.longurl);
            } else {
                return res.status(404).send({ error: "Not found" });
            }

        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },

    findEmail(email) {
        return mongo.db.collection("register").findOne({ email });
    }
}

module.exports = service;

