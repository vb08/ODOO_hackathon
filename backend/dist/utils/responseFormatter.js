"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
/**
 * Formats and sends standard API response wrappers.
 */
const sendResponse = (res, statusCode, message, data) => {
    const responsePayload = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        data,
    };
    return res.status(statusCode).json(responsePayload);
};
exports.sendResponse = sendResponse;
