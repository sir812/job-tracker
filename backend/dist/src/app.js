"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./routes/auth"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const scraper_1 = __importDefault(require("./routes/scraper"));
const activities_1 = __importDefault(require("./routes/activities"));
const interviews_1 = __importDefault(require("./routes/interviews"));
const ai_1 = __importDefault(require("./routes/ai"));
const errorHandler_1 = require("./middleware/errorHandler");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({ origin: true, credentials: true }));
exports.app.use(express_1.default.json());
exports.app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
exports.app.use('/api/auth', auth_1.default);
exports.app.use('/api/jobs', jobs_1.default);
exports.app.use('/api/scraper', scraper_1.default);
exports.app.use('/api/activities', activities_1.default);
exports.app.use('/api/interviews', interviews_1.default);
exports.app.use('/api/ai', ai_1.default);
exports.app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
exports.app.use(errorHandler_1.errorHandler);
exports.default = exports.app;
