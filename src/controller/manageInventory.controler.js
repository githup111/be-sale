const fs = require("fs")
const ManageInventoryHelper = require("../helper/manageInventory.helper.js")
const manageInventoryHelper = new ManageInventoryHelper()

class ManageInventoryController {

    async getInventories(req, res) {

        try {
            let userId = req?.decodeAccessToken?.userId
            if (!userId) {
                return res.status(400).json({
                    message: "not found userId!"
                })
            }
            //              
            let dataInventories = await globalThis.connection.executeQuery(`
            select item.itemId,item.image, item.itemType , item.description , itemSalling.price ,item.name from user
            join gameAccount on user.userId = gameAccount.userId
            join item on gameAccount.gameId = item.gameId
            left join itemSalling on itemSalling.itemId = item.itemId 
            where user.userId = ${userId} 
            `)
                .then((data) => {
                    return data
                })
                .catch((e) => {
                    console.log(e);
                })

            // fs.writeFileSync("../../test.json", JSON.stringify(dataInventories))

            return res.status(200).json({
                message: "ok",
                dataInventories: JSON.stringify(dataInventories)
            })


        } catch (error) {

            console.log("err when get inventtories : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }
    }

    async cancelSalling(req, res) {

        try {
            let userId = req?.decodeAccessToken?.userId
            let itemId = Number(req.body.itemId)
            if (!userId) {
                return res.status(400).json({
                    message: "not found userId!"
                })
            }
            if (!itemId) {
                return res.status(400).json({
                    message: "itemId invalid !"
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

            await globalThis.connection.executeQuery(`DELETE FROM itemSalling WHERE itemId = ${itemId}`)

            return res.status(200).json({
                message: "ok"
            })

        } catch (error) {

            console.log("err when cancelSalling ");
            return res.status(500).json({
                message: "have wrong"
            })


        }

    }

    async purchaseItem(req, res) {
        try {
            let userIdBuyer = Number(req?.decodeAccessToken?.userId)

            let { userId: userIdSaller, itemId } = req.body
            userIdSaller = Number(userIdSaller)
            itemId = Number(itemId);

            if (!itemId || !userIdSaller || !userIdBuyer) {
                return res.status(400).json({
                    message: "data purchase not valid!"
                })
            }

            let buyerAccount = globalThis.connection.executeQuery(`select * from user where userId = ${userIdBuyer}`)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            let itemSallingFound = globalThis.connection.executeQuery(`select * from itemSalling where itemId = ${itemId}`)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!itemSallingFound) {
                return res.status(400).json({
                    message: "not found itemSalling!"
                })
            }


            if (buyerAccount?.gameId <= 0) {
                return res.status(400).json({
                    message: "Account not linked yet!"
                })
            }
            if (buyerAccount?.balance < itemSallingFound.price) {
                return res.status(400).json({
                    message: "balance not enought!"
                })
            }

            let purchase = await manageInventoryHelper.tranferItem(userIdSaller, userIdBuyer, itemId)

            if (!purchase?.state) {
                return req.status(400).json({
                    message: purchase.message
                })
            }

            await globalThis.connection.executeQuery(`update user set balance = balance - ${itemSallingFound.price} where userId = ${userIdBuyer} `)
                .catch((e) => {
                    console.log(e);
                })

            await globalThis.connection.executeQuery(`update user set balance = balance + ${itemSallingFound.price * .95} where userId = ${userIdSaller} `)
                .catch((e) => {
                    console.log(e);
                })

            return res.status(200).json({
                message: "ok"
            })


        } catch (error) {

            console.log("err when purchase item : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })
        }
    }

    async addItemSalling(req, res) {

        try {
            let userId = Number(req?.decodeAccessToken?.userId)
            let itemId = Number(req.body.itemId)
            let price = Number(req.body.price)
            if (!userId || !price || !itemId || price <= 0) {
                return res.status(400).json({
                    message: "data sent not valid!"
                })
            }

            let itemFound = await globalThis.connection.executeQuery(`
                    select * from user
                    join gameAccount on gameAccount.userId = user.userId
                    join item on item.gameId = gameAccount.gameId
                    where item.itemId = ${itemId}
                `)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!itemFound) {
                return res.status(400).json({
                    message: "not found item valid!"
                })
            }

            if (itemFound.price) {
                return res.status(400).json({
                    message: "item already salling!"
                })
            }

            await globalThis.connection.executeQuery(`insert into itemSalling (itemId , price) values (?,?)`, [itemId, price])
                .catch((e) => {
                    throw new Error(e)
                })
            return res.status(200).json({
                message: "ok"
            })


        } catch (error) {
            console.log("err when addItemSalling : ", error);
            return res.status(500).json({
                message: "have wrong!"
            })

        }

    }




}


module.exports = ManageInventoryController

