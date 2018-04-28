var express = require("express");
var router = express.Router();
var jwt = require("express-jwt");
var auth = jwt({
	secret: "MY_SECRET",
	userProperty: "payload"
});
var req_mid = require("../services/requestMiddleware");
var ctrlProfile = require("../controllers/profile");
var ctrlAuth = require("../controllers/authentication");
var ctrlUploads = require("../controllers/upload_file");
var ctrCompanies = require("../controllers/companies");
//Middleware

// profile
router.get("/profile", auth, req_mid.validUser, ctrlProfile.profileRead);

//EditProfile
router.post("/profile/edit", auth, req_mid.validUser, ctrlProfile.editprofile);
//EditPassword
router.post("/profile/editpass", auth, req_mid.validUser, ctrlProfile.editpass);

// authentication
router.post("/register", ctrlAuth.register);
router.post("/login", ctrlAuth.login);
router.post("/activate", ctrlAuth.activate_user);
router.post("/reset-password-request", ctrlAuth.requestResetPass);
router.post("/reset-password-check", ctrlAuth.checkResetPass);
router.post("/reset-password-submit-new", ctrlAuth.submitNewPass);

// Uploads
router.post("/up_images", ctrlUploads.uploadImage);
router.post("/up_Mimages", ctrlUploads.multipleFileAdd); //images

//Companies
router.get("/all_companies", ctrCompanies.listall);
router.post(
	"/gen_info_companies",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.general_info
);
/* Post the company general info update */
router.post(
	"/updatecompanies",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.updategeneral_info
);
/* Post update the company Logo*/
router.post(
	"/update-DataImage-companie",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.updateCompanyImage
);
/* Show page config save*/
router.post(
	"/updateCompanyShowPage",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.updatePageShow
);

router.post(
	"/new-presentation",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.AddNewPresentation
);

/*update company images*/
router.post(
	"/updateCompanyImages",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.updateImageBiblio
);

router.get(
	"/biblioImageCompany",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.getCbiblioImage
);

/* Save data about mindset zone*/
router.post(
	"/saveZoneData",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.saveZoneDATA
);

/**/
router.get(
	"/getAdminMindsetData",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrCompanies.getAdminDataMindset
	);

module.exports = router;
