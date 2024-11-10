const AuthHelper = require('../helper/auth.helper.js')
let authHelper = new AuthHelper()

class AuthMiddleWare {

    checkInforAccessToken(req, res, next) {
        try {

            req.decodeAccessToken = {}

            let at = req.cookies?.at

            if (!at?.length) {
                return res.status(400).json({
                    message: "not found token!"
                })
            }

            let validAccessToken = authHelper.verifyAccessToken(at)

            if (!validAccessToken?.state) {
                return res.status(400).json({
                    message: validAccessToken.message
                })
            }
            req.decodeAccessToken = validAccessToken.decodeAccessToken

            if (at != globalThis.tokenOfUserId.get(req.decodeAccessToken?.userId)?.at) {
                res.cookie("at", "")
                return res.status(400).json({
                    message: "old access token!"
                })
            }

            next()


        } catch (error) {
            console.log("error when decode accesstoken : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }

    }


}



module.exports = AuthMiddleWare

