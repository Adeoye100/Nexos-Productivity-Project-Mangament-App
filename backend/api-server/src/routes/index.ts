import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import weatherRouter from "./weather";
import forecastRouter from "./forecast";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(weatherRouter);
router.use(forecastRouter);

export default router;
