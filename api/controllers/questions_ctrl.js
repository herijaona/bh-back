var mongoose = require("mongoose");
var Question = mongoose.model("Question");
var Account = mongoose.model("Account");
var tools_service = require("../services/app-general");
var TeamCommunity = mongoose.model("TeamCommunity");
var TeamFront = mongoose.model("TeamFront");
var User = mongoose.model("User");

var Project = mongoose.model("Project");
/* Response sender*/
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

/* Post Questions*/
module.exports.postQuestions = async (req, res) => {
    let dAbout = req.body.dataAbout;
    let dq = {
        objectRef: req.body.objectRef,
        userAsk: req.userDATA._id,
        addDate: Date.now(),
        question_content: req.body.question_content,
        objectRefID: req.body.objectRefID,
        stateAdmin: "active"
    };
    if ("account" in dAbout) {
        dq["account"] = dAbout.account;
    }
    let qst = new Question(dq);
    try {
        let d_ = await qst.save();
        if (d_) {
            await this.addToComminity(
                d_["account"],
                d_["userAsk"],
                "question",
                "no"
            );
            return sendJSONresponse(res, 200, {
                status: "OK",
                message: " Saved",
                data: d_
            });
        }
    } catch (e) {
        // statements
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK"
        });
    }
};
/* Add inCommunity */
module.exports.addToComminity = async (aCCID, uA, inst, lastData) => {
    try {
        let tComm = await TeamCommunity.findOne({
            account: aCCID,
            "users.us": uA
        });
        console.log(tComm);
        if (tComm) {
            let sf = tComm.users.filter(
                el => el.us.toString() == uA.toString()
            );
            let datUpdate = {};
            if (!tools_service.inArray(inst, sf[0].act)) {
                datUpdate = {
                    $push: {
                        "users.$.act": inst
                    },
                    "users.$.last_objData": lastData,
                    "users.$.last_date": Date.now(),
                    "users.$.last_act": inst
                };
            } else {
                datUpdate = {
                    "users.$.last_objData": lastData,
                    "users.$.last_date": Date.now(),
                    "users.$.last_act": inst
                };
            }

            let tCommUpdate = await TeamCommunity.findOneAndUpdate({
                    account: aCCID,
                    users: {
                        $elemMatch: {
                            us: uA
                        }
                    }
                },
                datUpdate, {
                    new: true
                }
            );
            if (tCommUpdate) {
                return 1;
            }
        }
        let tComms = await TeamCommunity.findOne({
            account: aCCID
        });
        console.log(tComms);
        if (tComms) {
            let ede = {
                $push: {
                    users: {
                        us: uA,
                        act: inst,
                        last_date: Date.now(),
                        last_objData: lastData,
                        last_act: inst
                    }
                }
            };
            let tCommUpdate = await TeamCommunity.findOneAndUpdate({
                    account: aCCID
                },
                ede, {
                    new: true
                }
            );
            if (tCommUpdate) {
                return;
            }
        } else {
            let tc = new TeamCommunity({
                account: aCCID,

                users: [{
                    us: uA,
                    act: inst,
                    last_date: Date.now(),
                    last_objData: lastData,
                    last_act: inst
                }]
            });
            let s = await tc.save();
            if (s) {
                return;
            }
        }
        return;
    } catch (e) {
        // statements
        console.log(e);
    }
};

module.exports.getallquestionsCompany = async (req, res) => {
    let accID = req.ACC._id;
    let qType = req.query["qtype"];
    let qr = {};

    if (qType == "no-project") {
        qr = {
            account: accID,
            objectRef: {
                $ne: "PRT"
            },
            stateAdmin: "active"
        };
    } else {
        qr = {
            account: accID,
            objectRef: "PRT",
            stateAdmin: "active"
        };
    }

    try {
        let allQuest = await Question.find(qr)

            .populate([{
                    path: "userAsk"
                },
                {
                    path: "responseAll.user",
                    select: "lastname firstname"
                }
            ])
            .sort([
                ["addDate", "descending"]
            ]);
        console.log(allQuest);
        if (allQuest) {
            let resp = [];
            for (let qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                if (qq.objectRef == "TMV") {
                    about = "Team";
                } else if (qq.objectRef == "PRT") {
                    let objQ = await Project.findOne({
                        _id: qq.objectRefID
                    }, 'typeCollab name');
                    if (objQ) {
                        about = objQ;
                    }
                } else about = "Others";
                let ensc = "";
                let enseigneCommercialeOrg = await Account.findOne({
                        users: qq.userAsk._id
                    },
                    "enseigneCommerciale"
                );
                if (enseigneCommercialeOrg) {
                    ensc = enseigneCommercialeOrg["enseigneCommerciale"];
                }

                let cnt = this.qLimiteText(qq.question_content)

                let usr = {
                    lastname: qq.userAsk.lastname,
                    firstname: qq.userAsk.firstname,
                    email: qq.userAsk.email,
                    org: ensc
                };
                let respIN = qq.responseAll.length > 0 ? true : false;
                let mat = {
                    _id: qq._id,
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    userAsk: usr,
                    quest_part: cnt,
                    responseIN: qq.responseAll,
                    hasresp: respIN
                };

                resp.push(mat);
            }
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: resp
            });
        }
    } catch (e) {
        // statements
        console.log(e);
    }
};

