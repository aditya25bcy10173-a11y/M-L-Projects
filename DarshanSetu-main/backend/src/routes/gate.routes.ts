import { Router } from 'express';
import { validateEntry } from '../controllers/gate.controller';

const router = Router();

router.post('/validate', validateEntry);

export default router;