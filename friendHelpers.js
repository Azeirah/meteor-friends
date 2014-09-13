Template.registerHelper('areFriends', function (friendId) {
    if (validations.hasFriend(Meteor.userId(), friendId)) {
        return validations.validateUserRelations({
            userId: Meteor.userId(),
            status: STATUSES.friend
        }, {
            userId: friendId,
            status: STATUSES.friend
        });
    } else {
        return false;
    }
});

Template.registerHelper('friendRequest', function (friendId) {
    if (validations.hasFriend(Meteor.userId(), friendId)) {
        return validations.validateUserRelations({
            userId: Meteor.userId(),
            status: STATUSES.request
        }, {
            userId: friendId,
            status: STATUSES.pending
        });
    } else {
        return false;
    }
});

Template.registerHelper('friendPending', function (friendId) {
    if (validations.hasFriend(Meteor.userId(), friendId)) {
        return validations.validateUserRelations({
            userId: Meteor.userId(),
            status: STATUSES.pending
        }, {
            userId: friendId,
            status: STATUSES.request
        });
    } else {
        return false;
    }
});

Template.registerHelper('wereFriends', function (friendId) {
    if (validations.hasFriend(Meteor.userId(), friendId)) {
        return validations.validateUserRelations({
            userId: Meteor.userId(),
            status: STATUSES.request
        }, {
            userId: friendId,
            status: STATUSES.pending
        });
    } else {
        return false;
    }
});