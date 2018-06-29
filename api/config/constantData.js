let CONSTData = {};
CONSTData.collabType = {
	type1: "COLLABPROJINNOV",
	type2: "COLLABSUBJINNOV",
	type3: "COLLABINCUB",
	type4: "COLLABINVEST"
};

CONSTData.collabTypeText = [{
		slug: "COLLABSUBJINNOV",
		text: "Suggestions",
		type: 2
	},
	{
		slug: "COLLABPROJINNOV",
		text: "Project",
		type: 1
	},
	{
		slug: "COLLABINCUB",
		text: "Incubation",
		type: 3
	},
	{
		slug: "COLLABINVEST",
		text: "Investment",
		type: 4
	}
];

CONSTData.APPLICATION_STATUS = {
	_ACCEPTED: 'accepted',
	_PENDING: 'pending',
	_REFUSED: 'refused'
}

CONSTData.COLLAB_STATUS = {
	_ACTIVE: 'active',
	_STOPPED: 'stopped',
	_PAUSED: 'paused'
}
CONSTData.COMMSUBJECT_STATUS = {
	_ACTIVE: 'active',
	_CLOSED: 'closed'
}
CONSTData.QST_OBJ_REF = {
	_PROJECT: 'PRT',
	_QUESTION: 'TMV',
	_IDEA: 'IDEA'
}
module.exports = CONSTData;