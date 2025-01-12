const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = "185e94ea-36ec-461e-9ff3-282e5b52fd3b"; // Replace with your API key

// Endpoint to create an order
app.post('/create-order', async (req, res) => {
    const { username, customerName, customerEmail, customerMobile } = req.body;

    if (!username.startsWith('@')) {
        return res.status(400).json({ status: false, msg: 'Instagram username must start with @.' });
    }

    const clientTxnId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const payload = {
        key: API_KEY,
        client_txn_id: clientTxnId,
        amount: "100",
        p_info: "Instagram Username Verification",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_mobile: customerMobile,
        // Use the Vercel URL for the redirect
        redirect_url: "https://instagram-payment-backend.vercel.app/payment-success",
        udf1: username
    };

    try {
        const response = await axios.post('https://api.ekqr.in/api/create_order', payload);
        if (response.data.status) {
            res.json({
                status: true,
                paymentUrl: response.data.data.payment_url,
                clientTxnId
            });
        } else {
            res.status(500).json({ status: false, msg: response.data.msg });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, msg: 'Failed to create payment order.' });
    }
});

// Endpoint to verify payment
app.post('/verify-payment', async (req, res) => {
    const { clientTxnId, txnDate } = req.body;

    const payload = {
        key: API_KEY,
        client_txn_id: clientTxnId,
        txn_date: txnDate
    };

    try {
        const response = await axios.post('https://api.ekqr.in/api/check_order_status', payload);
        if (response.data.status) {
            res.json({ status: true, data: response.data.data });
        } else {
            res.status(400).json({ status: false, msg: response.data.msg });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, msg: 'Failed to verify payment.' });
    }
});

// Payment success route (Make sure it's deployed on Vercel)
app.get('/payment-success', (req, res) => {
    res.send('Payment was successful!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));