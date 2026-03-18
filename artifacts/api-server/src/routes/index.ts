import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import booksRouter from "./books/index.js";
import searchRouter from "./search/index.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(booksRouter);
router.use(searchRouter);

export default router;
