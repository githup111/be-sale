const jwt = require("jsonwebtoken")
require("dotenv").config({ path: "../../.env" })

class AuthHelper {

    #ACCESS_TOKEN_SECRECT_KEY = process.env.ACCESS_TOKEN_SECRECT_KEY
    #REFRESH_TOKEN_SECRECT_KEY = process.env.REFRESH_TOKEN_SECRECT_KEY
    #EXPIRED_TIME_ACCESS_TOKEN = process.env.EXPIRED_TIME_ACCESS_TOKEN
    #EXPIRED_TIME_REFRESH_TOKEN = process.env.EXPIRED_TIME_REFRESH_TOKEN

    generatorAccessToken(payload) {

        try {

            let at = jwt.sign(payload, this.#ACCESS_TOKEN_SECRECT_KEY, { expiresIn: this.#EXPIRED_TIME_ACCESS_TOKEN })
            return { state: true, at }

        } catch (error) {
            throw new Error("err when generator access token : " + error)
        }

    }

    generatorRefreshToken(payload) {

        try {

            let rt = jwt.sign(payload, this.#REFRESH_TOKEN_SECRECT_KEY, { expiresIn: this.#EXPIRED_TIME_REFRESH_TOKEN })
            return { state: true, rt }

        } catch (error) {
            throw new Error("err when generator refresh token : " + error)
        }

    }


    verifyAccessToken(at) {

        try {
            let decodeAccessToken = jwt.verify(at, this.#ACCESS_TOKEN_SECRECT_KEY)
            return { state: true, decodeAccessToken }

        } catch (error) {
            console.log("error when verifyAccessToken : ", error);
            return { state: false, message: "unauthorized!" }
        }

    }


    verifyRefreshToken(rf) {
        try {
            let decodeRefreshToken = jwt.verify(rf, this.#REFRESH_TOKEN_SECRECT_KEY)
            return { state: true, decodeRefreshToken }

        } catch (error) {
            console.log("error when verifyRefreshToken : ", error);
            return { state: false, message: "rt invalid!" }
        }
    }


}




module.exports = AuthHelper