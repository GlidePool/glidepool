import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import poolsRouter from "./pools.js";
import positionsRouter from "./positions.js";
import advisorRouter from "./advisor.js";
import liquidityRouter from "./liquidity.js";
import agentsRouter from "./agents.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/pools", poolsRouter);
router.use("/positions", positionsRouter);
router.use("/advisor", advisorRouter);
router.use("/liquidity", liquidityRouter);
router.use("/agents", agentsRouter);

export default router;
