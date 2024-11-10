const e = require("cors");
const CommonHelper = require("../helper/common.helper.js")
let commonHelper = new CommonHelper()
const bcrypt = require('bcryptjs');


class CommonController {

    async getNewCaptcha(req, res) {

        try {


            let captchaData = await commonHelper.generatorCaptcha()

            if (!captchaData?.state) {
                throw new Error("unknown error when generatorCaptcha")
            }

            return res.status(200).json({
                message: "ok!",
                base64: captchaData.base64,
                key: captchaData.key
            })


        } catch (error) {

            console.log("error when getNewCaptcha :  ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }

    }

    async getSalingItemList(req, res) {
        try {
            let salingItemListData = await globalThis.connection.executeQuery(` 
           SELECT
            i.itemId, 
            i.name,
            i.description,
            i.image,
            i.itemType,
            its.price,
            u.nickName,
            u.avartar,
            u.userId
            FROM user u
            JOIN gameAccount ga ON u.userId = ga.userId
            JOIN item i ON ga.gameId = i.gameId
            JOIN itemSalling its ON i.itemId = its.itemId
            ;
            `)
                .then(data => { return data })
                .catch(err => console.log(err))
            if (!salingItemListData?.length) {
                return res.status(501).json({
                    message: 'Cannot get salingItemListData'
                })
            }
            return res.status(200).json({
                message: 'ok',
                salingItemListData
            })
        }
        catch (err) {
            console.log(`Error when getSalingItemList: ${err}`);
            res.status(500).json({
                message: 'Have wrong'
            })
        }
    }

    async linkAccount(req, res) {
        try {

            let userId = req.decodeAccessToken.userId;

            let { userNameGame, passWordGame, text, key } = req.body;

            if (!userNameGame || !passWordGame || !text || !key) {
                return res.status(400).json({
                    message: "missing data!",
                })
            }

            let valid = commonHelper.verifyCaptcha(key, text)

            if (!valid?.state) {
                return res.status(400).json({
                    message: valid.message,
                })
            }

            let charactersNotValid = ["`", '"', "`"]
            for (let e of charactersNotValid) {
                if (userNameGame.includes(e) || passWordGame.includes(e)) {
                    return res.status(400).json({
                        message: `can't include characters :  ${charactersNotValid.join(" ,")}`
                    })
                }
            }

            let userFound = await globalThis.connection.executeQuery("select * from user where userId = ?", [userId])
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    console.log(e);
                })

            if (userFound.gameId > 0) {
                return res.status(400).json({
                    message: "account already linked!"
                })
            }


            let gameAccount = await globalThis.connection.executeQuery("select * from gameAccount where userNameGame = ? and passWordGame = ?", [userNameGame, passWordGame])
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    console.log(e);
                })

            if (!gameAccount) {
                return res.status(400).json({
                    message: "account game not exist!"
                })
            }

            if (gameAccount?.userId > 0) {
                return res.status(400).json({
                    message: "account game already linked!"
                })
            }

            await globalThis.connection.executeQuery("update user set gameId = ? where userId = ?", [gameAccount.gameId, userFound.userId])
                .catch((e) => {
                    console.log(e);
                })

            await globalThis.connection.executeQuery("update gameAccount set userId = ? where gameId = ?", [userFound.userId, gameAccount.gameId])
                .catch((e) => {
                    console.log(e);
                })


