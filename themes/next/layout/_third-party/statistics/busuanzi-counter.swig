{%- if theme.busuanzi_count.enable %}
<div class="busuanzi-count">
  <script src="/js/busuanzi.js"></script>

  {%- if theme.busuanzi_count.total_visitors %}
    <span class="post-meta-item" id="busuanzi_container_site_uv" style="display: none;">
      <span class="site-uv" title="{{ __('footer.total_visitors') }}">
        UV <span id="busuanzi_value_site_uv"></span>
      </span>
    </span>
  {%- endif %}

  {%- if theme.busuanzi_count.total_views %}
    <span class="post-meta-item" id="busuanzi_container_site_pv" style="display: none;">
      <span class="site-pv" title="{{ __('footer.total_views') }}">
        PV <span id="busuanzi_value_site_pv"></span>
      </span>
    </span>
  {%- endif %}
</div>
{%- endif %}
