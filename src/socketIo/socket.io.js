const AuthHelper = require("../helper/auth.helper.js");
const authHelper = new AuthHelper();
const { Server } = require("socket.io");

class SocketIo extends Server {
    constructor(httpServer, configSocketIo) {
        super(httpServer, configSocketIo);

        this.use(this.validateToken.bind(this));

        this.on("connection", (socket) => {

            socket.on("disconnect", () => {
                let listSocketOfUserId = globalThis.socketOfUserId.get(socket.userId)?.arraySockets
                if (listSocketOfUserId?.length == 1) {
                    globalThis.socketOfUserId.delete(socket.userId)
                    return
                }
                listSocketOfUserId?.splice(listSocketOfUserId.indexOf(socket.id), 1)

            });
        });

        console.log("Socket.IO server initialized successfully.");
    }


    async validateToken(socket, next) {
        try {
            const at = socket.handshake?.auth?.at;
            if (!at) {
                return next(this.createError("missing token", 401));
            }

            const validAccessToken = authHelper.verifyAccessToken(at);
            if (!validAccessToken?.state) {
                return next(this.createError(validAccessToken.message, 403));
            }

            const { userId } = validAccessToken.decodeAccessToken;


            const storedToken = globalThis.tokenOfUserId.get(userId)?.at;
            if (at !== storedToken) {
                return next(this.createError("old token detected", 403));
            }


            socket.userId = userId

            if (!globalThis.socketOfUserId.get(userId)?.arraySockets?.length) {

                let userInfor = await globalThis.connection.executeQuery(`select avartar , nickName,userId from user where userId = ${userId}`)
                    .then((data) => {
                        return data[0]
                    })
                    .catch((e) => {
                        throw new Error(e)
                    })

                globalThis.socketOfUserId.set(userId, { arraySockets: [socket.id], userInfor })
            } else {
                globalThis.socketOfUserId.get(userId).arraySockets.push(socket.id)
            }

            next();
        } catch (error) {
            console.log("err when valid socket : ", error);
            next(this.createError("Internal Server Error", 500));
        }
    }

    createError(message, statusCode) {
        const error = new Error(message);
        error.status = statusCode;
        return error;
    }
}

module.exports = SocketIo;
