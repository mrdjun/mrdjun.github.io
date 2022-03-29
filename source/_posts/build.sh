cd ../../
echo 'cleaning...'
hexo clean
echo 'generating...'
hexo g
echo 'deploying...'
hexo d
echo 'Git adding...'
git add .
echo 'Git commit-> Will be better'
git commit -m 'Will be better'
echo 'Git push to sourcecode'
git push origin sourcecode
echo 'DONE'
