import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import weatherRouter from "./weather";
import forecastRouter from "./forecast";
import tasksRouter from "./tasks";
import insightsRouter from "./insights";
import { generateRoomCode } from "../lib/signaling";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(weatherRouter);
router.use(forecastRouter);
router.use(tasksRouter);
router.use(insightsRouter);

router.post("/sync/room-code", (req, res) => {
  const code = generateRoomCode();
  res.json({ code });
});

export default router;
