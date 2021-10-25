const bcrypt = require("bcrypt");
const schema = require("../Shared/schema");
const mongo = require("../Shared/mongo");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');

const service = {

    async register(req, res) {

        try {
            let data = req.body;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MAIL_ID,
                    pass: process.env.PASSWORD,
                }
            });

            // Input Validation
            const { error } = schema.register.validate(data);
            if (error) return res.status(400).send({ error: error.details[0].message })

            // Email Validation
            const user = await service.findEmail(data.email);

            if (user) return res.status(400).send({ error: "User already registered" });

            // Encrypt the password
            const salt = await bcrypt.genSalt(8);
            data.password = await bcrypt.hash(data.password, salt);

            //Inserting user details in DB
            await mongo.db.collection("register").insertOne(data);

            // await mongo.db.collection("register").findOneAndUpdate({ email: data.email }, { $set: { isActive: 0 } });

            const getId = await service.findEmail(data.email);

            const token = await jwt.sign({ userId: getId._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: "8h" });

            await transporter.sendMail({
                from: process.env.MAIL_ID,
                to: data.email,
                subject: "Verify Your Account ",
                html: `
            <p>You requested for password reset </p>
            <h3> Click  this <a href="http://localhost:3000/verify/${token}" target="_blank">Link</a> to verify your account.</h3>
            `
            })
            res.send({ message: "Check Your Mail" });
        }
        catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" })
        }

    },
    async login(req, res) {

        try {
            let data = req.body;

            // Input Validation
            const { error } = schema.login.validate(data);
            if (error) return res.status(400).send({ error: error.details[0].message });

            // Email Validation
            const user = await service.findEmail(data.email);
            if (!user) return res.status(403).send({ error: "Invalid mail Id or password" });

            // Compare Password
            const isValid = await bcrypt.compare(data.password, user.password);
            if (!isValid) return res.status(403).send({ error: "Invalid mail Id or password" });

            if (!user.isActive) {
                return res.status(403).send({ error: "Your account is not verified,Please Check your mail" });
            }
            // Generate JWT
            const token = jwt.sign({ userId: user._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: "8h" });
            // await mongo.db.collection("login").insertOne(data);
            res.send({ token });
        }
        catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },

    async forgotpassword(req, res) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.PASSWORD,
            }
        });

        try {
            const token = uuidv4();
            let data = req.body;

            // Input Validation
            const { error } = schema.forgotpassword.validate(data);
            if (error) return res.status(400).send(error.details[0].message);

            // Email Validation
            const user = await service.findEmail(data.email);
            if (!user) return res.status(403).send({ error: "Mail id doesn't exist" });

            //Create token and expireTime
            const resetToken = token;
            const expireTime = Date.now() + 3600000;

            //Update token and expireTime to DB
            await mongo.db.collection("register").findOneAndUpdate(
                { _id: user._id },
                { $set: { resetToken, expireTime } }
            );

            //Send mail to reset password
            transporter.sendMail({
                from: process.env.MAIL_ID,
                to: data.email,
                subject: "Reset Your Password ",
                html: `
        <p>You requested for password reset </p>
        <h3> Click this <a href="http://localhost:3000/resetpassword/${token}" target="_blank">Link</a> to reset your password.</h3>
        `
            })
            res.send({ message: "Check Your Mail" });
        }
        catch (err) {
            console.log(err);
            res.status(500).send({ error: "Internal server error" });
        }
    },

    async resetpassword(req, res) {

        try {
            let data = req.body;
            const password = data.password;
            const sentToken = data.token;

            //Check user exist or not 
            const user = await mongo.db.collection("register").findOne({
                resetToken: sentToken,
                expireTime: { $gt: Date.now() }
            });
            if (!user) {
                return res.status(422).send({ error: "Try again session expired" })
            }

            // Encrypt the password
            const salt = await bcrypt.genSalt(8);
            newPassword = await bcrypt.hash(password, salt);

            //Update token and expireTime to DB
            await mongo.db.collection("register").findOneAndUpdate(
                { resetToken: sentToken },
                { $set: { password: newPassword, resetToken: undefined, expireTime: undefined } }
            );
            res.send({ message: "Password updated successfully" });

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