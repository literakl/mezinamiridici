#!/bin/bash

DEST=0

while [[ "$#" -gt 0 ]]; do
 case $1 in
  -d | --destination) DEST="$2"; shift ;;
  *) echo "Unknown parameter $1"; exit 1 ;;
 esac

 shift
done

if [[ "$DEST" == "0" ]] ; then
 echo "Usage:"
 echo "-d | --destination www  Symbolic link to the destination directory"
 exit 1
fi

if [ ! -d "../$DEST" ] ; then
 echo "Directory $DEST does not exist!"
 exit 1
fi

TARGET=$(realpath "../$DEST")
echo "Deploying the application into $TARGET"
echo "Is it correct? Enter one of Y/N"
read -r CONFIRM
if [ "$CONFIRM" != "Y" ] && [ "$CONFIRM" != "y"  ] ; then
 exit 0
fi

FRONTEND="$TARGET/html"
if [ $DEST == 'www' ]
then
  VARIANT=prod
  CONFIG=production.js
else
  VARIANT=dev
  CONFIG=beta.js
fi

rm -r frontend
mkdir frontend && cd frontend

echo "Unpacking the application"
unzip -q ../bud-frontend.zip

echo "Deleting the previous app"
rm -rf $FRONTEND/js $FRONTEND/config
rm -f $FRONTEND/index.html $FRONTEND/precache* $FRONTEND/service-worker.js
mkdir -p $FRONTEND/js

echo "Deploying the SPA to $FRONTEND"
echo cp $VARIANT/config/$CONFIG $FRONTEND/runtimeConfig.js
cp $VARIANT/config/$CONFIG $FRONTEND/runtimeConfig.js
cp -r $VARIANT/* $FRONTEND
