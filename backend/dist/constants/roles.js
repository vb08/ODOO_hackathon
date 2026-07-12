"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatus = exports.RoleCode = void 0;
/**
 * Standard system role codes.
 * Matches the seeding configurations and database expectations.
 */
var RoleCode;
(function (RoleCode) {
    RoleCode["ADMIN"] = "ADMIN";
    RoleCode["ESG_MANAGER"] = "ESG_MANAGER";
    RoleCode["DEPARTMENT_HEAD"] = "DEPARTMENT_HEAD";
    RoleCode["EMPLOYEE"] = "EMPLOYEE";
})(RoleCode || (exports.RoleCode = RoleCode = {}));
/**
 * Standard HTTP Status Codes for consistent response tracking.
 */
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));
