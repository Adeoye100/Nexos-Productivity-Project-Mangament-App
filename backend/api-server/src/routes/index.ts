import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import weatherRouter from "./weather";
import forecastRouter from "./forecast";
import { generateRoomCode } from "../lib/signaling";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(weatherRouter);
router.use(forecastRouter);

router.post("/sync/room-code", (req, res) => {
  const code = generateRoomCode();
  res.json({ code });
});

export default router;
