const crypto = require("crypto")
const axios = require("axios")


class PaymentHelper {

    createSignature = ({ orderCode, amount, description, cancelUrl, returnUrl }, checksumKey) => {
        console.log(checksumKey);

        const baseString = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
        return crypto.createHmac('sha256', checksumKey).update(baseString).digest('hex');
    };

    async create_payment_link({ orderCode, amount, description, cancelUrl, returnUrl }, checksumKey = process.env.checksumKey, x_client_id = process.env.x_client_id, x_api_key = process.env.x_api_key) {
        try {
            console.log(checksumKey);
            console.log(x_client_id);
            console.log(x_api_key);


            const signature = this.createSignature({ orderCode, amount, description, cancelUrl, returnUrl }, checksumKey);


            const response = await axios.post("https://api-merchant.payos.vn/v2/payment-requests", {
                orderCode,
                amount,
                description,
                cancelUrl,
                returnUrl,
                signature,
                expiredAt: Math.floor(Date.now() / 1000) + 600,
            }, {
                headers: {
                    'x-client-id': x_client_id,
                    'x-api-key': x_api_key
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error when creating payment link:", error);
        }
    }
    async checkPayMent(transId, x_client_id = process.env.x_client_id, x_api_key = process.env.x_api_key) {
        try {

            return await axios.get(`https://api-merchant.payos.vn/v2/payment-requests/${transId}`, {
                headers: {
                    'x-client-id': x_client_id,
                    'x-api-key': x_api_key
                }
            })
                .then((res) => {
                    return res.data
                })

        } catch (error) {
            console.log("errr when checkPayMent", error);

        }
    }
}



module.exports = PaymentHelper

