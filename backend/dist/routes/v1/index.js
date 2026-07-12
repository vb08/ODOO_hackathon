"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const department_routes_1 = __importDefault(require("./department.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const employee_routes_1 = __importDefault(require("./employee.routes"));
const role_routes_1 = __importDefault(require("./role.routes"));
const health_routes_1 = __importDefault(require("./health.routes"));
const environmental_routes_1 = __importDefault(require("./environmental.routes"));
const governance_routes_1 = __importDefault(require("./governance.routes"));
const social_routes_1 = __importDefault(require("./social.routes"));
const gamification_routes_1 = __importDefault(require("./gamification.routes"));
const router = (0, express_1.Router)();
// Namespace all endpoint sub-routers
router.use("/auth", auth_routes_1.default);
router.use("/departments", department_routes_1.default);
router.use("/categories", category_routes_1.default);
router.use("/employees", employee_routes_1.default);
router.use("/roles", role_routes_1.default);
router.use("/health", health_routes_1.default);
router.use("/environmental", environmental_routes_1.default);
router.use("/governance", governance_routes_1.default);
router.use("/social", social_routes_1.default);
router.use("/gamification", gamification_routes_1.default);
exports.default = router;
