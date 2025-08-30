import { ArtistController } from "@/controllers/ArtistController";
import { Router } from "express";

const router = Router();

const artistController = new ArtistController();

router.get("/search", artistController.search);
router.get("/suggest", artistController.suggest);
router.get("/artists/:id", artistController.getArtist)

export { router as artistRouter };
