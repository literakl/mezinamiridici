# Snippet object
* code: unique identifier within the item; required
* type: type of the object; values: html, link, meta, script; required
* date: timestamp; required

## Meta optional section
* name: value of meta attribute; optional
* property: value of property attribute; optional
* content: value of content attribute; optional

## Html optional section
* content: content to be rendered; required

## Link optional section
* rel: value of rel attribute; optional
* url: value of href attribute; optional

## Script optional section
* url: value of src attribute; optional
* type: value of type attribute; optional
* innerHTML: content to be rendered inside script tag; optional
* async: boolean value; optional
* defer: boolean value; optional

## Style optional section
* type: value of type attribute; optional
* cssText: content to be rendered inside style tag; optional

### User section
* id: user id
* nickname: user nickname