module.exports.getDetailOnQuestion = async (req, res) => {
    let qID = req.query.qID;
    try {
        let qdata = await Question.findById(qID).populate([{
            path: "userAsk",
            populate: {
                path: "imageProfile"
            }
        }]);
        if (qdata) {
            let d = new Date(qdata.addDate);
            let ensc = "";
            let addrCountry = '';
            let enseigneCommercialeOrg = await Account.findOne({
                    users: qdata.userAsk._id
                },
                "enseigneCommerciale adresse"
            );
            if (enseigneCommercialeOrg) {
                ensc = enseigneCommercialeOrg["enseigneCommerciale"];
                addrCountry = JSON.parse(enseigneCommercialeOrg["adresse"])
                    .description.split(",")
                    .pop().trim();
            }
            let _types = "";
            let dataObj = {};
            switch (qdata.objectRef) {
                case "PRT":
                    let prj = await Project.findById(
                        qdata.objectRefID
                    ).populate([{
                        path: "account"
                    }]);
                    if (prj) {
                        _types = "project";
                        dataObj = {
                            name: prj.name,
                            _id: prj._id,
                            _accSlug: prj.account._slug
                        };
                    }
                    break;
                case "TMV":
                    let tmv = await TeamFront.findById(qdata.objectRefID);
                    _types = "team";
                    if (tmv) {
                        let ww = await User.findById(tmv.data.team_users);
                        dataObj = {
                            _id: ww._id,
                            userOnMail: ww.email,
                            userOnName: ww.lastname + " " + ww.firstname
                        };
                    }
                    break;
            }
            let mq = false;
            if (qdata.userAsk._id.toString() == req.userDATA._id.toString()) {
                mq = true;
            }

            let retDetails = {
                _id: qdata._id,
                hour: d.toTimeString().split(" ")[0],
                date: d.toDateString(),
                stateAdmin: qdata.stateAdmin,
                question_content: qdata.question_content,
                responseIN: await this.formatRespInQ(qdata.responseAll),
                myQst: mq,
                usr: {
                    _id: qdata.userAsk._id,
                    lastname: qdata.userAsk.lastname,
                    firstname: qdata.userAsk.firstname,
                    /* email: qdata.userAsk.email, */
                    org: ensc,
                    orgAddr: addrCountry,
                    function: qdata.userAsk.function,
                    imageProfile: tools_service.media_url(
                        qdata.userAsk.imageProfile.url
                    )
                },
                qObject: {
                    types: _types,
                    dataObj: dataObj
                }
            };

            if (mq) {
                let updateSeen = await Question.findOneAndUpdate({
                    _id: qID
                }, {
                    $set: {
                        'responseAll.$[].state': 'seen'
                    }
                }, {
                    new: true,
                });
            }

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

module.exports.formatRespInQ = async (allResp) => {
    let populatedResp = [];
    for (const itt of allResp) {
        let dw = await User.findOne({
            _id: itt.user
        }, 'firstname lastname function');
        itt.user = dw;
        populatedResp.push(itt)
    }
    return populatedResp;
}

module.exports.archives_questions = async (req, res) => {
    try {
        let archQ = await Question.findByIdAndUpdate({
            _id: req.body.idQ
        }, {
            $set: {
                stateAdmin: "archived"
            }
        }, {
            new: true
        });
        if (archQ) {
            return sendJSONresponse(res, 200, {
                status: "OK"
            });
        }
    } catch (e) {
        // statements
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Erreur serveur"
        });
    }
};

module.exports.replyQuestions = async (req, res) => {
    let responseData = {
        rDate: Date.now(),
        user: req.userDATA._id,
        respText: req.body.response_value,
        state: "not-seen"
    };
    try {
        let qSt = await Question.findByIdAndUpdate(
            req.body.qID, {
                $push: {
                    responseAll: responseData
                }
            }, {
                new: true
            }
        );
        if (qSt) {

            return sendJSONresponse(res, 200, {
                status: "OK",
                data: await this.formatRespInQ(qSt.responseAll)
            });
        }
    } catch (e) {
        // statements
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: 'NOK',
            message: 'Server Error'
        })
    }
};

