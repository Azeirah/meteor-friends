Friends package for meteor
====

This package adds friend functionality to Meteor. Users will be able to send friend requests, deny or accept them, and remove friends. It provides template handlers and functions to manage friends.

In the profile of each user is an array of friends.
Each friend looks something like this:

```javascript
{
    _id: "lajdsf903hjrjkbnsg89aw3" // a user ID,
    status: status // can be request, pending, friend or empty
}
```

The *pending* status means that this user sent a request to the associated _id. The user on the receiving end of a request gets a *request* status.
The *friends* status means that the user has befriended the other user. Both users should have a friend status when they are friends.
Users get an *empty* status when a friendship gets removed by Friends.removeFriend or when a request gets denied by Friends.denyRequest.

There are 4 functions that you can use. All of these functions take two user id's. These functions are only available on the client.

### Friends.friendRequest
Send a request from user1 to user2

### Friends.confirmRequest
The person on the receiving end of the request (status: request) should call this to confirm a friend request

### Friends.denyRequest
The person on the receiving end of the request (status: request) should call this to deny a friend request

### Friends.removeFriend
Either friends can call this method to undo their friendship

For ease of use, there are four template helpers as well. All of these operate on the currently logged in user. They all take a userId of a second user.

### {{areFriends friendId}}
Returns true if logged in user and user friendId are friends

### {{friendRequest friendId}}
Returns true if the logged in user sent a friend request to user friendId

### {{friendPending friendId}}
Returns true if the logged in user received a friend request from friendId

### {{wereFriends friendId}}
Returns true if the logged in user and the user friendId were friends, this is the case when either a friend request has been denied, or when a friendship has been removed using `Friends.removeFriend`


#### Warning, for the time being, this package breaks the account.onCreateUser function.

If you need to use that function, edit yours to ensure a profile exists and initialize an empty `friends` array on the profile.
Here's the code this package uses to do this:

```javascript
Accounts.onCreateUser(function (options, user) {
    if (!user.profile) {
        user.profile = options.profile || {};
    }
    if (!user.profile.friends) {
        user.profile.friends = [];
    }
    return user;
});
```