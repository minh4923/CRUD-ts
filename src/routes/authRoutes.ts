import { Router } from 'express';
import { login, register } from '../Controllers/authController';
const router = Router();
router.post('/login', login);
router.post('/resgister', register);
export default router;