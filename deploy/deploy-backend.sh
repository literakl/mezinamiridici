#!/bin/bash

DEST=0
NPM=0

while [[ "$#" -gt 0 ]]; do
 case $1 in
  -d | --destination) DEST="/home/bud/$2"; shift ;;
  -n | --npm) NPM=1 ;;
  *) echo "Unknown parameter $1"; exit 1 ;;
 esac

 shift
done

if [[ "$DEST" == "0" ]]; then
 echo "Usage:"
 echo "-d | --destination www  Symbolic link to the destination directory"
 echo "-n | --npm              Run 'npm ci' in backend"
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

BACKEND="$(realpath $DEST)/backend"

rm -r backend
mkdir backend && cd backend
echo "Unpacking the application"
unzip -q ../bud-backend.zip

echo "Deleting the previous app"
rm -rf $BACKEND/src $BACKEND/templates $BACKEND/config $BACKEND/package*.json

echo "Deploying to $BACKEND"
cp -r . $BACKEND

if [ ! "$NPM" == 0 ]; then
 echo "Refreshing the backend dependencies"
 cd $BACKEND
 npm ci
fi
