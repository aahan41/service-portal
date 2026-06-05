import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import servicesRouter from "./services";
import applicationsRouter from "./applications";
import walletRouter from "./wallet";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import accountRouter from "./account";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(servicesRouter);
router.use(applicationsRouter);
router.use(walletRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(accountRouter);

export default router;
