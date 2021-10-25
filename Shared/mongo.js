const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const mongo = {
    db: null,
    async connect() {
        await client.connect();
        console.log("Connected to mongoDB");
        this.db = client.db(process.env.MONGODB_NAME);
    }
}

module.exports = mongo;

