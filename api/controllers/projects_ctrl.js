var mongoose = require("mongoose");
var User = mongoose.model("User");
var tools_service = require("../services/app-general");
var const_data = require("../config/constantData");
var TeamFront = mongoose.model("TeamFront");
var Candidature = mongoose.model("Candidature");
var Account = mongoose.model("Account");
var CollaborationType = mongoose.model("CollaborationType");
var Project = mongoose.model("Project");
var ctrlQuestions = require("./questions_ctrl");
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};
module.exports.saveProjectsDATA = async (req, res) => {
    // console.log(req.body, req.ACC, req.userDATA);
    let prDATA = req.body;
    prDATA["account"] = req.ACC._id;
    prDATA["createdByUser"] = req.userDATA._id;
    prDATA["vue"] = 0;
    prDATA["addDate"] = Date.now();
    try {
        let pr = new Project(prDATA);
        let sv = await pr.save();
        if (sv) {
            sendJSONresponse(res, 200, {
                status: "OK",
                message: "Reussi",
                data: sv
            });
        }
    } catch (e) {
        console.log(e);
        sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Error serveur"
        });
    }
};
module.exports.getAllProjectsCompany = async (req, res) => {
    let acc_curr = req.ACC;
    /*var populateQuery = [
        { path: "listeCandidatures" },
        { path: "createdByUser" }
    ];*/
    try {
        let all_ = await Project.find({
            account: acc_curr
        });
        if (all_) {
            let datSendModel = {
                name: "",
                _id: "",
                contexte: "",
                responseTimeUnit: "",
                responseTimeValue: 0
            };
            let resData = [];
            for (prIndex in all_) {
                let pr0 = all_[prIndex];
                let m = {};
                if (pr0["typeCollab"] == "COLLABPROJINNOV") {
                    m.name = pr0["dataDetails"]["collabDescribData"].name;
                    m._id = pr0._id;
                    m.contexte =
                        pr0["dataDetails"]["collabDescribData"].contexte;
                }
                var m1 = Object.create(datSendModel);
                var send_data = tools_service.copydata(m1, m);
                resData.push(send_data);
            }
            sendJSONresponse(res, 200, {
                status: "OK",
                message: "List",
                data: resData
            });
        }
    } catch (e) {
        sendJSONresponse(res, 500, {
            status: "NOK",
            message: "error"
        });
        console.log(e);
    }
};
module.exports.getPrByID = async (req, res) => {
    let prID = req.query["projectID"];
    var populateQuery = [{
            path: "listeCandidatures"
        },
        {
            path: "createdByUser"
        }
    ];
    let datSendModel = {
        name: "",
        _id: "",
        responseTimeUnit: "",
        responseTimeValue: 0,
        contexte: "0",
        elementProposition: "",
        listeCandidatures: "",
        objectif: "",
        account: ""
    };
    if (prID) {
        try {
            let prJ = await Project.findOne({
                _id: prID
            }).populate(populateQuery);
            if (prJ) {
                if (prJ["typeCollab"] == const_data.collabType.type1) {
                    let pp = tools_service.copydata(
                        datSendModel,
                        prJ["dataDetails"]["collabDescribData"]
                    );
                    pp.account = prJ['account']
                    pp.listeCandidatures = pp.listeCandidatures.length;
                    pp._id = prJ._id;
                    return sendJSONresponse(res, 200, {
                        status: "OK",
                        data: pp
                    });
                } else {
                    return sendJSONresponse(res, 200, {
                        status: "NOK"
                    });
                }
            } else {
                return sendJSONresponse(res, 404, {
                    status: "NOK",
                    message: "Not Found"
                });
            }
        } catch (e) {
            console.log(e);
            return sendJSONresponse(res, 500, {
                status: "NOK",
                message: "Error server"
            });
        }
    }
};
module.exports.updateProjects = async (req, res) => {
    let pr_id = req.body.id_;
    let acc_id = req.ACC._id;
    try {
        let resUpdate = await Project.findOneAndUpdate({
                _id: pr_id,
                account: acc_id
            },
            req.body.edited, {
                new: true
            }
        );
        if (resUpdate) {
            sendJSONresponse(res, 200, {
                status: "OK",
                message: "Reussi",
                data: resUpdate
            });
        }
    } catch (e) {
        console.log(e);
        sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Error server"
        });
    }
};
module.exports.deleteProjects = async (req, res) => {
    let prDel = req.body;
    let acc = req.ACC;
    try {
        let resDel = await Project.findOneAndRemove({
            _id: prDel._id,
            account: acc._id
        });
        sendJSONresponse(res, 200, {
            status: "OK",
            message: "reussi"
        });
    } catch (e) {
        // statements
        console.log(e);
        sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Error serveur"
        });
    }
};
module.exports.applyToProjects = async (req, res) => {
    let dataPr = req.body.currObj;
    console.log(req.body);
    let applData = req.body.data;
    try {
        let cndt = new Candidature();
        cndt.applicationData = applData;
        cndt.accountID = dataPr["accountProjectOwner"];
        cndt.createdAt = Date.now();
        cndt.userID = req.userDATA._id;
        cndt.projectID = dataPr._id;
        cndt.countryCD =
            cndt.status = "Pending";
        let cndt_appl = await cndt.save();
        if (cndt_appl) {
            sendApplyEmail(req.userDATA, dataPr);
            sendJSONresponse(res, 200, {
                status: "OK",
                message: "saved",
                data: {}
            });
            ctrlQuestions.addToComminity(
                dataPr["account"],
                req.userDATA._id,
                "application"
            );
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};
/* Send apply email */
var sendApplyEmail = async (userDATA, dataPr) => {
    try {
        let acc = await Account.findById(dataPr.account);
        if (acc) {
            tools_service.userEmailAfterApply(userDATA, {
                ens: acc.enseigneCommerciale,
                t: dataPr.name
            });
            let Accuser = await acc.populate({
                path: "userAdmin"
            });
        } else {}
    } catch (e) {
        // statements
        console.log(e);
    }
};

module.exports.getAllCompanyProjectApplication = async (req, res) => {
    let accId = req.ACC._id;
    try {
        let allApplication = await Candidature.find({
            accountID: accId
        }).populate([{
                path: "userID"
            },
            {
                path: "projectID"
            }
        ]);
        console.log(allApplication);
        let applresp = [];
        if (allApplication) {
            for (let aa of allApplication) {
                let d = new Date(aa.createdAt);
                let ensc = "";
                let enseigneCommercialeOrg = await Account.findOne({
                        users: aa.userID._id
                    },
                    "enseigneCommerciale"
                );
                if (enseigneCommercialeOrg) {
                    ensc = enseigneCommercialeOrg["enseigneCommerciale"];
                }
                const ptype = await CollaborationType.findOne({
                    slug: aa.projectID.typeCollab
                }, 'text');
                let pt = '';
                if (ptype) {
                    pt = ptype.text
                }
                let appl_ = {
                    _id: aa._id,
                    countryCD: tools_service.getCountryText(aa.applicationData.countryCD),
                    hour: d.toTimeString().split(" ")[0],
                    date: d.toDateString(),
                    usr: {
                        lastname: aa.userID.lastname,
                        firstname: aa.userID.firstname,
                        email: aa.userID.email,
                        org: ensc
                    },
                    prjt: {
                        _id: aa.projectID._id,
                        name: aa.projectID.name,
                        type: pt
                    }
                };
                applresp.push(appl_);
            }
        }
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: applresp
        });
    } catch (e) {
        // statements
        console.log(e);
    }
};
module.exports.getProjectApplicationDetails = async (req, res) => {
    let applID = req.query.applID;
    try {
        let allApplDetails = await Candidature.findById(applID).populate([{
                path: "userID",
                populate: {
                    path: "imageProfile"
                }
            },
            {
                path: "projectID",
                populate: [{
                        path: "createdByUser"
                    },
                    {
                        path: "account"
                    }
                ]
            }
        ]);
        if (allApplDetails) {
            let d = new Date(allApplDetails.createdAt);
            let ensc = "";
            let enseigneCommercialeOrg = await Account.findOne({
                    users: allApplDetails.userID._id
                },
                "enseigneCommerciale"
            );
            if (enseigneCommercialeOrg) {
                ensc = enseigneCommercialeOrg["enseigneCommerciale"];
            }
            let retDetails = {
                _id: allApplDetails._id,
                hour: d.toTimeString().split(" ")[0],
                date: d.toDateString(),
                usr: {
                    _id: allApplDetails.userID._id,
                    name: allApplDetails.userID.lastname +
                        " " +
                        allApplDetails.userID.firstname,
                    email: allApplDetails.userID.email,
                    org: ensc,
                    function: allApplDetails.userID.function,
                    imageProfile: tools_service.media_url(
                        allApplDetails.userID.imageProfile.url
                    )
                },
                projet: {
                    _id: allApplDetails.projectID._id,
                    name: allApplDetails.projectID.name,
                    accSlug: allApplDetails.projectID.account._slug,
                    byUser: allApplDetails.projectID.createdByUser.lastname +
                        " " +
                        allApplDetails.projectID.createdByUser.firstname
                },
                applDetail: {
                    mainActivityDomain: allApplDetails.mainActivityDomain,
                    secondaryActivityDomain: allApplDetails.secondaryActivityDomain,
                    skillnCompent: allApplDetails.skillnCompent,
                    userActivityDescrib: allApplDetails.userActivityDescrib,
                    dataSuppl: allApplDetails.dataSuppl
                }
            };
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: retDetails,
                v: allApplDetails
            });
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};
module.exports.getAllCollaborationType = async (req, res) => {
    try {
        let allCollab = await CollaborationType.find({});
        if (allCollab.length) {
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: allCollab
            });
        } else {
            return sendJSONresponse(res, 200, {
                status: "NOK"
            });
        }
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK"
        });
    }
};
module.exports.getCountryAll = async (req, res) => {
    const cType = req.query['type'];
    return sendJSONresponse(res, 200, {
        status: "OK",
        data: tools_service.getcountry(cType)
    });
};
module.exports.getAllCollabList = async (req, res) => {
    let objMatrice = {
        name: "",
        type: "",
        date: "",
        _id: "",
        author: "",
        interaction_number: ""
    };
    let account_id = req.ACC._id;
    try {
        let my_collab = await Project.find({
                account: account_id
            })
            .populate([{
                path: "createdByUser",
                select: "firstname lastname"
            }])
            .sort([
                ["addDate", "descending"]
            ]);
        if (my_collab) {
            let retVal = [];
            for (let col1 of my_collab) {
                let re = Object.create(objMatrice);
                re.name = col1.dataDetails.collabDescribData.name;
                re.type = tools_service.getCollabTypeText(col1.typeCollab);
                re.date = new Date(col1.addDate).toDateString();
                re._id = col1._id;
                re.author = col1.createdByUser;
                retVal.push(re);
            }
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: retVal
            });
        } else {
            return sendJSONresponse(res, 200, {
                status: "NOK",
                message: "Empty"
            });
        }
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Server Error"
        });
    }
};

module.exports.getDataForApplication = async (req, res) => {
    let pID = req.query["projectID"];
    let userID = req.userDATA._id;

    try {
        let currUsrAcc = await Account.find({
                users: userID
            },
            "enseigneCommerciale "
        );
        let prObj = await Project.findById(pID);
        if (prObj) {
            let retData = {};
            if (prObj["typeCollab"] == const_data.collabType.type1) {
                retData = {
                    _id: prObj._id,
                    name: prObj.dataDetails.collabDescribData["name"],
                    type: tools_service.getCollabTypeText(prObj["typeCollab"]),
                    typeSelect: "type1",
                    accountProjectOwner: prObj.account
                };
                if (currUsrAcc.length) {
                    retData["hasAcc"] = true;
                    retData["userACC"] = currUsrAcc;
                } else {
                    retData["hasAcc"] = false;
                    retData["userACC"] = {
                        enseigneCommerciale: req.userDATA.lastname + " " + req.userDATA.firstname
                    };
                }
            }
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: retData
            });
        }
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Error server",
            e: e
        });
    }
};

module.exports.userApplicationSent = async () => {

}