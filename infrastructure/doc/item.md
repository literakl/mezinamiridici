# Item object
* type: type of the object; required

## Info section
* caption: object title, required
* slug: normalized caption for URL, required, unique, indexed
* date: published timestamp, required, indexed
* published: published flag, required
* picture: stream picture identifier
* tags: array of tags

### Author section
* nickname: user nickname
* id: user id

## Comments section
* count: count of all comments
* last: timestamp of the last comment
