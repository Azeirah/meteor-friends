// api
Friends = {};

STATUSES     = {};
STATUSES.pending = "pending"; // for the user who sent the request
STATUSES.friend  = "friend";  // when both users are friends
STATUSES.request = "request"; // for the user on the recieving end of the request
STATUSES.empty   = "empty";   // used for denied requests and removed friends

if (Meteor.isServer) {
    var _onCreateUser = Accounts.onCreateUser.bind(Accounts);
    // Since onCreateUser overrides default behavior, and we don't want to restrict package users
    // by removing the onCreateUser function, we override onCreateUser to modify the user document before the regular onCreateUser call.

    // TODO: This doesn't work, I'll comment it out until someone finds a solution http://stackoverflow.com/questions/25583543/overriding-a-package-method-in-meteor
    // Accounts.onCreateUser = function (func) {
    //     console.log('onCreateUser definition');
    //     _onCreateUser(function (options, user) {
    //         console.log('onCreateUser call, the user should now have a profile');
    //         if (!user.profile) {
    //             user.profile = options.profile || {};
    //         }
    //         if (!user.profile.friends) {
    //             user.profile.friends = [];
    //         }
    //         return func(options, user);
    //     });
    // };

    // TODO: using the dirty way here, now people can't use Accounts.onCreateUser or this package will fail to work. This DOES work though
    Accounts.onCreateUser(function (options, user) {
        if (!user.profile) {
            user.profile = options.profile || {};
        }
        if (!user.profile.friends) {
            user.profile.friends = [];
        }
        return user;
    });
}

Meteor.methods({
    addFriend: function (userId, friendId, status) {
        Meteor.users.update({_id: userId},
            {$addToSet: {"profile.friends": {_id: friendId, status: status}}});
    },
    /**
     * Updates the status of two friends.
     * The first user's status will be applied to the second users reference to
     * the first user and the other way around. The second user's status wil be
     * applied to the first user's reference to the second user.
     *
     * This might be a bit confusing so here's an example
     *
     * We have two users, this state resembles that of just after one
     * user sent a friend request to someone else
     * by user1 to user2
     * user1 {profile.friends = [{
     *   userId: user2,
     *   status: "pending"
     * }]}
     * user2 {profile.friends = [{
     *     userId: user1,
     *     status: "request"
     * }]}
     *
     * calling updateFriendStatus ({
     *     userId: user1,
     *     status: "updatedStatus1" // using fake statuses for clarity
     * },{
     *     userId: user2,
     *     status: "updatedStatus2"
     * })
     *
     * will result in
     * user1 {profile.friends = [{
     *   userId: user2,
     *   status: "updatedStatus2"
     * }]}
     * user2 {profile.friends = [{
     *     userId: user1,
     *     status: "updatedStatus1"
     * }]}
     *
     * The userStatus objects are structured like this
     * {
     *     userId: "340usdfh0932ujweh032ur",
     *     status: "friend" // a status from STATUSES
     * }
     */
    updateFriendStatus: function (userStatus, userStatus2) {
        if (!this.isSimulation) {
            var updateStatus = function (userId, friendId, status) {
                Meteor.users.update({_id: userId, "profile.friends._id": friendId}, {$set: {"profile.friends.$.status": status}});
            };
            updateStatus(userStatus.userId, userStatus2.userId, userStatus2.status);
            updateStatus(userStatus2.userId, userStatus.userId, userStatus.status);
        }
    },
    friendRequest: function (userId, friendId) {
        console.dir(STATUSES);
        if (!validations.areRelated(userId, friendId)) {
            Meteor.call('addFriend', userId, friendId, STATUSES.pending);
            Meteor.call('addFriend', friendId, userId, STATUSES.request);
        }
    },
    confirmRequest: function (userId, friendId) {
        var validated = validations.validateUserRelations(
            {userId: userId, status: STATUSES.pending},
            {userId: friendId, status: STATUSES.request}
        );
        if (validated) {
            Meteor.call('updateFriendStatus',
                {userId: userId, status: STATUSES.friend},
                {userId: friendId, status: STATUSES.friend}
            );
        }
    },
    denyRequest: function (userId, friendId) {
        var validated = validations.validateUserRelations(
            {userId: userId, status: STATUSES.request},
            {userId: friendId, status: STATUSES.pending}
        );
        // TODO: add option to choose between empty for the request sender or
        // pending, for privacy
        if (validated) {
            Meteor.call('updateFriendStatus',
                {userId: userId, status: STATUSES.empty},
                {userId: friendId, status: STATUSES.empty}
            );
        }
    },
    removeFriend: function (userId, friendId) {
        var validated = validations.validateUserRelations(
            {userId: userId, status: STATUSES.friend},
            {userId: friendId, status: STATUSES.friend}
        );
        // TODO: add option to choose between empty for the removed friend or
        // friend, for privacy
        if (validated) {
            Meteor.call('updateFriendStatus',
                {userId: userId, status: STATUSES.empty},
                {userId: friendId, status: STATUSES.empty}
            );
        }
    }
});

/**
 * wrapper method for the Meteor friendRequest method
 */
Friends.friendRequest = function (userId, friendId) {
    Meteor.call('friendRequest', userId, friendId);
};

/**
 * wrapper method for the Meteor confirmRequest method
 */
Friends.confirmRequest = function (userId, friendId) {
    Meteor.call('confirmRequest', userId, friendId);
};

/**
 * wrapper method for the Meteor denyRequest method
 */
Friends.denyRequest = function (userId, friendId) {
    Meteor.call('denyRequest', userId, friendId);
};

/**
 * wrapper method for the Meteor removeFriend method
 */
Friends.removeFriend = function (userId, friendId) {
    Meteor.call('removeFriend', userId, friendId);
};