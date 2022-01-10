# Item object
* _id: time based generated id 
* type: type of the object; values: poll, blog, page; required

## Info section
* caption: object title, required
* slug: normalized caption for URL, required, unique, indexed
* date: published timestamp, required, indexed. Order of _id and info.date may not be aligned.
* state: item lifecycle flagg, required
  * draft: not ready for visitors yet 
  * published: visible item
  * hidden: low quality post hidden in the item stream
* picture: stream picture path from root; required
* tags: array of tags

### Author section
* id: user id
* nickname: user nickname

## Data section
* depends on type of object

## Comments section
* count: count of all comments; required
* last: timestamp of the last comment
