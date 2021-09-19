#!/bin/bash

DEST=0
VARIANT=dev
CONFIG=beta.js

while [[ "$#" -gt 0 ]]; do
 case $1 in
  -d | --destination) DEST="/home/bud/$2"; shift ;;
  *) echo "Unknown parameter $1"; exit 1 ;;
 esac

 shift
done

if [[ "$DEST" == "0" ]] ; then
 echo "Usage:"
 echo "-d | --destination www  Symbolic link to the destination directory"
 exit 1
fi

if [ ! -d $DEST ] ; then
 echo "Directory $DEST does not exist!"
 exit 1
fi

echo "Deploying the application into " $(realpath $DEST)
echo "Is it correct? Enter one of Y/N" 
read -r CONFIRM
if [ "$CONFIRM" != "Y" ] && [ "$CONFIRM" != "y"  ] ; then
 exit 0
fi

FRONTEND="$(realpath $DEST)/html"
echo $FRONTEND

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
#rm -rf $VARIANT/config
cp -r $VARIANT/* $FRONTEND

