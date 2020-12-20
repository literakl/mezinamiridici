#!/bin/bash

BACKEND=0
FRONTEND=0
DEST=0

while [[ "$#" -gt 0 ]]; do
 case $1 in
  -d | -destination) DEST="/home/bud/$2"; shift ;;
  -b | --backend) BACKEND=1 ;;
  -f | --frontend) FRONTEND=1 ;;
  *) echo "Neznamy parametr: $1"; exit 1 ;;
 esac

 shift
done

if [[ "$DEST" == "0" ]] || [[ "$BACKEND" == "0" && $FRONTEND == "0" ]]; then
 echo "Pouziti:"
 echo "-t | --target www  Nazev symlinku do ciloveho adresare"
 echo "-b | --backend     Instalovat backend"
 echo "-f | --frontend    Instalovat frontend"
 exit 1
fi

if [ ! -d $DEST ] ; then
 echo "Adresar $DEST neexistuje!"
 exit 1
fi

echo "Nahravam aplikaci do" $(realpath $DEST)
echo "Je to spravne? A/N" 
read -r CONFIRM
if [ "$CONFIRM" != "A" ] && [ "$CONFIRM" != "a"  ] ; then
 exit 0
fi

echo "Cistim predchozi instalaci"
rm -r html backend

echo "Rozbaluji aplikaci"
unzip -q bud.zip

if [ ! "$FRONTEND" == 0 ]; then
 echo "Mazu stavajici SPA aplikaci v $DEST"
 rm -rf $DEST/html/js
 rm -f $DEST/html/index.html $DEST/html/precache* $DEST/html/service-worker.js
 mkdir -p $DEST/html/js

 echo "Kopiruji SPA z instalace do $DEST"
 cp -r html/* $DEST/html
fi

if [ ! "$BACKEND" == 0 ]; then
 echo "Mazu stavajici backend v $DEST"
 rm -rf $DEST/backend/src $DEST/templates

 echo "Kopiruji backend z instalace do $DEST"
 cp -r backend/* $DEST/backend

 echo "Aktualizuji zavislosti"
 cd $DEST/backend
 npm install
fi

