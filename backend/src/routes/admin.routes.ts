import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  createMaterialSchema,
  updateMaterialSchema,
} from "../validators/admin.validators.js";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/admin.controller.js";

const router: ExpressRouter = Router();

// All admin routes require authentication + ADMIN or SUPER_ADMIN role
router.use(authMiddleware);
router.use(authorize("ADMIN", "SUPER_ADMIN"));

// ─── User Management ─────────────────────────────────────
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.post("/users", validate(createUserSchema), createUser);
router.put("/users/:id", validate(updateUserSchema), updateUser);
router.delete("/users/:id", deleteUser);

// ─── Material Management ────────────────────────────────
router.get("/materials", listMaterials);
router.get("/materials/:id", getMaterial);
router.post("/materials", validate(createMaterialSchema), createMaterial);
router.put("/materials/:id", validate(updateMaterialSchema), updateMaterial);
router.delete("/materials/:id", deleteMaterial);

export default router;
