var mongoose = require("mongoose");
var subjectCommSchema = new mongoose.Schema({
    communitiesID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunitiesData"
    },
    byUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: String,
    creationDate: Date,
    name: String,
    status: String,
    responseAll: [{
        status: String,
        byUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        responseDate: Date,
        responseContent: String,
        dataSuppl: {}
    }]
});
mongoose.model("CommunitySubject", subjectCommSchema);