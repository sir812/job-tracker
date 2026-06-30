"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
router.all('/*', async (req, res, next) => {
    try {
        const targetUrl = `${AI_BACKEND_URL}/api${req.path}`;
        // Forward the request to FastAPI
        const response = await (0, axios_1.default)({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                // Forward authorization header if present
                ...(req.headers.authorization && { Authorization: req.headers.authorization }),
                'Content-Type': 'application/json',
            },
            timeout: 65000, // FastAPI scraper matching can take up to 60s
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        }
        else {
            next(error);
        }
    }
});
exports.default = router;
