const { compare } = require("bcryptjs")
const { Connection } = require("../database/connection.js")
require("dotenv").config({ path: "../../.env" })

const fs = require("fs")

const main = async () => {
    let connection = new Connection()
    await connection.connect()

    // await connection.executeQuery(`CREATE TABLE user (
    // userId int primary key NOT NULL AUTO_INCREMENT,
    // userName varchar(30) not null,
    // passWord varchar(100) not null ,
    // nickName varchar(30) CHARACTER SET utf8mb4,
    // avartar varchar(255) default 'https://i.pinimg.com/736x/97/b6/2f/97b62faf1b0981474fea80d14a6bdcad.jpg',
    // gameId int default -1,
    // isRegSale boolean default 0,
    // isAdmin boolean default 0,
    // balance double default 0 
    // );`)


    //     await connection.executeQuery(`CREATE TABLE gameAccount (
    //     gameId INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     userNameGame VARCHAR(30) NOT NULL,
    //     passWordGame VARCHAR(30) NOT NULL,
    //     userId INT,
    //     CONSTRAINT FK_User_GameAccount FOREIGN KEY (userId) 
    //     REFERENCES user(userId) 
    //     ON DELETE SET NULL 
    //     ON UPDATE CASCADE
    // );`)


    // await connection.executeQuery(`CREATE TABLE item (
    //     itemId int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     image varchar(255) DEFAULT 'https://th.bing.com/th/id/OIP.4u4taK5oLHElvRz5jz7YjAAAAA?rs=1&pid=ImgDetMain',
    //     itemType int DEFAULT 1,
    //      name text CHARACTER SET utf8mb4,
    //     description text CHARACTER SET utf8mb4,
    //     gameId int 
    // );`);


    // await connection.executeQuery(`CREATE TABLE itemSalling (
    //     itemSallingId int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     itemId int,
    //     price double
    // );`);


    // await connection.executeQuery(`
    //         create table saleHistory (
    //             idSaleHistory int primary key NOT NULL AUTO_INCREMENT,
    //             userIdSaler  int,
    //             userIdBuyer int,
    //             itemId int,
    //             price double            
    //         );
    //     `)

    // await connection.executeQuery(`CREATE TABLE payment (
    //     itemSallingId int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     userId int,
    //     amount double,
    //     transId varchar(100)
    // );`);

    // await connection.executeQuery(`CREATE TABLE messages (
    //     messageId int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     senderUserId int,
    //     recipientUserId int,
    //     message text CHARACTER SET utf8mb4,
    //     timeSend double
    // );`);

    // await connection.executeQuery(`CREATE TABLE transaction (
    //     transactionId int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    //     buyerUserId int,
    //     salerUserId int,
    //     amount double,
    //     timeBuy double
    // );`);


    //----------------------------------------------------------------------------------------------------------------------------------


    // await connection.executeQuery(`select price,gameAccount.gameId,user.userId as salesmanUserId from
    //                 (select price,itemId from itemSalling where itemId = ${55} ) as itemSallingFound
    //                 join item on itemSallingFound.itemId = item.itemId
    //                 join gameAccount on gameAccount.gameId = item.gameId
    //                 join user on gameAccount.userId = user.userId
    //     `)
    //     .then((e) => {
    //         fs.writeFileSync("../../testdata.json", JSON.stringify(e))
    //         // console.log(e);
    //     })


    // let data = fs.readFileSync("../../test.json", "utf-8")
    // data = JSON.parse(data)


    // // for (let e of data) {
    // //     await connection.executeQuery(`insert into item (image,name,description,gameId,itemType) values(?,?,?,?,?) `, [e.image, e.name, e.description, 1 + Math.floor(Math.random() * 9), 3])
    // // }

    // for (let i = 154; i <= 321; i++) {
    //     await connection.executeQuery(`update item set description = '${data[i - 154].replaceAll("'", "`")}' where itemId = ${i} `, [i, 700 + 5 * Math.floor(Math.random() * 100)])
    // }
    // // await connection.executeQuery("select name , itemId from item").then((data) => {
    // //     fs.writeFileSync("../../testdata.json", JSON.stringify(data))
    // // })

    // // await connection.executeQuery("update item set image = 'https://th.bing.com/th/id/OIP.5QvXhXYndFUxOCwmC13AlQHaHa?rs=1&pid=ImgDetMain' , name = 'Pankia' where itemId = 382  ")

    // //154-321

    // await connection.executeQuery("select name , description from item where itemType = 2").then((data) => {
    //     fs.writeFileSync("../../testdata.json", JSON.stringify(data))
    // })

    // let avartar = [
    //     "https://th.bing.com/th/id/OIP.q_CCvKhrcf5UuKboHsvZ1gHaEK?w=329&h=185&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    //     "https://mega.com.vn/media/news/2505_liliana-wave3.jpg",
    //     "https://image.voh.com.vn/voh/Image/2023/12/05/voh-skin-dep-nhat-lien-quan-9.jpg",
    //     "https://cdn.sforum.vn/sforum/wp-content/uploads/2022/07/287595346_530647468760731_997619823660877372_n.jpg",
    //     "https://shopgarena.net/wp-content/uploads/2022/08/Nhung-hinh-Nakroth-Thu-nguyen-ve-than-Lien-Quan-dep-nhat.jpg",
    //     "https://th.bing.com/th/id/OIP.c8nfpjAjMbJ7uLUshzNpyQHaHF?rs=1&pid=ImgDetMain",
    //     "https://th.bing.com/th/id/OIP.w14nJ6IDeV3hHuEr8re_dgHaEK?w=273&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7",
    //     "https://th.bing.com/th/id/OIP.E9JTElDX2_J8zScwP46TjQHaEK?rs=1&pid=ImgDetMain",
    //     "https://th.bing.com/th/id/OIP.oon3LxxjFoswuShJBf4dpQHaEj?rs=1&pid=ImgDetMain"
    // ]

    // await connection.executeQuery(`delete from messages `)

    // await connection.executeQuery(`
    //         insert into gameAccount (userNameGame,passWordGame)
    //         values ('gameAccount11' ,'gameAccount11')
    //     `)

    // await connection.executeQuery(`
    //         update user set balance = 9999999999
    //         where nickName = 'phía sau vài cô gái'
    //     `)

    // for (let i = 1; i <= 10; i++) {
    //     await connection.executeQuery(`update user set avartar = '${avartar[i % avartar.length]}' where userId = ${i}`)
    // }


    await connection.disconnect()








}

main()