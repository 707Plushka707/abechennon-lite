const express = require('express');
const router = express.Router();

const OpenPositionController = require('../../controllers/openPosition.controller');

router.get("/", OpenPositionController.display);
router.get("/", OpenPositionController.apiGetAllPositions);
router.post("/", OpenPositionController.apiCreateOpenPosition);
router.get("/openPosition/:id", OpenPositionController.apiGetOpenPositionById);
router.put("/openPosition/:id", OpenPositionController.apiUpdateOpenPosition);
router.delete("/openPosition/:id", OpenPositionController.apiDeleteOpenPosition);

module.exports = router;