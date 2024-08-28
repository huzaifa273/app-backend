"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importStar(require("../Model/User"));
const router = (0, express_1.Router)();
//////////////////////////////////////////////////////////////////////////////
/////////////////////////// Create a new user ////////////////////////////////
router.post('/create', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password, phoneNumber, role } = req.body;
        // Check if all required fields are provided
        if (!username || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: 'All fields are required: username, email, password, phoneNumber, role' });
        }
        // Validate role
        if (!Object.values(User_1.UserRole).includes(role)) {
            return res.status(400).json({ message: `Invalid role. Accepted roles are: ${Object.values(User_1.UserRole).join(', ')}` });
        }
        // Check for existing user by email or username
        const existingUser = yield User_1.default.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email or username already exists' });
        }
        // Create and save the new user
        const newUser = new User_1.default({ username, email, password, phoneNumber, role });
        yield newUser.save();
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error: ' + error.message });
        }
        else if (error.code === 11000) { // Duplicate key error code
            return res.status(400).json({ message: 'Duplicate key error: A user with this username or email already exists' });
        }
        // Generic error message for unexpected errors
        res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
        next(error);
    }
}));
/////////////////////////////////////////////////////////////////////////////
////////////////////////// Get all users ////////////////////////////////////
exports.default = router;
