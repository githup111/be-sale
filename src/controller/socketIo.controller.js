const CommonHelper = require("../helper/common.helper.js")
let commonHelper = new CommonHelper()


class SocketIoController {


    async testSocket(req, res) {
        try {
            let userId = req?.decodeAccessToken?.userId

            globalThis.io.to(globalThis.socketOfUserId.get(userId).arraySockets[0]).emit("message", req.body.message)
            res.status(200).json({
                message: "ok"
            })
        } catch (error) {
            console.log("err when testsocket : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }
    }

    async chatWorld(req, res) {

        try {

            let userId = req?.decodeAccessToken?.userId

            let userInfor = globalThis.socketOfUserId.get(userId)?.userInfor

            if (!userInfor) {
                return res.status(400).json({
                    message: "can't call api for this!"
                })
            }

            let { message } = req.body


            globalThis.io.emit("chat_world", JSON.stringify({ message, userInfor }))

            return res.status(200).json({
                message: "ok"
            })

        } catch (error) {
            console.log("err when chatWorld : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }

    }

    async privateMessage(req, res) {

        try {
            let { recipientUserId, message } = req.body
            let recipientInfor = globalThis.socketOfUserId.get(recipientUserId)?.userInfor || {}


            let senderUserId = req?.decodeAccessToken?.userId
            let senderInfor = globalThis.socketOfUserId.get(senderUserId)?.userInfor

            if (recipientUserId == senderUserId) {
                return res.status(400).json({
                    message: "Bạn không thể tự nhắn tin cho chính mình!"
                })
            }

            if (!recipientUserId || !message) {
                return res.status(400).json({
                    message: "không thấy người nhận hoặc chưa có tin nhắn gửi lên!"
                })
            }

            if (!senderInfor) {
                return res.status(400).json({
                    message: "sender not valid!"
                })
            }

            let arraySocketsSender = globalThis.socketOfUserId.get(senderUserId)?.arraySockets
            let arraySocketsRecipient = globalThis.socketOfUserId.get(recipientUserId)?.arraySockets || []

            for (let socketSender of arraySocketsSender) {
                globalThis.io.to(socketSender).emit("sendMessagePrivate", { message })
            }

            for (let socketRecipient of arraySocketsRecipient) {
                globalThis.io.to(socketRecipient).emit("recipientMessagePrivate", { message, senderInfor })
            }

            await globalThis.connection.executeQuery(`insert into messages (senderUserId,recipientUserId,message,timeSend) values (?,?,?,?)`, [senderUserId, recipientUserId, message, Date.now()])
                .catch((e) => {
                    throw new Error(" err when save message to DB : " + e)
                })

            return res.status(200).json({
                message: "ok"
            })

        } catch (error) {
            console.log("err when privateMessage : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }

    }

}

module.exports = SocketIoController

