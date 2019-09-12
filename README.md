# Between us Drivers

This is a monorepo for Between us Drivers

### Repository contents

* `/spa` is the single page Vue.js application that delivers the website experience.

### Deploying

This will commit to GitHub and deploy the latest change of the website to S3.

```
$ curl -O https://bootstrap.pypa.io/get-pip.py
$ python3 get-pip.py --user
$ pip3 install awscli --upgrade --user
$ aws configure
$ bash ./deploy.sh "My latest change"
```