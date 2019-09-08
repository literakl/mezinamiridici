git add .
git commit -m "$1" --no-verify
git push theirs master
git push origin master
npm run build 
npm run deploy