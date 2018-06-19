var mongoose = require("mongoose");
var User = mongoose.model("User");
var tools_service = require("../services/app-general");
var mail_services = require("../services/mailing-service");
var const_data = require("../config/constantData");
var TeamFront = mongoose.model("TeamFront");
var Candidature = mongoose.model("Candidature");
var Account = mongoose.model("Account");
var CollaborationType = mongoose.model("CollaborationType");
var Project = mongoose.model("Project");
var ctrlQuestions = require("./questions_ctrl");
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};
var datModelCOllabList = {
    name: "",
    _id: "",
    contexte: "",
    responseTimeUnit: "",
    responseTimeValue: 0
};
/* 
 * Save Project ( Collaboration )
 */
module.exports.saveProjectsDATA = async (req, res) => {
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
/* 
 * Get all Projet ( Collaboration )
 */
module.exports.getAllProjectsCompany = async (req, res) => {
    let acc_curr = req.ACC;
    try {
        let all_ = await Project.find({
            account: acc_curr._id
        }).sort([["addDate", "descending"]]);
        if (all_) {
            let resData = await this.collabListBuild(all_);
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

module.exports.collabListBuild = async arrAll => {
    let resData = [];
    for (let prIndex in arrAll) {
        let pr0 = arrAll[prIndex];
        let reSndt = await this.formatOneCollabForList(pr0);
        resData.push(reSndt);
    }
    return resData;
};

module.exports.formatOneCollabForList = async coll => {
    let m = {};

    if (coll["typeCollab"] == "COLLABPROJINNOV") {
        m.name = coll["dataDetails"]["collabDescribData"].name;
        m._id = coll._id;
        m.contexte = coll["dataDetails"]["collabDescribData"].contexte;
        m.typeCollab = coll["typeCollab"];
    }

    return m;
};
module.exports.getPrByID = async (req, res) => {
    let prID = req.query["projectID"];
    var populateQuery = [
        {
            path: "listeCandidatures"
        },
        {
            path: "account",
            select: "adresse enseigneCommerciale"
        }
    ];
    let datSendModel = {
        name: "",
        _id: "",
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
                    delete prJ.dataDetails.infoConfidentialData;
                    prJ.account["adresse"] = JSON.parse(prJ.account["adresse"])
                        .description.split(",")
                        .pop();
                    return sendJSONresponse(res, 200, {
                        status: "OK",
                        data: prJ
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
        let resUpdate = await Project.findOneAndUpdate(
            {
                _id: pr_id,
                account: acc_id
            },
            req.body.edited,
            {
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
    let applData = req.body.data;

    try {
        let cndt = new Candidature();
        cndt.applicationData = applData;
        cndt.accountID = dataPr["accountProjectOwner"];
        cndt.createdAt = Date.now();
        cndt.userID = req.userDATA._id;
        cndt.projectID = dataPr._id;
        let adrrC = "";
        if (req.body.candidatAccID) {
            let cndCompC = await Account.findById(
                req.body.candidatAccID,
                "adresse"
            );
            if (cndCompC) {
                adrrC = JSON.parse(cndCompC.adresse)
                    .description.split(",")
                    .pop()
                    .trim();
            }
        }
        cndt.countryCD = adrrC;
        cndt.status = "Pending";
        let cndt_appl = await cndt.save();
        if (cndt_appl) {
            sendApplyEmail(req.userDATA, dataPr);
            await ctrlQuestions.addToComminity(
                dataPr["accountProjectOwner"],
                req.userDATA._id,
                "application",
                dataPr._id
            );
            sendJSONresponse(res, 200, {
                status: "OK",
                message: "saved",
                data: {}
            });
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
            mail_services.userEmailAfterApply(userDATA, {
                ens: acc.enseigneCommerciale,
                t: dataPr.name
            });
            let Accuser = await acc.populate({
                path: "userAdmin"
            });
        } else {
        }
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
        }).populate([
            {
                path: "userID"
            },
            {
                path: "projectID"
            }
        ]);
        let applresp = [];
        if (allApplication) {
            applresp = await this.dataApplicationArr(allApplication);
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
        let allApplDetails = await Candidature.findById(applID).populate([
            {
                path: "userID",
                populate: {
                    path: "imageProfile"
                }
            },
            {
                path: "projectID",
                populate: [
                    {
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
            let enseigneCommercialeOrg = await Account.findOne(
                {
                    users: allApplDetails.userID._id
                },
                "enseigneCommerciale"
            );
            if (enseigneCommercialeOrg) {
                ensc = enseigneCommercialeOrg["enseigneCommerciale"];
            }

            let applDtl = allApplDetails.applicationData;
            if ("countryCD" in applDtl) {
                applDtl.countryCD = allApplDetails.countryCD;
            } else {
                applDtl.countryCD = allApplDetails.countryCD;
            }

            let retDetails = {
                _id: allApplDetails._id,
                hour: d.toTimeString().split(" ")[0],
                date: d.toDateString(),
                candidat: {
                    _id: allApplDetails.userID._id,
                    name:
                        allApplDetails.userID.lastname +
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
                    accSlug:
                        allApplDetails.projectID.account.enseigneCommerciale,
                    byUser:
                        allApplDetails.projectID.createdByUser.lastname +
                        " " +
                        allApplDetails.projectID.createdByUser.firstname,
                    typeCollab: allApplDetails.projectID.typeCollab
                },
                applDetail: applDtl
            };
            // data: retDetails,
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: retDetails
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
    const cType = req.query["type"];
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
        let my_collab = await Project.find(
            {
                account: account_id
            },
            "name typeCollab createdByUser addDate"
        )
            .populate([
                {
                    path: "createdByUser",
                    select: "firstname lastname"
                }
            ])
            .sort([["addDate", "descending"]]);
        if (my_collab) {
            let retVal = [];
            for (let col1 of my_collab) {
                let re = Object.create(objMatrice);
                re.name = col1.name;
                re.type = col1.typeCollab;
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
        let currUsrAcc = await Account.find(
            {
                users: userID
            },
            "enseigneCommerciale typeOrganisation "
        ).populate([{ path: "typeOrganisation" }]);
        let prObj = await Project.findById(pID);
        if (prObj) {
            let retData = {};
            if (prObj["typeCollab"] == const_data.collabType.type1) {
                retData = {
                    _id: prObj._id,
                    name: prObj["name"],
                    type: prObj["typeCollab"],
                    typeSelect: "type1",
                    accountProjectOwner: prObj.account,
                    collabData: {
                        contexte: prObj.dataDetails.collabDescribData.contexte,
                        objectif: prObj.dataDetails.collabDescribData.objectif
                    }
                };
                if (currUsrAcc.length) {
                    retData["hasAcc"] = true;
                    retData["userACC"] = currUsrAcc;
                } else {
                    retData["hasAcc"] = false;
                    retData["userACC"] = {
                        enseigneCommerciale:
                            req.userDATA.lastname + " " + req.userDATA.firstname
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

module.exports.userApplicationSent = async () => {};

module.exports.getCollabTypeText = async type => {
    try {
        let cType = await CollaborationType.findOne({
            slug: type
        });
        if (!cType) {
            return "no typed";
        }
        return cType.text;
    } catch (error) {
        console.log(error);
        return "no typed";
    }
};

module.exports.getApplicationByCollabID = async (req, res) => {
    let rIDCollab = req.query["cID"];
    try {
        let allAppl = await Candidature.find({
            accountID: req.ACC._id,
            projectID: rIDCollab
        }).populate([
            {
                path: "userID"
            },
            {
                path: "projectID"
            }
        ]);
        let applresp = [];
        if (allAppl) {
            applresp = await this.dataApplicationArr(allAppl);
        }

        let collB = await Project.findById(rIDCollab);
        let dtColB;
        if (collB) {
            dtColB = await this.formatOneCollabForList(collB);
        } else {
            dtColB = false;
        }
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: {
                collabData: dtColB,
                allApplication: applresp
            }
        });
    } catch (e) {
        console.log(e);
    }
};

/* 
 * Application Data Format 
 */
module.exports.dataApplicationArr = async arrAll => {
    try {
        let arrRes = [];
        for (let aa of arrAll) {
            let formattedAppl = await this.formatApplicationForListData(aa);
            arrRes.push(formattedAppl);
        }
        return arrRes;
    } catch (error) {
        console.log(error);
    }
};

module.exports.formatApplicationForListData = async aa => {
    let d = new Date(aa.createdAt);
    let ensc = "";
    let enseigneCommercialeOrg = await Account.findOne(
        {
            users: aa.userID._id
        },
        "enseigneCommerciale"
    );
    if (enseigneCommercialeOrg) {
        ensc = enseigneCommercialeOrg["enseigneCommerciale"];
    }

    return {
        _id: aa._id,
        countryCD: aa.countryCD,
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
            type: aa.projectID.typeCollab
        }
    };
};

module.exports.getUserSentApplication = async (req, res) => {
    try {
        let userApplication = await Candidature.find({
            userID: req.userDATA._id
        })
            .populate([
                {
                    path: "userID"
                },
                {
                    path: "projectID"
                },
                {
                    path: "accountID",
                    select: "adresse enseigneCommerciale"
                }
            ])
            .sort([["createdAt", "descending"]]);
        let allSentAppl = [];
        if (userApplication) {
            for (let usApplSent of userApplication) {
                let t = await this.formatsApplicationSentData(usApplSent);
                if ("_id" in t) {
                    allSentAppl.push(t);
                }
            }
        }
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: allSentAppl
        });
    } catch (error) {}
};

module.exports.formatsApplicationSentData = async applSent => {
    try {
        let d = new Date(applSent.createdAt);
        let c = JSON.parse(applSent.accountID.adresse)
            .description.split(",")
            .pop();
        let collabType = await this.getCollabTypeText(
            applSent.projectID.typeCollab
        );
        let m = {
            _id: applSent._id,
            date: d.toDateString(),
            country: c,
            orgName: applSent.accountID.enseigneCommerciale,
            typeCollab: collabType,
            collabName: applSent.projectID.name,
            status: "p"
        };
        return m;
    } catch (error) {
        console.log(error);
        return error;
    }
};

/**f
 * Opportuinity
 */
module.exports.getAllProjectsAsOpportinuty = async (req, res) => {
    var id_comp = req.headers["x-ccompany-id"];
    let opportList = [];
    try {
        let allCollab = await Project.find({
            account: {
                $ne: id_comp
            }
        })
            .populate([
                {
                    path: "account",
                    select: "enseigneCommerciale adresse _slug"
                },
                {
                    path: 'createdByUser',
                    select: 'lastname firstname function'
                }
            ])
            .sort([["addDate", "descending"]]);

        for (const coll of allCollab) {
            console.log(coll);
            opportList.push(this.formatOpportuinityCollab(coll));
        }

        return sendJSONresponse(res, 200, {
            status: "OK",
            data: opportList
        });
    } catch (e) {
        console.log(e);
        sendJSONresponse(res, 500, {
            status: "NOK",
            message: "error server"
        });
    }
};

module.exports.formatOpportuinityCollab = colbMdel => {
    let collabCountry = JSON.parse(colbMdel.account.adresse)
        .description.split(",")
        .pop();
    let clMdl = {
        _id: colbMdel._id,
        typeCollab: colbMdel.typeCollab,
        country: collabCountry,
        name: colbMdel.name,
        organisation: colbMdel.account.enseigneCommerciale,
        org_slug: colbMdel.account._slug,
        byUser: colbMdel.createdByUser
    };
    return clMdl;
};
