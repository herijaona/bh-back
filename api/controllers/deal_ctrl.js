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

module.exports.acceptAddApplication = async (req, res) => {
    const accID = req.ACC._id;
    const applicationID = req.body.applicationID
    try {
        let applyData = await Candidature.findOneAndUpdate({
            _id: applicationID
        }, {
            $set: {
                status: 'accepted'
            }
        }, {
            new: true
        })

        if (applyData) {
            let oneDeal = await CollaborationDeal.findOne({
                accountID: accID,
                collaborationObj: applyData.projectID
            });
            if (oneDeal) {
                let oneUpDeal = await CollaborationDeal.findOneAndUpdate({
                    _id: oneDeal._id
                }, {
                    $push: {
                        selectedUser: {
                            applicationData: applicationID,
                            selectionDate: Date.now(),
                            dataExchanges: {
                                files: [],
                                questionsResponse: [],
                                planning: []
                            }
                        }
                    }
                }, {
                    new: true
                })
                if (oneUpDeal) {
                    return sendJSONresponse(res, 200, {
                        status: "OK",
                        message: 'succesfull'
                    })
                }
            } else {
                let data = {
                    accountID: accID,
                    selectedUser: [{
                        applicationData: applicationID,
                        selectionDate: Date.now(),
                        dataExchanges: {
                            files: [],
                            questionsResponse: [],
                            planning: []
                        }
                    }],
                    collaborationObj: applyData.projectID,
                    createdAt: Date.now(),
                    status: 'active',
                    observations: []
                }
                let newDeal = new CollaborationDeal(data);
                await newDeal.save()
                return sendJSONresponse(res, 200, {
                    status: "OK",
                    message: 'succesfully saved'
                })
            }
        }

        return sendJSONresponse(res, 404, {
            status: "NOK",
            message: 'Application data Not valid'
        })


    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: 'Error server'
        })
    }

}

module.exports.getDealSpaceUserList = async (req, res) => {
    let dealSpID = req.query.dealID;
    try {
        let dealSP = await CollaborationDeal.findOne({
            _id: dealSpID
        }).populate([{
            path: 'selectedUser.applicationData',
            populate: [{
                path: 'userID',
                select: 'lastname firstname function'
            }, {
                path: 'userCDAccount',
                select: 'enseigneCommerciale'
            }]
        }])
        let listUser = [];
        if (dealSP && dealSP['selectedUser']) {
            for (const userCD of dealSP['selectedUser']) {
                let m = {
                    user: userCD.applicationData.userID,
                    userAccount: userCD.applicationData.userCDAccount
                }

                listUser.push(m)
            }
        }
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: listUser
        })
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Error server"
        })
    }
}