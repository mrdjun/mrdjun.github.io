<!DOCTYPE html>
<html lang="{{ config.language }}">
<head>
  {{ partial('_partials/head/head.swig', {}, {cache: theme.cache.enable}) }}
  {% include '_partials/head/head-unique.swig' %}
  {{- next_inject('head') }}
  <title>{% block title %}{% endblock %}</title>
  {{ partial('_third-party/analytics/index.swig', {}, {cache: theme.cache.enable}) }}
  {{ partial('_scripts/noscript.swig', {}, {cache: theme.cache.enable}) }}
</head>

<body itemscope itemtype="http://schema.org/WebPage">
  <div class="container{%- if theme.motion.enable %} use-motion{%- endif %}">
    <div class="headband"></div>

    <header class="header" itemscope itemtype="http://schema.org/WPHeader">
      <div class="header-inner">{% include '_partials/header/index.swig' %}</div>
    </header>

    {{ partial('_partials/widgets.swig', {}, {cache: theme.cache.enable}) }}

    <main class="main">
      <div class="main-inner">
        <div class="content-wrap">
          {% include '_partials/header/sub-menu.swig' %}
          <div class="content {% block class %}{% endblock %}">
            {% block content %}{% endblock %}
          </div>
          {% include '_partials/comments.swig' %}
        </div>
        {%- if theme.sidebar.display !== 'remove' %}
          {% block sidebar %}{% endblock %}
        {%- endif %}
      </div>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        {% include '_partials/languages.swig' %}
        {{ partial('_partials/footer.swig', {}, {cache: theme.cache.enable}) }}
        {{ partial('_third-party/statistics/index.swig', {}, {cache: theme.cache.enable}) }}
      </div>
    </footer>
  </div>

  {{ partial('_scripts/index.swig', {}, {cache: theme.cache.enable}) }}
  {{ partial('_third-party/index.swig', {}, {cache: theme.cache.enable}) }}

  {%- if theme.pjax %}
    <div id="pjax">
  {%- endif %}
  {% include '_third-party/math/index.swig' %}
  {% include '_third-party/quicklink.swig' %}

  {{- next_inject('bodyEnd') }}
  {%- if theme.pjax %}
    </div>
  {%- endif %}

  {%- if theme.fireworks %}
    <script src="/js/jquery.js"></script>
    <script src="/js/mo.min.js"></script>
    <script>
      $(function(){$("a").not(".nav-link,.cloud-tie-join-count,.ignore-href,.jstree-anchor").addClass("animsition-link")});var burst1=new mojs.Burst({left:0,top:0,radius:{5:40},children:{shape:"circle",fill:["red","cyan","orange"],fillOpacity:.8,radiusX:3.5,radiusY:3.5}});document.addEventListener("click",function(a){null==a.target.href&&"footer"!=a.target.className&&"copyright"!=a.target.className&&"author__urls social-icons"!=a.target.className&&"author__avatar"!=a.target.className&&"sidebar sidebar-active"!=a.target.className&&burst1.tune({x:a.pageX,y:a.pageY}).generate().replay()})
    </script>
    <div data-name="mojs-shape" style="position: absolute; width: 0px; height: 0px; margin-left: 0px; margin-top: 0px; opacity: 1; left: 0px; top: 0px; transform: translate(909px, 1631px) rotate(0deg) scale(1, 1); transform-origin: 50% 50%;"><div data-name="mojs-shape" class="" style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(1e-06px, -40px) rotate(90deg) scale(0, 0); transform-origin: 50% 50%;"><svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;"><ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="red" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse></svg></div><div data-name="mojs-shape" class="" style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(38.0423px, -12.3607px) rotate(162deg) scale(0, 0); transform-origin: 50% 50%;"><svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;"><ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="cyan" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse></svg></div><div data-name="mojs-shape" class="" style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(23.5114px, 32.3607px) rotate(234deg) scale(0, 0); transform-origin: 50% 50%;"><svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;"><ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="orange" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse></svg></div><div data-name="mojs-shape" class="" style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(-23.5114px, 32.3607px) rotate(306deg) scale(0, 0); transform-origin: 50% 50%;"><svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;"><ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="red" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse></svg></div><div data-name="mojs-shape" class="" style="position: absolute; width: 9px; height: 9px; margin-left: -4.5px; margin-top: -4.5px; opacity: 1; left: 50%; top: 50%; transform: translate(-38.0423px, -12.3607px) rotate(378deg) scale(0, 0); transform-origin: 50% 50%;"><svg style="display: block; width: 100%; height: 100%; left: 0px; top: 0px;"><ellipse rx="3.5" ry="3.5" cx="4.5" cy="4.5" fill-opacity="0.8" stroke-linecap="" stroke-dashoffset="" fill="cyan" stroke-dasharray="" stroke-opacity="1" stroke-width="2" stroke="transparent"></ellipse></svg></div></div>
  {%- endif %}
</body>
</html>
