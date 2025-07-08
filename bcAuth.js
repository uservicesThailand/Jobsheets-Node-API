// bcAuth.js
const axios = require('axios');

let cachedToken = null;
let tokenExpiresAt = 0;

async function getBcAccessToken() {
    const now = Date.now();

    // ใช้ token เดิมถ้ายังไม่หมดอายุ
    if (cachedToken && now < tokenExpiresAt - 60000) {
        return cachedToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.BC_CLIENT_ID);
    params.append('client_secret', process.env.BC_CLIENT_SECRET);
    params.append('scope', 'https://api.businesscentral.dynamics.com/.default');

    try {
        const response = await axios.post(
            `https://login.microsoftonline.com/${process.env.BC_TENANT_ID}/oauth2/v2.0/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const data = response.data;

        if (!data.access_token) {
            throw new Error('ไม่สามารถขอ access token ได้');
        }

        cachedToken = data.access_token;
        tokenExpiresAt = Date.now() + data.expires_in * 1000;

        return cachedToken;
    } catch (error) {
        console.error('Error getting BC token:', error.response?.data || error.message);
        throw new Error('ไม่สามารถขอ access token ได้');
    }
}

module.exports = { getBcAccessToken };
