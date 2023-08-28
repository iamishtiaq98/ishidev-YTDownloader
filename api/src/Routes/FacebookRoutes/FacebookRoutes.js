const  express = require("express") 
const  Controller =require( "../../Controllers/FacebookController/FacebookController") 
const router = express.Router()


router.post('/facebook_detail',Controller.FetchFacebookDetail)
router.get('/facebook_download',Controller.facebookDownload)
module.exports = router