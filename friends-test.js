var main = function (u1, u2) {
    Tinytest.add('Friend request', function (test) {
        Friends.friendRequest(u1._id, u2._id);
        var validated = validations.validateUserRelations({userId: u1._id, status: "request"}, {userId: u2._id, status: "pending"});
        test.equal(validated, true, "Friend request has been validated");
    });

    // Tinytest.addAsync('Friend deny request', function (test, completed) {
    //     Meteor.setTimeout(function () {
    //         Friends.denyRequest(u2._id, u1._id); // user2, the one who got a request is sending a confirm to user 1, who was pending for a confirmation/denial
    //             var validated = validations.validateUserRelations({userId: u1._id, status: "empty"}, {userId: u2._id, status: "empty"});
    //             test.equal(validated, true, "Friend request has been denied");
    //             completed();
    //     }, 300);
    // });

    Tinytest.addAsync('Friend confirm request', function (test, completed) {
        Meteor.setTimeout(function () {
            Friends.confirmRequest(u2._id, u1._id); // user2, the one who got a request is sending a confirm to user 1, who was pending for a confirmation/denial
                var validated = validations.validateUserRelations({userId: u1._id, status: "friend"}, {userId: u2._id, status: "friend"});
                test.equal(validated, true, "Friend request has been confirmed");
                completed();
        }, 100);
    });

    Tinytest.addAsync('Friend remove friend', function (test, completed) {
        Meteor.setTimeout(function () {
            Friends.removeFriend(u2._id, u1._id);
                var validated = validations.validateUserRelations({userId: u1._id, status: "empty"}, {userId: u2._id, status: "empty"});
                test.equal(validated, true, "The two users are not friends anymore");
                completed();
        }, 1400);
    });
};

var userExists = function (username) {
    return function () {
        var uExists = !!Meteor.users.findOne({username: username});
        return uExists;
    };
};

var usersExist = function (arr) {
    return function () {
        var valid = true;
        for (var i = 0; i < arr.length; i++) {
            if (!userExists(arr[i])()) {
                valid = false
            }
        }
        return valid;
    }
};

var createUser = (function () {
    var self = this;
    self.count = 0;

    return function () {
        Accounts.createUser({
            username: 'user' + self.count++,
            password: 'fruit'
        });
    }
}());

var login = function (callback) {
    Meteor.loginWithPassword('user0', 'fruit', callback);
};

var setup = function () {
    if (Meteor.isServer) {
        Meteor.users.remove({}, function () {
            createUser();
            simplePoll(userExists('user0'), createUser, Function.prototype);
        });
    }
    simplePoll(usersExist(['user0', 'user1']), function () {
        login(function (err) {
            if (err) {login();}
        });
        simplePoll(function () {return !!Meteor.user()}, function (err) {
            if (err) {console.log(err);}
            var u0 = Meteor.users.findOne({username: "user0"});
            var u1 = Meteor.users.findOne({username: "user1"});
            main(u0, u1);
        }, Function.prototype, 50, 5000);
    }, Function.prototype);
};

setup();