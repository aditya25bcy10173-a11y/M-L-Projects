import {Router} from 'express';
import {bookTicket, getMyTickets} from '../controllers/ticket.controller';
import { authenticate} from '../middlewares/auth.middleware';

const router = Router();

router.post('/book', authenticate, bookTicket);
router.get('/my', authenticate, getMyTickets);

export default router;
