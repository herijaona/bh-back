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
var ctrlQuestions = require("../controllers/questions_ctrl");
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
router.post("/register", ctrlAuth.registerOrganisation);
router.post("/register-member", ctrlAuth.registerMember);
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

router.post(
	"/updateUserImages",
	auth,
	req_mid.validUser,
	ctrlCompanies.updateUserImageBiblio
);

router.get(
	"/biblioImageCompany",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.getCbiblioImage
);

router.get(
	"/biblioImageUser",
	auth,
	req_mid.validUser,
	ctrlCompanies.getUserImageBb
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

/**
 *
 * check Role by User Id
 */
router.get(
	"/Admincheck_role",
	auth,
	req_mid.validUser,
	ctrlCompanies.checkRoleAdmin
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

/* Invite others person in the team */
router.post(
	"/invite-in-team",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.inviteUserInTeam
);

router.get(
	"/teamsUsers",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.getteamsUsersData
);

router.put(
	"/change_roleAdm",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.changeAdmRole
);

router.delete(
	"/delete-from-team",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.deleteUserFromTeam
);

router.get(
	"/getAccountCommunity",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlTeams.getTeamCommunity
);

router.get("/teams-users", req_mid.accReqSlug, ctrlTeams.getTeamUsers);

router.get("/team-details", ctrlTeams.getTeamUsersDetails);

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

router.put(
	"/bh-projects",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.updateProjects
);

router.delete(
	"/bh-projects",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.deleteProjects
);

router.get(
	"/bh-projects/allCompanyApplication",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.getAllCompanyProjectApplication
);

router.get(
	"/bh-projects/ApplicationDetails",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.getProjectApplicationDetails
);

router.post(
	"/bh-projects-apply",
	auth,
	req_mid.validUser,
	ctrlProject.applyToProjects
);


router.get(
	"/getDataForApplication",
	auth,
	req_mid.validUser,
	ctrlProject.getDataForApplication
);

router.get("/getProjectbyID", ctrlProject.getPrByID);
router.get("/countryList", ctrlProject.getCountryAll);
router.get(
	"/bh-projects/getAllCollabtype",
	ctrlProject.getAllCollaborationType
);

router.get(
	"/admin-cca/getCollabLists",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlProject.getAllCollabList
);

/**
 *
 * SSTR
 *
 **/

router.post(
	"/success-story-new",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.saveNewSstr
);

router.get("/success-story-all", req_mid.accReqSlug, ctrlCompanies.getSstr);

router.delete(
	"/success-story",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.deleteSstr
);

router.put(
	"/success-story",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlCompanies.updateSstr
);

/**
 *
 * Invitation team responsr
 *
 */

router.get("/cInvitationValData", ctrlProfile.checkInvitationVal);
router.post("/cInvitationValData", ctrlProfile.PostInvitationVal);

/*
*
* Questions 
*
*/

router.post(
	"/question-data",
	auth,
	req_mid.validUser,
	ctrlQuestions.postQuestions
);
router.get(
	"/getallCompanyQuestions",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlQuestions.getallquestionsCompany
);

router.get(
	"/getDetailOnQuestion",
	auth,
	req_mid.validUser,
	req_mid.checkRole,
	ctrlQuestions.getDetailOnQuestion
);

router.get("/org_types", ctrlCompanies.getOrgTypes);

/* Specific Route for modify default data*/
router.get("/patchDATA", ctrlPatch.patchDATA);
// router.get("/patchDATA_RESET", ctrlPatch.DeleteCollections);

module.exports = router;
