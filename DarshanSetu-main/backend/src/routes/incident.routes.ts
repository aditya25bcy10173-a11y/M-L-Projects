import { Router } from 'express';
import { raiseSOS, getRecommendation, submitFeedback } from '../controllers/incident.controller';

const router = Router();

router.post('/sos', raiseSOS);
router.post('/:id/recommend', getRecommendation);
router.put('/:id/feedback', submitFeedback);

export default router;