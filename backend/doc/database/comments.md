#Comment object
* itemId: _id of item for which this discussion is created; required; indexed
* parentId: _id of parent comment; optional; indexed
* date: ISO date when the comment was created
* text: comment content; required
* up: number of upvotes; required
* down: number of downvotes; required

## Author section
* id: user id
* nickname: user nickname

# Comment vote object
* commentId: id of associated comment object; required, indexed
* vote: values: 1 for upvote, -1 for downvote
