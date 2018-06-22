var mongoose = require("mongoose");
var TeamFront = mongoose.model("TeamFront");
var tools_service = require("../services/app-general");
var mail_services = require("../services/mailing-service");
var User = mongoose.model("User");
var CollaborationDeal = mongoose.model("CollaborationDeal");
var InvitationSent = mongoose.model("InvitationSent");
var OrganisationInvitation = mongoose.model("OrganisationInvitation");
var Project = mongoose.model("Project");
var Account = mongoose.model("Account");
/** Return DATA */
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
module.exports.getListCollabData = async (req, res) => {
    let accID = req.ACC._id;
    try {
        let dealSP = await CollaborationDeal.find({
            accountID: accID
        }).populate([{
            path: 'collaborationObj',
            populate: {
                path: 'createdByUser',
                select: 'lastname fistname function'
            }
        }]);
        let dealData = [];
        if (dealSP.length > 0) {
            for (const collItem of dealSP) {
                dealData.push(this.dealFormats(collItem));
            }
        }
        return sendJSONresponse(res, 200, {
            status: 'OK',
            data: dealData
        })
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "OK",
            message: 'Error server'
        })
    }

}
module.exports.dealFormats = async (collDeal) => {
    let filesNumber = 0;
    let qRespNumber = 0;
    for (const slctdUsr of collDeal.selectedUser) {
        filesNumber += slctdUsr.dataExchanges.files.length;
        qRespNumber += slctdUsr.dataExchanges.questionsResponse.length;

    }
    let m = {
        _id: collDeal._id,
        byUser: collabDeal.collaborationObj.createdByUser,
        collabData: {
            _id: collabDeal.collaborationObj._id,
            name: collabDeal.collaborationObj.name,
            typeCollab: collabDeal.collaborationObj.typeCollab
        },
        dealNumber: {
            files: filesNumber,
            questions_response: qRespNumber
        }
    }
    return m;
}