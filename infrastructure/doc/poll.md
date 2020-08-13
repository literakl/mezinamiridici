# Item object
* type: value: poll; required
* votes_count: count of all poll_votes, required

## Info section
* caption: poll question, required
* slug: normalized caption for URL, required, unique, indexed
* date: published timestamp, required, indexed
* published: published flag, required
* picture: stream picture identifier
* tags: array of tags

### Author section
* nickname: user nickname
* id: user id

## Data section

### Votes section
* neutral: sum of all neutral poll_votes, required
* trivial: sum of all trivial poll_votes, required
* dislike: sum of all dislike poll_votes, required
* hate: sum of all hate poll_votes, required

## Comments section
* count: count of all comments
* last: timestamp of the last comment

# Poll vote object
* poll: id of associated item object, required, indexed
* user: id of user, required, indexed 
* date: timestamp of the vote, required
* vote: values: neutral, trivial, dislike, hate; required
* sex: copied from User
* age: calculated from User.bio.born, integer
* region: copied from User
* edu: copied from User
* driving: calculated from User.driving.since integer
* vehicles: copied from User
