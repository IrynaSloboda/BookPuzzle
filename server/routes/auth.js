const Router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

Router.post("/register", async(req, res) => {
    const { name, email, password, secretAnswer } = req.body;

    // Перевірка правильності формату електронної пошти
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).send({ error: "Будь ласка, введіть електронну пошту правильно, наприклад email@example.com" });
    }

    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).send({ error: "Користувач вже існує!" });
    }

    if (password.length < 8) {
        return res.status(400).send({ error: "Пароль повинен містити принаймі 8 символів!" });
    }

    bcrypt.hash(password, parseInt(process.env.SALT), async(err, hash) => {
        if (err) {
            return res.status(500).send({ error: "Internal server error" });
        }
        try {
            const newUser = await User.create({ name, email, password: hash, secretAnswer });
            return res.status(201).send({ user: newUser });
        } catch (err) {
            return res.status(500).send({ error: "Internal server error" });
        }
    });
});



Router.post("/login", async(req, res) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).send({error: "Пошта або пароль неправильні!"});
    }

    bcrypt.compare(password, user.password, async(err, result) => {
        if(err){
            return res.status(500).send({error: "Internal server error"});
        }
        if(!result){
            return res.status(401).send({error: "Пошта або пароль неправильні!"});
        }
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: "365d"});
        return res.status(200).send({token});
    });
});


Router.post("/reset-password/:email", async(req, res) => {
    const { email } = req.params;
    const { password, secretAnswer } = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).send({error: "Користувача не існує!"});
    }

    if (user.secretAnswer !== secretAnswer) {
        return res.status(400).send({error: "Ваша відповідь неправильна!"});
    }

    bcrypt.hash(password, parseInt(process.env.SALT), async(err, hash) => {
        if(err){
            return res.status(500).send({error: "Internal server error"});
        }
        try{
            user.password = hash;
            await user.save();
            return res.status(201).send({user: user});
        }
        catch(err){
            return res.status(500).send({error: "Internal server error"});
        }
    });
});

module.exports = Router;