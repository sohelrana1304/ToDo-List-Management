const userModel = require('../models/userModel')
const validator = require('../utils/validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// const secretkey = "TodoApp#Sohel_Rana@123"
const secretkey = process.env.secretkey


const signUp = async function (req, res) {
    try {
        const requestBody = req.body

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Details" })
        }

        //Extract Body
        let { enterName, enterEmail, enterPassword, reEnterPassword } = requestBody

        if (!validator.isValid(enterName)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide your Name" })
        }

        if (!validator.isValid(enterEmail)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide your email" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(enterEmail)) {
            return res.status(400).send({ status: false, message: `${enterEmail} is invalid email.Please check.` });
        }

        const isEmailAlreadyUsed = await userModel.findOne({ enterEmail: enterEmail })
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${enterEmail} is already registered.` });
        }

        if (!validator.isValid(enterPassword)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Password" })
        }

        if (!(enterPassword.length >= 8 && enterPassword.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be of min 8 and max 15 characters." })
        }

        if (!validator.isValid(reEnterPassword)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please enter password again" })
        }

        if (!(reEnterPassword.length >= 8 && reEnterPassword.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be of min 8 and max 15 characters." })
        }

        if (enterPassword != reEnterPassword) {
            return res.status(400).send({ status: false, message: "Password not matched" })
        }

        const saltRounds = 10
        const password = await bcrypt.hash(enterPassword, saltRounds)
        const dataForCreation = { enterName, enterEmail, password }

        const signedUpdata = await userModel.create(dataForCreation)
        return res.status(201).send({ status: true, message: "Successfully signed Up", data: signedUpdata })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, Error: err.message })
    }
}

const login = async function (req, res) {
    try {
        const requestBody = req.body
        //Extract Body
        let { email, password } = requestBody

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Detaills" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide email" })
        }

        if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Password" })
        }

        if (!(password.length >= 8 && password.length <= 15)) {
            return res.status(400).send({ status: false, message: "Password should be of min 8 and max 15 characters." })
        }

        const findUser = await userModel.findOne({ enterEmail: email })

        if (!findUser) {
            return res.status(400).send({ status: false, message: "No such user with this email id found" })
        }

        let hashedPassword = findUser.password

        const hashedToNormalPassword = await bcrypt.compare(password, hashedPassword)
        if (!hashedToNormalPassword) {
            return res.status(400).send({ status: false, message: "Password Incorrect" })
        }

        const token = jwt.sign({
            userId: findUser._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60
        }, secretkey)

        return res.status(200).send({ status: true, data: { userId: findUser._id, token: token } })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, Error: err.message })
    }
}


module.exports = {
    signUp, login
}