module.exports.getallCompanyArchives = async (req, res) => {
    let accID = req.ACC._id;
    let qr = {
        account: accID,
        stateAdmin: "archived"
    };

    try {
        let allQuest = await Question.find(qr)

            .populate([{
                    path: "userAsk"
                },
                {
                    path: "responseAll.user",
                    select: "lastname firstname"
                }
            ])
            .sort([
                ["addDate", "descending"]
            ]);
        if (allQuest) {
            let resp = [];
            for (let qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                let abType = ''
                if (qq.objectRef == "TMV") {
                    abType = 'tmv'
                    about = "Questions";
                } else if (qq.objectRef == "PRT") {
                    let objQ = await Project.findOne({
                        _id: qq.objectRefID
                    }, 'typeCollab');
                    if (objQ) {
                        about = objQ.typeCollab;
                        abType = 'prt'
                    }
                }
                let ensc = "";
                let enseigneCommercialeOrg = await Account.findOne({
                        users: qq.userAsk._id
                    },
                    "enseigneCommerciale"
                );
                if (enseigneCommercialeOrg) {
                    ensc = enseigneCommercialeOrg["enseigneCommerciale"];
                }

                let cnt = this.qLimiteText(qq.question_content)

                let usr = {
                    lastname: qq.userAsk.lastname,
                    firstname: qq.userAsk.firstname,
                    /*   email: qq.userAsk.email, */
                    org: ensc
                };
                let respIN = qq.responseAll.length > 0 ? true : false;
                let mat = {
                    _id: qq._id,
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    abType: abType,
                    userAsk: usr,
                    quest_part: cnt,
                    responseIN: qq.responseAll,
                    hasresp: respIN
                };
                resp.push(mat);
            }
            return sendJSONresponse(res, 200, {
                status: "OK",
                data: resp
            });
        }
    } catch (e) {
        // statements
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: "NOK",
            message: "Server Error"
        });
    }
};

module.exports.qLimiteText = (params) => {
    params = params.replace(/\n/g, "")
        .replace(/<(?:.|\n)*?>/gm, "");
    if (params.length > 300) {
        params = params.substr(0, 300) + "...";
    }
    return params
}

module.exports.getMyAskedQuestions = async (req, res) => {
    const userID = req.userDATA._id;
    const typeREF = req.query['qREF'];
    try {
        const allQ = await Question.find({
            userAsk: userID,
            objectRef: typeREF
        }).populate({
            path: 'account',
            select: 'enseigneCommerciale'
        });

        let rtData = [];
        if (allQ) {
            for (const it of allQ) {
                let cl = await Project.findOne({
                    _id: it.objectRefID
                }, 'name typeCollab');
                let nF = false;
                if (it.responseAll.length > 0) {
                    nF = it.responseAll.filter(el => {
                        return el.state == 'not-seen' && el.user.toString() !== userID.toString()
                    }).length > 0 ? true : false;
                }
                let cnt = this.qLimiteText(it.question_content)
                let m = {
                    _id: it._id,
                    account: it.account,
                    date: new Date(it.addDate).toDateString(),
                    hour: new Date(it.addDate).toTimeString().split(" ")[0],
                    collab: cl,
                    interaction: it.responseAll.length,
                    newFlag: nF,
                    resumContent: cnt
                }
                rtData.push(m)
            }
        }
        return sendJSONresponse(res, 200, {
            status: "OK",
            data: rtData
        })
    } catch (e) {
        console.log(e);
        return sendJSONresponse(res, 500, {
            status: 'NOK',
            message: 'Error server'
        })
    }
}