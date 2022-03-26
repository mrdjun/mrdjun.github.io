/* global CONFIG */

document.addEventListener('page:loaded', () => {
  let imgs = $(".post-body").find("img");
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].onclick = function (e) {
      let src = e["srcElement"].currentSrc;
      let _this = $(this);
      $(".sidebar").css("z-index", "-1");
      createCover(src, _this);
    }
  }
});

function createCover(src, _this) {
  let cover = $("<div id='outerDiv' style='position:fixed;top:0;left:0;background:rgba(0,0,0,0.7);z-index:5;width:100%;height:100%;display:none;'><div id='innerDiv' style='position:absolute;'><img id='bigImg' style='border:5px solid #fff;' src=''/></div></div>");
  $("#outerDiv").remove();
  $("body").append(cover);
  imgShow("#outerDiv", "#innerDiv", "#bigImg", _this, src);
}

function imgShow(outerDiv, innerDiv, bigImg, _this, src) {
  //let src = _this.attr("src"); //获取当前点击的common-img元素中的src属性
  $(bigImg).attr("src", src); //设置#bigImg元素的src属性

  /*获取当前点击图片的真实大小，并显示弹出层及大图*/
  $("<img/>").attr("src", src).load(function () {
    let windowW = $(window).width(); //获取当前窗口宽度
    let windowH = $(window).height(); //获取当前窗口高度
    let realWidth = this.width; //获取图片真实宽度
    let realHeight = this.height; //获取图片真实高度
    let imgWidth, imgHeight;
    let scale = 0.8; //缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放

    if (realHeight > windowH * scale) { //判断图片高度
      imgHeight = windowH * scale; //如大于窗口高度，图片高度进行缩放
      imgWidth = imgHeight / realHeight * realWidth; //等比例缩放宽度
      if (imgWidth > windowW * scale) { //如宽度仍大于窗口宽度
        imgWidth = windowW * scale; //再对宽度进行缩放
      }
    } else if (realWidth > windowW * scale) { //如图片高度合适，判断图片宽度
      imgWidth = windowW * scale; //如大于窗口宽度，图片宽度进行缩放
      imgHeight = imgWidth / realWidth * realHeight; //等比例缩放高度
    } else { //如果图片真实高度和宽度都符合要求，高宽不变
      imgWidth = realWidth;
      imgHeight = realHeight;
    }
    $(bigImg).css("width", imgWidth); //以最终的宽度对图片缩放

    let w = (windowW - imgWidth) / 2; //计算图片与窗口左边距
    let h = (windowH - imgHeight) / 2; //计算图片与窗口上边距
    $(innerDiv).css({"top": h, "left": w}); //设置#innerDiv的top和left属性
    //console.log('****')
    $(outerDiv).fadeIn("fast"); //淡入显示#outerDiv
  });

  //再次点击淡出消失弹出层
  $(outerDiv).click(function () {
    $(this).fadeOut("fast");
    $(".sidebar").css("z-index", "1");
  });
}
