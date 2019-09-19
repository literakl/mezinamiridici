package: 
	sam package --output-template-file packaged.yaml --s3-bucket between-us-drivers-infrastructure
deploy: 
	sam deploy --template-file packaged.yaml --stack-name between-us-drivers --capabilities CAPABILITY_IAM --region eu-west-1