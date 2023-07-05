let themeTag = document.querySelector('style[is="theme"]');
let body = document.body;
let darkCss = `:root { --body-bg-color: #22272e; --content-bg-color: #333; --card-bg-color: #4c4948; --text-color: #ccc; --blockquote-color: #bbb; --link-color: #ccc; --link-hover-color: #6db33f; --brand-color: #ddd; --brand-hover-color: #ddd; --table-row-odd-bg-color: #282828; --table-row-hover-bg-color: #363636; --menu-item-bg-color: #4c4948; --theme-color: #222; --opposite-color: #eee; --btn-default-bg: #222; --btn-default-color: #ccc; --btn-default-border-color: #4c4948; --btn-default-hover-bg: #666; --btn-default-hover-color: #ccc; --btn-default-hover-border-color: #666; --highlight-background: #1c1b1b; --highlight-foreground: #fff; --highlight-gutter-background: #323131; --highlight-gutter-foreground: #e8e8e8; color-scheme: dark; }`;
const darkKey = 'dark';
if(!localStorage.getItem(darkKey)){
  if (new Date().getHours() >= 22 || new Date().getHours() < 7) {
    body.classList.add(darkKey);
  }
  else if (matchMedia('(prefers-color-scheme: dark)').matches) {
    body.classList.add(darkKey);
  }
} else if (localStorage.getItem(darkKey) === '1') {
  body.classList.add(darkKey);
}

themeTag.innerHTML = body.classList.contains(darkKey) ? darkCss: '';

$("#btn_darkmode").click(function () {
  $('#btn_darkmode').css('background-color','--opposite-color')
  if (body.classList.contains(darkKey)) {
    body.classList.remove(darkKey);
    localStorage.setItem(darkKey, '0');
    themeTag.innerHTML= '';
  } else {
    body.classList.add(darkKey);
    localStorage.setItem(darkKey, '1');
    themeTag.innerHTML = darkCss;
  }
})
