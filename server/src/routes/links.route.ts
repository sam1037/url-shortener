import { Router } from "express";
import * as linksController from "../controllers/links.controller.js";

export const linksRouter = Router();

linksRouter.get("/api/v1/:code/stat", linksController.getShortenURLStat);
linksRouter.post("/api/v1/shorten", linksController.createShortenURL);
linksRouter.get("/:code", linksController.redirectShortenURL); // placed last cuz otherwise itll shadow
