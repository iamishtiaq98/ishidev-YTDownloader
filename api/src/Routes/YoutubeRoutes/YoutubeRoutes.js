const express =require("express") 

const router = express.Router()
const Controller = require("../../Controllers/YoutubeController/YoutubeController")

router.post("/youtube",Controller.GetInfo)
router.get("/videoInfo",Controller.fetchVideoInfo)
router.get("/youtube_download",Controller.DownloadFile)

module.exports = router