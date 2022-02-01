# Snippet object
* code: unique identifier within the item; required
* type: type of the object; values: html, link, meta, script, style; required
* date: timestamp; required
* user: identification of the last user who made a change; required
* object: one of meta, html, link, script or style object

## Meta object
* name: value of meta attribute; optional
* property: value of property attribute; optional
* content: value of content attribute; optional

## Html object
* innerHTML: content to be rendered; required

## Link object
* rel: value of rel attribute; optional
* href: value of href attribute; optional

## Script object
* url: value of src attribute; optional
* type: value of type attribute; optional
* innerHTML: content to be rendered inside script tag; optional
* async: boolean value; optional
* defer: boolean value; optional

## Style object
* type: value of type attribute; optional
* cssText: content to be rendered inside style tag; optional

### User section
* id: user id
* nickname: user nickname

