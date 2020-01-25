# Between us Drivers

This is a monorepo for mezinamiridici.cz

### Repository contents

* `/spa` is the single page Vue.js application that delivers the website experience.
* `/infrastructure` is the serverless SAM architecture that powers the backend

### Local run

```
$ cd infrastructure
$ sam local start-api  --env-vars env.json
$ cd spa
$ npm run serve
```

### Deploying

This will commit to GitHub and deploy the latest change of the website to S3.

```
$ cd infrastructure
$ sam package --output-template-file output.yaml --region eu-central-1 --s3-bucket mezinamiridicipackage
$ sam deploy --template-file output.yaml --stack-name mezinamiridiciapi --capabilities CAPABILITY_IAM  --parameter-overrides 'ParameterKey=DatabaseUri,ParameterValue=MONGOURL'
$ cd spa
$ npm run build
```
Upload dist folder content to S3 interface, select all and make public

### Configuration

##### infrastructure

{
  "BUDAuthorizeUserHandler": {
    "MONGODB_URI": "mongodb://localhost/bud?retryWrites=true&w=majority",
    "JTW_SECRET": "SECRET"
  }
}

