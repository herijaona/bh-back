var express = require("express");
var router = express.Router();
var jwt = require("express-jwt");
var auth = jwt({
	secret: "MY_SECRET",
	userProperty: "payload"
});

var ctrlProfile = require("../controllers/profile");
var ctrlAuth = require("../controllers/authentication");
var ctrlUploads = require("../controllers/upload_file");
var ctrCompanies = require("../controllers/companies");
//Middleware

// profile
router.get("/profile", auth, ctrlProfile.profileRead);

//EditProfile
router.post("/profile/edit", auth, ctrlProfile.editprofile);
//EditPassword
router.post("/profile/editpass", auth, ctrlProfile.editpass);

// authentication
router.post("/register", ctrlAuth.register);
router.post("/login", ctrlAuth.login);
router.post("/activate", ctrlAuth.activate_user);

// Uploads
router.post("/up_images", ctrlUploads.uploadImage); //images

//Companies
router.get("/all_companies", ctrCompanies.listall);

module.exports = router;
