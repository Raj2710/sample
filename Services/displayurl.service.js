const { ObjectId } = require("mongodb");
const mongo = require("../Shared/mongo");

const service = {
    async getAllUrl(req, res) {
        try {
            let id = req.user;
            const user = await service.findUser(id);
            const data = await mongo.db.collection("urlDetails").find(
                { mailid: user.email }, {
                projection: {
                    _id: 0, shorturl: 1, count: 1
                }
            }).toArray();
            res.send(data);

        } catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" })
        }
    },

    findUser(id) {
        return mongo.db.collection("register").findOne({ _id: ObjectId(id) });
    }

}

module.exports = service;