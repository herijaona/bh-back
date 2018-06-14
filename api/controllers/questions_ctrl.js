var mongoose = require("mongoose");
var Question = mongoose.model("Question");
var Account = mongoose.model("Account");
var tools_service = require("../services/app-general");
var TeamCommunity = mongoose.model("TeamCommunity");
var TeamFront = mongoose.model("TeamFront");
var User = mongoose.model("User");

var Project = mongoose.model("Project");
/* Response sender*/
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* Post Questions*/
module.exports.postQuestions = async(req, res) => {
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
module.exports.addToComminity = async(aCCID, uA, inst, lastData) => {
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
            let tCommUpdate = await TeamCommunity.findOneAndUpdate({
                account: aCCID
            }, {
                users: {
                    $push: {
                        us: uA,
                        act: inst,
                        last_date: Date.now(),
                        last_objData: lastData,
                        last_act: inst
                    }
                }
            }, {
                new: true
            });
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

module.exports.getallquestionsCompany = async(req, res) => {
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
            objectRef: "PRT"
        };
    }

    try {
        let allQuest = await Question.find(qr)
            .populate([{
                path: "userAsk"
            }])
            .sort([
                ["addDate", "descending"]
            ]);
        if (allQuest) {
            let resp = [];
            for (let qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                if (qq.objectRef == "TMV") {
                    about = "Team";
                } else if (qq.objectRef == "PRT") {
                    about = "Project";
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

                let cnt = qq.question_content;
                /*      .replace(/\n/g, "")
                    .replace(/<(?:.|\n)*?>/gm, "");
                if (cnt.length > 300) {
                    cnt = cnt.substr(0, 300) + "...";
                }*/

                let usr = {
                    name: qq.userAsk.lastname + " " + qq.userAsk.firstname,
                    email: qq.userAsk.email,
                    org: ensc
                };

                let mat = {
                    _id: qq._id,
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    userAsk: usr,
                    quest_part: cnt
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


module.exports.getallarchivesCompany = async(req, res) => {
    let accID = req.ACC._id;
    let qType = req.query["qtype"];
    let qr = {};

    if (qType == "no-project") {
        qr = {
            account: accID,
            objectRef: {
                $ne: "PRT"
            },
            stateAdmin: "archived"
        };
    } else {
        qr = {
            account: accID,
            objectRef: "PRT"
        };
    }

    try {
        let allQuest = await Question.find(qr)
            .populate([{
                path: "userAsk"
            }])
            .sort([
                ["addDate", "descending"]
            ]);
        if (allQuest) {
            let resp = [];
            for (let qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                if (qq.objectRef == "TMV") {
                    about = "Team";
                } else if (qq.objectRef == "PRT") {
                    about = "Project";
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

                let cnt = qq.question_content;
                /*      .replace(/\n/g, "")
                    .replace(/<(?:.|\n)*?>/gm, "");
                if (cnt.length > 300) {
                    cnt = cnt.substr(0, 300) + "...";
                }*/

                let usr = {
                    name: qq.userAsk.lastname + " " + qq.userAsk.firstname,
                    email: qq.userAsk.email,
                    org: ensc
                };

                let mat = {
                    _id: qq._id,
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    userAsk: usr,
                    quest_part: cnt
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


module.exports.getDetailOnQuestion = async(req, res) => {
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
            let enseigneCommercialeOrg = await Account.findOne({
                    users: qdata.userAsk._id
                },
                "enseigneCommerciale"
            );
            if (enseigneCommercialeOrg) {
                ensc = enseigneCommercialeOrg["enseigneCommerciale"];
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

            let retDetails = {
                _id: qdata._id,
                hour: d.toTimeString().split(" ")[0],
                date: d.toDateString(),
                question_content: qdata.question_content,
                usr: {
                    _id: qdata.userAsk._id,
                    name: qdata.userAsk.lastname + " " + qdata.userAsk.firstname,
                    email: qdata.userAsk.email,
                    org: ensc,
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

module.exports.archives_questions = async(req, res) => {
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
            return sendJSONresponse(res, 200, { status: "OK" });
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


module.exports.getallquestionsCompany = async(req, res) => {
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
            objectRef: "PRT"
        };
    }

    try {
        let allQuest = await Question.find(qr)
            .populate([{
                path: "userAsk"
            }])
            .sort([
                ["addDate", "descending"]
            ]);
        if (allQuest) {
            let resp = [];
            for (let qq of allQuest) {
                let da = new Date(qq.addDate);
                let about = "";
                if (qq.objectRef == "TMV") {
                    about = "Team";
                } else if (qq.objectRef == "PRT") {
                    about = "Project";
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

                let cnt = qq.question_content;
                /*      .replace(/\n/g, "")
                    .replace(/<(?:.|\n)*?>/gm, "");
                if (cnt.length > 300) {
                    cnt = cnt.substr(0, 300) + "...";
                }*/

                let usr = {
                    name: qq.userAsk.lastname + " " + qq.userAsk.firstname,
                    email: qq.userAsk.email,
                    org: ensc
                };

                let mat = {
                    _id: qq._id,
                    hour: da.toTimeString().split(" ")[0],
                    date: da.toDateString(),
                    about: about,
                    userAsk: usr,
                    quest_part: cnt
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


module.exports.replyQuestions = async(req, res) => {
    return sendJSONresponse(res, 200, { status: "OK" });
};