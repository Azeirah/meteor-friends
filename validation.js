// TODO: These validations should eventually go into Meteor.allow and Meteor.deny
validations = {};

/**
 * Returns a boolean
 * Takes two users and expected friend statuses, these users have to be friends.
 * The status associated with a user object is the status you expect the user to have on the profile of the friend
 * the user-relation-objects are structured as following:
 * {
 *   _id: "340usdfh0932ujweh032ur", // a user Id
 *   status: "friend" // one of the Friend.STATUSES statuses.
 * }
 * if userRelation1 in user2.friends && userRelation2 in user1.friends, that means there's a correct match.
 */
validations.validateUserRelations = function (userRelation, userRelation2) {
    var validateUserRelation = function (user, expected) {
        return _.some(user.profile.friends, function (friend) {
            return friend._id === expected.userId && friend.status === expected.status;
        });
    };
    var user = Meteor.users.findOne({_id: userRelation.userId});
    var userFriend = Meteor.users.findOne({_id: userRelation2.userId});
    return validateUserRelation(user, userRelation2) && validateUserRelation(userFriend, userRelation);
};

/**
 * returns if the "userId" has a friend "friendId"
 */
validations.hasFriend = function (userId, friendId) {
    var user = Meteor.users.findOne({_id: userId});
    return _.contains(user.profile.friends, friendId);
};

/**
 * returns true if both users have a reference to each other, this is the case with new friends otherwise it will false
 * note that it will also return false if users *were* related, for example when someone deleted someone else
 */
validations.areRelated = function (userId, friendId) {
    return validations.hasFriend(userId, friendId) && validations.hasFriend(friendId, userId);
};