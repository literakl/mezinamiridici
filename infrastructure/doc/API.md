#Transport

HTTPS, result codes: https://developer.amazon.com/docs/amazon-drive/ad-restful-api-response-codes.html

#Response 

JSON structure

**Success**

{
 "success": true,
 "data": {}
}

**Validation error**

{
 "success": false,
 "error": {
    "code": 1000,
    "validation": [
        {"arg1": "Validation message"}
    ]
 }
}

**Other error**

{
 "success": false,
 "error": {
    "code": 1000,
    "message": "Error message"
 }
}

**Error codes**

* 1000 missing mandatory argument
* 1001 argument requirements violated
* 1002 unique key constrain violated
* 2000 authorization token missing
* 2001 authorization token expired
* 2002 authorization token invalid
* 3000 database error
* 3001 email server error
