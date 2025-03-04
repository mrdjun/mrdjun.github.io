window.addEventListener('load', function () {
  if (window.innerWidth > 768) {
    $('#mouse_explode').html(`
        <div data-name="mojs-shape"
           style="position: absolute; width: 0; height: 0px; margin-left: 0px; margin-top: 0px; opacity: 1; left: 0px; top: 0px; transform: translate(909px, 1631px) rotate(0deg) scale(1, 1); transform-origin: 50% 50%;">
        <div data-name="mojs-shape" class=""
             style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(1e-06px, -40px) rotate(90deg) scale(0, 0); transform-origin: 50% 50%;">
          <svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;">
            <ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="red"
                     stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse>
          </svg>
        </div>
        <div data-name="mojs-shape" class=""
             style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(38.0423px, -12.3607px) rotate(162deg) scale(0, 0); transform-origin: 50% 50%;">
          <svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;">
            <ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="cyan"
                     stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse>
          </svg>
        </div>
        <div data-name="mojs-shape" class=""
             style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(23.5114px, 32.3607px) rotate(234deg) scale(0, 0); transform-origin: 50% 50%;">
          <svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;">
            <ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset=""
                     fill="orange" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse>
          </svg>
        </div>
        <div data-name="mojs-shape" class=""
             style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(-23.5114px, 32.3607px) rotate(306deg) scale(0, 0); transform-origin: 50% 50%;">
          <svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;">
            <ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="red"
                     stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse>
          </svg>
        </div>
        <div data-name="mojs-shape" class=""
             style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(-38.0423px, -12.3607px) rotate(378deg) scale(0, 0); transform-origin: 50% 50%;">
          <svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;">
            <ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="cyan"
                     stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse>
          </svg>
        </div>
        </div>
    `)
    var burst1 = new mojs.Burst({
      left: 0,
      top: 0,
      radius: {5: 40},
      children: {shape: "circle", fill: ["red", "cyan", "orange"], fillOpacity: .8, radiusX: 3.5, radiusY: 3.5}
    });
    document.addEventListener("click", function (a) {
      burst1.tune({x: a.pageX, y: a.pageY}).generate().replay()
    })
  }
})
