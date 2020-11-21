#User object 
* roles: array of user roles in a form collection:role, optional

## Auth section

* email: required, unique, indexed
* pwdHash: bcrypt hash
* pwdTimestamp: password timestamp, required if password is set
* active: account is fully activated, boolean, required
* verified: email verification flag, boolean, required
* verifyToken: account verification token
* reset.token: reset password token
* reset.expires: reset token expiration
* linked: array of used providers (facebook, twitter, google)

## Bio section

* nickname: user's nickname, it must not be changed, required, unique, indexed
* sex: values: man, woman
* born: year
* region: values: PRG, SC, JC, PLS, KV, UST, LBR, KH, PRD, VSC, JM, OLM, ZLN, MS
* edu: values: primary, secondary, university
* registered: date when user became a member; required; date
* urls: user's websites and social networks; optional; array of string

## Driving section

* since: year when user started to drive
* vehicles: values: bike, car, bus, van, truck, tramway; array

## Prefs section

* public: flag indicating if profile is public, boolean, required
* email.newsletter: newsletter flag, boolean
* email.summary: frequency of summary emails, values: daily, weekly

## Honors section

* rank: user experience rank; required
* date: date of the last promotion; required
* sharingWeeksList: array of booleans where a user shared a link; optional

### Count section
pollVotes: count of polls a user voted in; int; required
comments: how many comments a user wrote; int; required
commentVotes: count of votes a user has casted; int; required 
blogs: blog stories coumt; int; required
shares: how many links a user shared; int; required
commentVoteRatio: ratio between negative and positive votes; int; optional
sharingWeeks: last consecutive weeks where a user shared some link; int; optional

## Consent section

* consent.terms: timestamp when user accepted terms and conditions, required
* consent.data: timestamp when user accepted data processing, required
* consent.email: timestamp when user approved email notifications

