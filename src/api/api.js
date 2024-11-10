const api = require("express").Router()
const CommonController = require("../controller/common.controller.js")
const AuthController = require("../controller/auth.controller.js")
const AuthMiddleWare = require("../middleware/auth.middleware.js")
const ManageInventoryController = require("../controller/manageInventory.controler.js")
const PaymentController = require("../controller/payment.controller.js")
const SocketIoController = require("../controller/socketIo.controller.js")


const manageInventoryController = new ManageInventoryController()
const authMiddleWare = new AuthMiddleWare()
let commonController = new CommonController()
let authController = new AuthController()
let paymentController = new PaymentController()
let socketIoController = new SocketIoController()

api.get("/", (req, res) => {
    const forwardedIp = req.headers['x-forwarded-for'] || req.ip
    res.cookie("test", "test")
    res.status(200).json(
        {
            message: "your ip address : " + forwardedIp
        }
    )
})

api.get("/ping", (req, res) => {
    res.status(200).json({
        message: "ok from backend!"
    });
})

api.use("/auth", authMiddleWare.checkInforAccessToken)


api.post("/getNewCaptcha", commonController.getNewCaptcha)
api.post("/login", authController.login)
api.post("/register", authController.register)
api.post("/getNewAccessToken", authController.getNewAccessToken)
api.post("/auth/getInforUser", authController.getInforUser)
api.post("/auth/getSalingItemList", commonController.getSalingItemList)
api.post("/auth/linkAccount", commonController.linkAccount)
api.post("/auth/getInventories", manageInventoryController.getInventories)
api.post("/auth/cancelSalling", manageInventoryController.cancelSalling)
api.post("/auth/purchaseItem", manageInventoryController.purchaseItem)
api.post("/auth/addItemSalling", manageInventoryController.addItemSalling)
api.post("/auth/unLinkAccount", commonController.unLinkAccount)
api.post("/auth/changeNickName", commonController.changeNickName)
// api.post("/auth/getInventoriesOfuserId", manageInventoryController.getInventoriesOfuserId)
api.post("/auth/changePassWord", commonController.changePassWord)
api.post("/auth/searchUserByNickName", commonController.searchUserByNickName)
api.post("/auth/getDataMessagesOfUserId", commonController.getDataMessagesOfUserId)
api.post("/auth/changePrice", commonController.changePrice)
api.post("/auth/buyItem", commonController.buyItem)
api.post("/auth/dropItem", commonController.dropItem)

//transaction
api.post("/auth/createPaymentLink", paymentController.createPaymentLink)
api.post("/auth/checkPayment", paymentController.checkPayment)

//socket
api.post("/auth/testSocket", socketIoController.testSocket)
api.post("/auth/chatWorld", socketIoController.chatWorld)
api.post("/auth/privateMessage", socketIoController.privateMessage)

module.exports = { api }