#User object 
* roles: array of user roles in a form collection:role, optional

## Auth section

* email: required, unique, indexed
* pwdHash: bcrypt hash
* pwdTimestamp: password timestamp, required if password is set
* verified: account verification flag, boolean, required
* verifyToken: account verification token
* reset.token: reset password token
* reset.expires: reset token expiration
* oauth: array of used providers (FACEBOOK, TWITTER, GOOGLE, INSTAGRAM, MICROSOFT, LINKEDIN)

## Bio section

* nickname: user's nickname, it must not be changed, required, unique, indexed
* sex: values: man, woman
* born: year
* region: values: PRG, SC, JC, PLS, KV, UST, LBR, KH, PRD, VSC, JM, OLM, ZLN, MS
* edu: values: primary, secondary, university

## Driving section

* since: year when user started to drive
* vehicles: values: bike, car, bus, van, truck, tramway; array

## Prefs section

* public: flag indicating if profile is public, boolean, required
* email.newsletter: newsletter flag, boolean
* email.summary: frequency of summary emails, values: daily, weekly

## Consent section

* consent.terms: timestamp when user accepted terms and conditions, required
* consent.data: timestamp when user accepted data processing, required
* consent.email: timestamp when user approved email notifications

