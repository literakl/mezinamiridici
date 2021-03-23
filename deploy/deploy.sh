#!/bin/bash

BACKEND=0
FRONTEND=0
DEST=0
NPM=0

while [[ "$#" -gt 0 ]]; do
 case $1 in
  -d | --destination) DEST="/home/bud/$2"; shift ;;
  -b | --backend) BACKEND=1 ;;
  -f | --frontend) FRONTEND=1 ;;
  -n | --npm) NPM=1 ;;
  *) echo "Unknown parameter $1"; exit 1 ;;
 esac

 shift
done

if [[ "$DEST" == "0" ]] || [[ "$BACKEND" == "0" && $FRONTEND == "0" ]]; then
 echo "Usage:"
 echo "-d | --destination www  Symbolic link to the destination directory"
 echo "-b | --backend     Install the backend"
 echo "-f | --frontend    Install the frontend"
 echo "-n | --npm         Run 'npm install' in backend"
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

echo "Cleaning the previous installation"
rm -r html backend

echo "Unpacking the application"
unzip -q bud.zip

if [ ! "$FRONTEND" == 0 ]; then
 echo "Deleting the previous SPA application in $DEST"
 rm -rf $DEST/html/js
 rm -f $DEST/html/index.html $DEST/html/precache* $DEST/html/service-worker.js
 mkdir -p $DEST/html/js

 echo "Deploying the SPA to $DEST"
 cp -r html/* $DEST/html
fi

if [ ! "$BACKEND" == 0 ]; then
 echo "Deleting the prevous backend application to  $DEST"
 rm -rf $DEST/backend/src $DEST/templates

 echo "Deploying the backend to $DEST"
 cp -r backend/* $DEST/backend

 if [ ! "$NPM" == 0 ]; then
  echo "Refreshing the backend dependencies"
  cd $DEST/backend
  npm install
 fi
fi

