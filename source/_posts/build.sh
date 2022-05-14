pushd ../../
hexo clean
hexo g
hexo d
git add .
git commit -m 'better and better'
git push origin sourcecode
popd
