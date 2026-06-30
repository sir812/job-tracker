import { Router } from 'express';
import axios from 'axios';

const router = Router();
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || (
  process.env.NODE_ENV === 'production'
    ? 'http://ai-backend.railway.internal:8000'
    : 'http://127.0.0.1:8000'
);

router.use(async (req, res, next) => {
  try {
    const targetUrl = `${AI_BACKEND_URL}${req.originalUrl}`;
    
    // Forward the request to FastAPI
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        // Forward authorization header if present
        ...(req.headers.authorization && { Authorization: req.headers.authorization }),
        'Content-Type': 'application/json',
      },
      timeout: 65000, // FastAPI scraper matching can take up to 60s
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
});

export default router;
