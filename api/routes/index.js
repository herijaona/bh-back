var express = require("express");
var router = express.Router();
var jwt = require("express-jwt");
var auth = jwt({
	secret: "MY_SECRET",
	userProperty: "payload"
});

/*
*  Middleware
*/
var req_mid = require("../services/requestMiddleware");

/*
* Controllers
*/
var ctrlProfile = require("../controllers/profile");
var ctrlAuth = require("../controllers/authentication");
var ctrlUploads = require("../controllers/upload_file");
var ctrlCompanies = require("../controllers/companies");
var ctrlZones = require("../controllers/zones");
var ctrlTeams = require("../controllers/team_ctrl");
var ctrlProject = require("../controllers/projects_ctrl");
var ctrlPatch = require("../controllers/patchData");

/*
*     ROUTES
*/

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
router.post("/up_Mimages", ctrlUploads.multipleFileAdd);
router.post(
	"/save_videos_no_hosted",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlUploads.saveVideos
); //images

//Companies
router.get("/all_companies", ctrlCompanies.listall);
router.post(
	"/gen_info_companies",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.general_info
);
/* Post the company general info update */
router.post(
	"/updatecompanies",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updategeneral_info
);
/* Post update the company Logo*/
router.post(
	"/update-DataImage-companie",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updateCompanyImage
);
/* Show page config save*/
router.post(
	"/updateCompanyShowPage",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updatePageShow
);

/*update company images*/
router.post(
	"/updateCompanyImages",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updateImageBiblio
);

router.get(
	"/biblioImageCompany",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.getCbiblioImage
);

/* Save data about mindset zone*/
router.post(
	"/saveZoneData",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlZones.saveZoneDATA
);

/* save edit  zone */
router.post(
	"/saveZoneEditData",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlZones.saveZoneEditDATA
);

/* Delete zone*/
router.delete(
	"/zone",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlZones.deleteZoneDATA
);

/* get zone data by id */
router.get(
	"/zone",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlZones.getZoneDATA
);

/* get zone data of one company*/
router.get("/all-zone", req_mid.accReqSlug, ctrlZones.getAllZoneData);

/* */
router.get(
	"/getAdminMindsetData",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.getAdminDataMindset
);

/*
* Check If user IS admin of an Account (Company)
*/
router.get(
	"/check_role",
	auth,
	req_mid.validUser,
	ctrlCompanies.checkRole_userAdmin
);

/* Get company DATA DETAILS*/
/* by slug */
router.get(
	"/company_details",
	req_mid.accReqSlug,
	ctrlCompanies.getCompanyDetailsData
);

/* by user ID*/
router.get(
	"/userCompanyDetails",
	auth,
	req_mid.validUser,
	ctrlCompanies.companyDetailsByUserID,
	ctrlCompanies.getCompanyDetailsData
);

/* Get company presentation */
router.get(
	"/company_presentation",
	req_mid.accReqSlug,
	ctrlCompanies.getCompanyPresentation
);

router.post(
	"/save-presentation",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updatePresentation
);

/**
 *
 *  TEAMS DATA ROUTES
 *
 */

/* Save front team video data */
router.post(
	"/team_front_video",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.saveTeamsFrontVideoData
);

/* Get front team video data */
router.get(
	"/team_front_video",
	req_mid.accReqSlug,
	ctrlTeams.getTeamsFrontVideoData
);

/* Get front team video data */
router.delete(
	"/team_front_video",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.deleteTeamsFrontVideoData
);

/* Get front team video data */
router.put(
	"/team_front_video",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.updateTeamsFrontVideoData
);

/**
 *
 *  PROJECTS DATA ROUTES
 *
 */

router.post(
	"/bh-projects",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.saveProjectsDATA
);

router.get(
	"/bh-projects",
	req_mid.accReqSlug,
	ctrlProject.getAllProjectsCompany
);

router.get(
	"/getProjectbyID",
	ctrlProject.getPrByID
);
/* Specific Route for modify default data*/
router.get("/patchDATA", ctrlPatch.patchDATA);
// router.get("/patchDATA_RESET", ctrlPatch.DeleteCollections);

module.exports = router;
