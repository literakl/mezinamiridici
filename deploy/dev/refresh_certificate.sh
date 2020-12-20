openssl req -x509 -newkey rsa:4096 -sha256 -days 730 -nodes \
  -keyout nginx.key -out nginx.crt  -subj '/C=CZ/L=Prague/O=Lelisoft/OU=Mezinamiridici KYC/CN=localhost' \
  -extensions san  \
  -config <(echo '[req]'; echo 'distinguished_name=req'; echo '[san]'; echo 'subjectAltName=DNS:192.168.68.106,DNS:localhost')

chmod 600 *key
chown nginx.nginx *key

# put the certificate into java default trustore because https is read by engine and other applications
# help: https://docs.oracle.com/cd/E19830-01/819-4712/ablqw/index.html
cd java/default/jre/lib/security/
# keytool -list -v -keystore cacerts -storepass changeit
cp cacerts backup_cacerts-`date +%Y%m%d_%H%M%S`
keytool -delete -noprompt -alias nginx  -keystore cacerts -storepass changeit -alias nginx
keytool -importcert -noprompt -storepass changeit -trustcacerts -file nginx/conf/ssl/nginx.crt -keystore cacerts -alias "nginx"
