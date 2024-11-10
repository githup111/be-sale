



class ManageInventoryHelper {


    async tranferItem(userIdSender, userIdReceiver, itemId) {
        try {

            itemId = Number(itemId)
            userIdSender = Number(userIdSender) // saller
            userIdReceiver = Number(userIdReceiver) // buyer
            if (!userIdReceiver || !userIdSender || !itemId) {
                return {
                    state: false,
                    message: 'data notValid !'
                }
            }


            let userIdSender = await globalThis.connection.executeQuery(` select gameId from gameAccount where userId = ${userIdSender}`)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })
            if (!userIdSender) {
                return {
                    state: false,
                    message: "not found gameAccount of sender",
                }
            }


            let gameIdReceiver = await globalThis.connection.executeQuery(` select gameId from gameAccount where userId = ${userIdReceiver}`)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })
            if (!gameIdReceiver) {
                return {
                    state: false,
                    message: "not found gameAccount of receiver",
                }
            }

            let itemFound = await globalThis.connection.executeQuery(`
                    select * from user
                    join gameAccount on gameAccount.userId = user.userId
                    join item on gameAccount.gameId = item.gameId
                    join itemSalling on itemSalling.itemId = item.itemId
                    where item.itemId = ${itemId} and gameAccount.gameId = ${userIdSender}
                `)
                .then((data) => {
                    return data[0]
                })
                .catch((e) => {
                    throw new Error(e)
                })

            if (!itemFound) {
                return {
                    state: false,
                    message: "not found item valid!",
                }
            }


            await globalThis.connection.executeQuery(` update item set gameId = ${gameIdReceiver} where itemId = ${itemId}`)
                .catch((e) => {
                    throw new Error(e)
                })

            await globalThis.connection.executeQuery(`insert into saleHistory (userIdSaler ,userIdBuyer,itemId,price ) values (? ,? , ?) ;`, [userIdSender, userIdReceiver, itemId, itemFound.price])
                .catch((e) => {
                    console.log("err when tranferItem : ", e);
                })

            return {
                state: true,
                message: "succcess!"
            }


        } catch (error) {
            console.log("err when tranfer Item : ", error);
            return {
                state: false,
                message: "have wrong when tranfer",
            }

        }

    }

}







module.exports = ManageInventoryHelper

