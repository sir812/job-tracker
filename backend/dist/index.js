"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT ?? 4000);
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', auth_1.default);
app.use('/api/jobs', jobs_1.default);
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
});
