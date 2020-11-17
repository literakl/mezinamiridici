#Transport

HTTPS, result codes: https://developer.amazon.com/docs/amazon-drive/ad-restful-api-response-codes.html

* API - this endpoint returns plain data as they are stored in database
* BFF - this endpoint returns data tailored for frontend (backend for frontend)

#Request

VERB /v1/collection?&oba=id&ps=10&lr=id:ak5e2do&key=value
VERB /v1/collection/:id

* obd - order by descending; values: id, published
* oba - order by ascending; values: id, published
* ps - page size
* lr - field:value (seek pagination), field shall be the same as obd/oba.
* key=value - filter condition

##Filters
* AND betwen multiple filters, e.g. sex=man&region=PRG
* array is converted to IN operand, e.g. vehicles=bus&vehicles=car 
* numeric fields can have range operator, e.g. age=0:25, which converts to age>=0 & age<25

#Response 

JSON structure

**Success**

```
{
 "success": true,
 "data": {}
}
```

**Error**

```
{
 "success": false,
 "errors": [{
    "field" : "arg1", 
    "message": "Error message",
    "messageKey": "signup.email-exists"
  }]
}
```