            return res.status(200).json({
                message: "ok"
            })



        } catch (error) {
            console.log("err when link account : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }


    }

    async unLinkAccount(req, res) {

        try {

            let userId = req.decodeAccessToken?.userId;

            let userDataFound = await globalThis.connection.executeQuery(`
                    select * from user 
                    join gameAccount on user.userId = gameAccount.userId
                    where gameAccount.userId = ?
                `, [userId])
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!userDataFound) {
                return res.status(400).json({
                    message: "not found linked account!"
                })
            }

            await globalThis.connection.executeQuery(`update user set gameId = -1 where userId = ${userDataFound.userId}`)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`update gameAccount set userId = ${null} where gameId = ${userDataFound.gameId}`)
                .catch((e) => {
                    throw new Error(e)
                })

            return res.status(200).json({
                message: "ok"
            })

        } catch (error) {
            console.log("err when unLinkAccount : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }

    }

    async changeNickName(req, res) {

        try {
            let userId = req.decodeAccessToken?.userId;

            let newNickName = req.body.newNickName;

            if (!newNickName) {
                return res.status(400).json({
                    message: "missing data!"
                })
            }

            let charactersNotValid = ["`", '"', "`"]
            for (let e of charactersNotValid) {
                if (newNickName.includes(e)) {
                    return res.status(400).json({
                        message: `can't include characters :  ${charactersNotValid.join(" ,")}`
                    })
                }
            }

            await globalThis.connection.executeQuery(`update user set nickName = '${newNickName}'  where userId = ${userId} `)
                .catch((e) => {
                    throw new Error(e)
                })

            return res.status(200).json({
                message: "ok"
            })

        } catch (error) {
            console.log("err when change nickname : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }


    }

    async changePassWord(req, res) {


        try {
            let userId = req.decodeAccessToken?.userId;

            let { oldPassWord, newPassWord } = req.body;

            if (!oldPassWord || !newPassWord) {
                return res.status(400).json({
                    message: "missing data!"
                })
            }

            let charactersNotValid = ["`", '"', "`"]
            for (let e of charactersNotValid) {
                if (oldPassWord.includes(e) || newPassWord.includes(e)) {
                    return res.status(400).json({
                        message: `can't include characters :  ${charactersNotValid.join(" ,")}`
                    })
                }
            }

            let userFound = await globalThis.connection.executeQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!bcrypt.compareSync(oldPassWord, userFound?.password)) {
                return res.status(400).json({
                    message: "old password not correct!"
                })
            }

            const salt = bcrypt.genSaltSync(10);
            let hashPassWord = bcrypt.hashSync(newPassWord, salt)

            await globalThis.connection.executeQuery(`update user set passWord = '${hashPassWord}' where userId = ${userId} `)
                .catch((e) => {
                    throw new Error(e)
                })

            return res.status(200).json({
                message: "ok"
            })


        } catch (error) {
            console.log("err when change passWord : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }

    }

    async searchUserByNickName(req, res) {

        try {

            let nickName = req.body.nickName

            if (!nickName) {
                return res.status(400).json({
                    message: "missing data!"
                })
            }

            let charactersNotValid = ["`", '"', "`"]
            for (let e of charactersNotValid) {
                if (nickName.includes(e)) {
                    return res.status(400).json({
                        message: `can't include characters :  ${charactersNotValid.join(" ,")}`
                    })
                }
            }

            let accountFounds = await globalThis.connection.executeQuery(`select userId, nickName,avartar from user where nickName = '${nickName}'`)
                .then((data) => {
                    return data
                })
                .catch((e) => {
                    throw new Error(e)
                })

            return res.status(200).json({
                message: "ok",
                accountFounds
            })

        } catch (error) {
            console.log("err when searchUserByNickName : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }

    }

    async getDataMessagesOfUserId(req, res) {
        try {

            let userId = req.decodeAccessToken?.userId;

            let dataMessages = await globalThis.connection.executeQuery(
                `select senderUser.nickName as senderNickName , senderUser.avartar as senderAvatar , senderUser.userId as senderUserid,recipientUser.nickName as recipientNickName , recipientUser.avartar as recipientAvatar , recipientUser.userId as recipientUserid ,messOfUser.message as message ,messOfUser.timeSend as timeSend from 
                (select * from messages where senderUserId = ${userId} or recipientUserId = ${userId}) as messOfUser
                join user AS senderUser
                on senderUser.userId = messOfUser.senderUserId
                join user AS recipientUser
                on recipientUser.userId = messOfUser.recipientUserId
            `)
                .then((data) => {
                    return data
                })
                .catch((e) => {
                    throw new Error("err when get dataMessages from db : " + e)
                })

            if (!dataMessages?.length) {
                return res.status(400).json({
                    message: "not found any messages!", dataMessagesHandled: []
                })
            }

            let dataMessagesHandled = dataMessages.map((el) => {
                if (el.senderUserid == userId) {
                    return {
                        isSender: true, message: el.message, inforUser: { nickName: el.recipientNickName, avatar: el.recipientAvatar, userId: el.recipientUserid, timeSend: el.timeSend }
                    }
                } else {
                    return {
                        isSender: false, message: el.message, inforUser: { nickName: el.senderNickName, avatar: el.senderAvatar, userId: el.senderUserid, timeSend: el.timeSend }
                    }
                }
            })
            return res.status(200).json({
                message: "ok",
                dataMessagesHandled
            })


        } catch (error) {
            console.log("err when getDataMessagesOfUserId : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }
    }

    async changePrice(req, res) {
        try {
            let userId = req?.decodeAccessToken?.userId
            let changePrice = Number(req.body.changePrice)
            let itemId = Number(req.body.itemId)
            if (!userId) {
                return res.status(400).json({
                    message: "not found userId!"
                })
            }
            if (!itemId || !changePrice || changePrice <= 0) {
                return res.status(400).json({
                    message: "itemId or price invalid !"
                })
            }

            let dataSalling = await globalThis.connection.executeQuery(`
                select * from user
                join gameAccount on user.userId = gameAccount.userId
                join item on item.gameId = gameAccount.gameid
                right join itemSalling on itemSalling.itemId = item.itemId
                where item.itemId = ${itemId}
            `)
                .then((data) => {
                    return data
                })
                .catch((e) => {
                    console.log(e);
                })

            if (!dataSalling?.length) {
                return res.status(400).json({
                    message: "not found item valid!"
                })
            }

            await globalThis.connection.executeQuery(`UPDATE itemSalling SET price = ${changePrice} WHERE itemId = ${itemId}`)

            return res.status(200).json({
                message: "ok"
            })
        }
        catch (error) {
            console.log("err when addItemSalling : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }
    }

    async buyItem(req, res) {

        try {
            let userId = req?.decodeAccessToken?.userId

            let itemId = Number(req.body.itemId)

            if (!itemId) {
                return res.status(400).json({
                    message: "itemId invalid!"
                })
            }


            let inforBuyer = await globalThis.connection.executeQuery(`
                select gameAccount.gameId , user.balance from user
                join gameAccount on gameAccount.userId = user.userId
                where user.userId = ${userId}
            `)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!inforBuyer) {
                return res.status(400).json({
                    message: "not found linked account!"
                })
            }

            let dataFound = await globalThis.connection.executeQuery(`
                    select price ,user.userId as salesmanUserId from
                    (select price,itemId from itemSalling where itemId = ${itemId} ) as itemSallingFound
                    join item on itemSallingFound.itemId = item.itemId
                    join gameAccount on gameAccount.gameId = item.gameId
                    join user on gameAccount.userId = user.userId
                `)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!dataFound) {
                return res.status(400).json({
                    message: "not found this item!"
                })
            }

            if (inforBuyer.balance < dataFound.price) {
                return res.status(400).json({
                    message: "not enought money to buy this item!"
                })
            }


            await globalThis.connection.executeQuery(`
                update user set balance = balance - ${dataFound.price}
                where userId = ${userId}
            `)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`
                    update user set balance = balance + ${dataFound.price * .95}
                    where userId = ${dataFound.salesmanUserId}
                `)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`
                    delete from itemSalling where itemId = ${itemId}
                `)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`
                    update item set gameId = ${inforBuyer.gameId}
                    where itemId = ${itemId}
                `)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`
                   INSERT INTO transaction (buyerUserId,salerUserId,amount,timeBuy)
                   VALUES (?,?,?,?);
                ` , [userId, dataFound.salesmanUserId, dataFound.price, Date.now()])
                .catch((e) => {
                    throw new Error(e)
                })


            return res.status(200).json({
                message: "ok",
            })

        } catch (error) {
            console.log("err when buyItem : ", error);
            return res.status(500).json({
                message: 'have wrong!'
            })
        }

    }


    async dropItem(req, res) {

        try {
            let userId = req?.decodeAccessToken?.userId
            let itemId = Number(req.body.itemId)

            if (!itemId) {
                return res.status(400).json({
                    message: "itemId invalid !"
                })
            }

            let itemFound = await globalThis.connection.executeQuery(`
                select * from user
                join gameAccount on user.userId = gameAccount.userId
                join item on item.gameId = gameAccount.gameid
                where item.itemId = ${itemId}
            `)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    console.log(e);
                })

            if (!itemFound) {
                return res.status(400).json({
                    message: "not found item valid!"
                })
            }

            await globalThis.connection.executeQuery(`UPDATE item SET gameId = null WHERE itemId = ${itemId}`)

            await globalThis.connection.executeQuery(`UPDATE user SET blance = blance + 100 WHERE userId = ${userId}`)
            await globalThis.connection.executeQuery(`
                delete from itemSalling where itemId = ${itemId}
            `)
                .catch((e) => {
                    throw new Error(e)
                })

            return res.status(200).json({
                message: "ok"
            })
        }
        catch (error) {
            console.log("err when dropItem : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }

    }

}


module.exports = CommonController

