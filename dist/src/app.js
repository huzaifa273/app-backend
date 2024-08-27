"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("../db"));
const userRouter_1 = __importDefault(require("../Router/userRouter"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
(0, db_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Flutter App backend');
});
app.use("/api/user", userRouter_1.default);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
