import {Router} from 'express'
import { UserController } from './controllers/UserController';
import { AuthController } from './controllers/AuthController';

const userController = new UserController();
const authController = new AuthController();

export const router = Router()

router.post("/register", userController.register);
router.post("/login", authController.login);
router.get("/users", userController.listUsers);