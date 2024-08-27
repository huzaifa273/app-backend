"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
console.log("ports ");
// Middleware
app.use(express_1.default.json());
(0, db_1.default)();
// Example route
app.get('/', (req, res) => {
    res.send('Flutter App backend');
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
