import { Router } from "express";
import authRoutes from "./auth.routes";
import departmentRoutes from "./department.routes";
import categoryRoutes from "./category.routes";
import employeeRoutes from "./employee.routes";
import roleRoutes from "./role.routes";
import healthRoutes from "./health.routes";
import environmentalRoutes from "./environmental.routes";
import governanceRoutes from "./governance.routes";

const router = Router();

// Namespace all endpoint sub-routers
router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/employees", employeeRoutes);
router.use("/roles", roleRoutes);
router.use("/health", healthRoutes);
router.use("/environmental", environmentalRoutes);
router.use("/governance", governanceRoutes);

export default router;
