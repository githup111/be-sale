const { createCanvas, loadImage } = require("canvas")
const crypto = require("crypto")


class CommonHelper {


    async generatorCaptcha() {
        try {
            // Tạo văn bản ngẫu nhiên
            let characters = "1234567890qwertyuiopasdfghjklzxcvbbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            let text = "";
            for (let i = 0; i < 5; i++) {
                text += characters[Math.floor(Math.random() * characters.length)];
            }

            // Tạo đối tượng canvas
            let canvas = createCanvas(150, 40);
            let ctx = canvas.getContext("2d");

            // Tạo hình ảnh nền base64
            let base64 = "";
            let colors = ["red", "green", "blue", 'orange', "black"];
            await loadImage(`./src/public/images/bgCaptcha${Math.ceil(Math.random() * 2)}.png`)
                .then((image) => {
                    ctx.drawImage(image, 0, 0);
                    ctx.font = '30px Arial';
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.scale(1.5, .7);

                    // Khoảng cách giữa các chữ
                    let letterSpacing = 15; // Điều chỉnh giá trị này để tăng/giảm khoảng cách
                    let x = 5;

                    // Vẽ từng ký tự với khoảng cách tùy chỉnh
                    for (let i = 0; i < text.length; i++) {
                        ctx.fillText(text[i], x, 30);
                        x += letterSpacing; // Cộng thêm khoảng cách cho vị trí x tiếp theo
                    }

                    // Vẽ các đường nhiễu
                    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
                        ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
                        ctx.lineWidth = Math.ceil(Math.random() * 3);
                        ctx.beginPath();
                        let x = Math.random() * canvas.width / 2;
                        let y = Math.random() * canvas.height / 2;
                        ctx.moveTo(x, y);
                        ctx.lineTo(canvas.width / 2 + canvas.width / 2 - x, canvas.height / 2 + canvas.height / 2 - y);
                        ctx.stroke();
                    }
                    base64 = canvas.toDataURL("image/png");
                });

            const hash = crypto.createHash("md5");
            let key = hash.update(text + process.env.CAPTCHA_SECRECT_KEY + Date.now() + Math.random()).digest('hex');

            globalThis.tokenCaptcha.set(key, {
                isUse: false,
                text,
                date: Date.now() + 15 * 1000
            });

            console.log(globalThis.tokenCaptcha);

            setTimeout(() => {
                globalThis.tokenCaptcha.delete(key);
            }, 15000);

            return {
                text, base64, state: true, key
            };

        } catch (error) {
            throw new Error("error when generatorCaptcha : " + error);
        }
    }

    verifyCaptcha(key, textCaptchaClient) {
        try {
            let captchaData = globalThis.tokenCaptcha.get(key)

            if (!captchaData) {
                return { state: false, message: "not found or expired captcha data!" }
            }

            let { text, date, isUse } = captchaData

            if (isUse) {
                return { state: false, message: "captcha already use!" }
            }

            if (Date.now() > date) {
                return { state: false, message: "captcha expired time!" }
            }

            if (text != textCaptchaClient) {
                captchaData.date = Date.now() - 1
                captchaData.isUse = true
                return { state: false, message: "captcha not valid!" }
            }
            captchaData.date = Date.now() - 1
            captchaData.isUse = true
            return { state: true, message: "valid success!" }

        } catch (error) {
            console.log(error);

            return { state: false, message: "unknown error!", error }
        }
    }



}



module.exports = CommonHelper