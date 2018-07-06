var mongoose = require("mongoose");
/**
 * Model import
 */
var TeamFront = mongoose.model("TeamFront");
var User = mongoose.model("User");
var CollaborationDeal = mongoose.model("CollaborationDeal");
var Candidature = mongoose.model("Candidature");
var InvitationSent = mongoose.model("InvitationSent");
var OrganisationInvitation = mongoose.model("OrganisationInvitation");
var Project = mongoose.model("Project");
var Account = mongoose.model("Account");
var FilesData = mongoose.model("FilesData");

/**
 *  FIles and services
 */
var mail_services = require("../services/mailing-service");
var tools_service = require("../services/app-general");
var const_data = require("../config/constantData");


/**
 *  Return DATA 
 * 
 **/
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
                dealData.push(await this.dealFormats(collItem));
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
module.exports.dealFormats = async (collabDeal) => {
    let filesNumber = 0;
    let qRespNumber = 0;
    for (const slctdUsr of collabDeal.selectedUser) {
        filesNumber += slctdUsr.dataExchanges.files.length;
        qRespNumber += slctdUsr.dataExchanges.questionsResponse.length;

    }
    let m = {
        _id: collabDeal._id,
        byUser: collabDeal.collaborationObj.createdByUser,
        collabData: {
            _id: collabDeal.collaborationObj._id,
            name: collabDeal.collaborationObj.name,
            typeCollab: collabDeal.collaborationObj.typeCollab
        },
        dealNumber: {
            files: filesNumber,
            questions_response: qRespNumber,
            applicationNum: collabDeal.selectedUser.length
        }
    }
    return m;
}

module.exports.refuseAddApplication = async (req, res) => {
    const applicationID = req.body.applicationID
    try {
        let applyData = await Candidature.findOneAndUpdate({
            _id: applicationID
        }, {
            $set: {
                status: const_data.APPLICATION_STATUS._REFUSED
            }
        }, {
            new: true
        })

        if (applyData.status === const_data.APPLICATION_STATUS._REFUSED) {
            return sendJSONresponse(res, 200, {
                status: 'OK',
                message: 'successfully saved'
            })
        }
        return sendJSONresponse(res, 404, {
            status: 'NOK',
            message: "Not Found"
        })
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: 'NOK',
            message: 'Error Server'
        })
    }
}

module.exports.acceptAddApplication = async (req, res) => {
    const accID = req.ACC._id;
    const applicationID = req.body.applicationID
    try {
        let applyData = await Candidature.findOneAndUpdate({
            _id: applicationID
        }, {
            $set: {
                status: const_data.APPLICATION_STATUS._ACCEPTED
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

module.exports.getDealSpaceUserList = async (spID) => {
    let dealSpID = spID;
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
                select: 'enseigneCommerciale Logo',
                populate: [{
                    path: 'Logo',
                    select: 'url'
                }]
            }]
        }]);
        let listUser = [];
        if (dealSP && dealSP['selectedUser']) {
            for (const userCD of dealSP['selectedUser']) {
                let usAcc = userCD.applicationData.userCDAccount;
                console.log(userCD);
                if (userCD.applicationData.userCDAccount) {
                    usAcc = {
                        enseigneCommerciale: userCD.applicationData.userCDAccount.enseigneCommerciale,
                        logo: tools_service.media_url(userCD.applicationData.userCDAccount.Logo.url)
                    }

                }
                let m = {
                    user: userCD.applicationData.userID,
                    userAccount: usAcc,
                    application: userCD.applicationData._id
                }
                listUser.push(m)
            }
        }

        return listUser;
    } catch (e) {
        console.log(e);
        return null
    }
}

module.exports.getUserQuestionsResponse = async (req, res) => {
    let userID = req.query['userID'];
    let dealID = req.query['dealID'];

    try {
        let spDeal = await CollaborationDeal.findOne({
            _id: dealID
        }).populate([{
            path: 'selectedUser.applicationData'
        }])
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: []
        })
    } catch (e) {
        console.log(e);
    }
}

module.exports.dealDetailsID = async (req, res) => {
    let dID = req.query['dID'];
    try {
        let oneDeal = await CollaborationDeal.findOne({
            _id: dID
        }).populate([{
            path: 'collaborationObj',
            select: 'name'
        }]);
        if (oneDeal) {
            let userList = await this.getDealSpaceUserList(dID);
            let retData = {
                _id: oneDeal._id,
                observations: oneDeal.observations,
                collaborationObj: oneDeal.collaborationObj,
                users: userList
            };

            return sendJSONresponse(res, 200, {
                status: 'OK',
                data: retData,
            })
        }
        return sendJSONresponse(res, 404, {
            status: "NOK",
            message: "Not Found"
        })
    } catch (e) {
        console.log(e);
    }
}

var ctrlProject = require('./projects_ctrl');

module.exports.getApplDefl = async (req, res) => {
    try {
        let dealSP = await CollaborationDeal.findOne({
            _id: req.query.dID
        }, 'selectedUser');

        if (dealSP) {
            let selct0 = dealSP.selectedUser[0];
            req.query['applID'] = selct0.applicationData;
            return ctrlProject.getProjectApplicationDetails(req, res)
        }
        return sendJSONresponse(res, 404, {
            status: 'NOK',
            message: 'Not Found'
        })

    } catch (e) {
        console.log('Error getApplDefl');
        console.log(e);
    }
}


module.exports.getDEalFilesList = async (req, res) => {
    let applID = req.query['dID'];
    try {
        let dealSP = await CollaborationDeal.findOne({
            'selectedUser.applicationData': applID
        }, 'selectedUser').populate({
            path: 'selectedUser.dataExchanges.files',
            populate: [{
                path: 'userADD',
                select: "firstname lastname"
            }]
        });
        if (dealSP) {
            let da = dealSP.selectedUser.filter(el => el.applicationData.toString() === applID.toString())[0];
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: da.dataExchanges.files
            })
        }
        return sendJSONresponse(res, 404, {
            status: 'NOK',
            message: 'Not Found'
        })
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: 'NOK',
            message: 'Not Found'
        })
    }
}

module.exports.updateFilesAdd = async (req, res) => {
    let filesList = req.body.allFiles;
    let idAppl = req.body.idAppl;
    try {
        let idTab = [];
        for (const iter of filesList) {
            let r = await FilesData.findOneAndUpdate({
                _id: iter
            }, {
                $set: {
                    userADD: req.userDATA._id
                }
            }, {
                new: true
            });
            if (r) {
                idTab.push(r._id);
            }
        }

        console.log(idTab);

        let t = await CollaborationDeal.findOneAndUpdate({
            selectedUser: {
                $elemMatch: {
                    applicationData: idAppl
                }
            }
        }, {
            $push: {
                'selectedUser.$.dataExchanges.files': {
                    $each: idTab
                }
            }
        }, {
            new: true
        })
        if (t) {
            console.log('*********');
            console.log(t);
            return sendJSONresponse(res, 200, {
                status: "OK"
            })
        }
    } catch (e) {
        console.log(e);
    }
}