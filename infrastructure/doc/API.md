#Transport

HTTPS, result codes: https://developer.amazon.com/docs/amazon-drive/ad-restful-api-response-codes.html

#Request

VERB /v1/collection?obd=id&ps=10&of=20
VERB /v1/collection?&oba=published&ps=10&lr=ak5e2do
VERB /v1/collection/:id

* obd = order by descending; values: id, published
* oba = order by ascending; values: id, published
* ps = page size
* of = offset
* lr = last result (seek pagination)

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
