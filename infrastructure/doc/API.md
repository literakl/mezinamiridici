#Transport

HTTPS, result codes: https://developer.amazon.com/docs/amazon-drive/ad-restful-api-response-codes.html

#Request

VERB /v1/collection?&oba=id&ps=10&lr=id:ak5e2do&key=value
VERB /v1/collection/:id

* obd - order by descending; values: id, published
* oba - order by ascending; values: id, published
* ps - page size
* lr - field:value (seek pagination)
* key=value - filter condition, AND betwen multiple filters

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
