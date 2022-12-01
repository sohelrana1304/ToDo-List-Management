const jwt = require('jsonwebtoken')
const secretkey = process.env.secretkey

const userAuth = async function (req, res, next) {

    try {
        let token = req.header('x-auth-key')
        if (!token) {
            return res.status(403).send({ status: false, message: `Missing authentication token in request` })
        }
        let decode = jwt.decode(token)

        if (Date.now() > (decode.exp) * 1000) {
            return res.status(403).send({ status: false, message: `Session Expired, please login again` })
        }
        const verifyToken = jwt.verify(token, secretkey, (err, decode) => {
            if (err) {
                return res.status(500).send({ msg: err })
            } else {
                req.userId = decode.userId
                console.log(decode.userId)
                next()
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = { userAuth }