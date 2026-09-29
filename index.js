const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const JWT_SECRET =
require('./router/auth_users.js').JWT_SECRET;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    let token;

    // First check the Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    // If header is unavailable, check the session
    if (!token && req.session.authorization) {
        token = req.session.authorization.accessToken;
    }

    if (!token) {
        return res.status(401).json({
        message: "Access token is required",
    });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach logged-in user information to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
        message: "Invalid or expired access token",
    });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
