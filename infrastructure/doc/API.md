#Transport

HTTPS, result codes: https://developer.amazon.com/docs/amazon-drive/ad-restful-api-response-codes.html

#Response 

JSON structure

**Success**

{
 "success": true,
 "data": {}
}

**Error**

{
 "success": false,
 "errors": [{
    "field" : "arg1", 
    "message": "Error message",
    "messageKey": "signup.email-exists"
  }]
}
