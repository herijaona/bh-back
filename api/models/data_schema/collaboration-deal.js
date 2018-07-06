var mongoose = require('mongoose')

var collabDealSchema = new mongoose.Schema({
    accountID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    selectedUser: [{
        applicationData: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candidature'
        },
        selectionDate: Date,
        dataExchanges: {
            files: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'FilesData'
            }],
            questionsResponse: [{}],
            planning: [{}]
        }
    }],
    collaborationObj: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    createdAt: Date,
    status: String,
    observations: [{}]
})
mongoose.model('CollaborationDeal', collabDealSchema)