/* global CONFIG */

document.addEventListener('DOMContentLoaded', () => {

  const isRight = CONFIG.sidebar.position === 'right';
  const isToggle = CONFIG.sidebar.toggle;

  const sidebarToggleMotion = {
    mouse: {},
    init: function () {
      window.addEventListener('mousedown', this.mousedownHandler.bind(this));
      window.addEventListener('mouseup', this.mouseupHandler.bind(this));
      if (isToggle) {
        document.querySelector('.sidebar-dimmer').addEventListener('click', this.clickHandler.bind(this));
        document.querySelector('.sidebar-toggle').addEventListener('click', this.clickHandler.bind(this));
        window.addEventListener('sidebar:hide', this.hideSidebar);
      }
      window.addEventListener('sidebar:show', this.showSidebar);
    },
    mousedownHandler: function (event) {
      this.mouse.X = event.pageX;
      this.mouse.Y = event.pageY;
    },
    mouseupHandler: function (event) {
      const deltaX = event.pageX - this.mouse.X;
      const deltaY = event.pageY - this.mouse.Y;
      const clickingBlankPart = Math.hypot(deltaX, deltaY) < 20 && event.target.matches('.main');
      // Fancybox has z-index property, but medium-zoom does not, so the sidebar will overlay the zoomed image.
      if (clickingBlankPart || event.target.matches('img.medium-zoom-image')) {
        this.hideSidebar();
      }
    },
    clickHandler: function () {
      document.body.classList.contains('sidebar-active') ? this.hideSidebar() : this.showSidebar();
    },
    showSidebar: function () {
      document.body.classList.add('sidebar-active');
      const animateAction = isRight ? 'fadeInRight' : 'fadeInLeft';
      document.querySelectorAll('.sidebar .animated').forEach((element, index) => {
        element.style.animationDelay = (100 * index) + 'ms';
        element.classList.remove(animateAction);
        setTimeout(() => {
          // Trigger a DOM reflow
          element.classList.add(animateAction);
        });
      });
    },
    hideSidebar: function () {
      if (isToggle) {
        document.body.classList.remove('sidebar-active');
      }
    }
  };
  if (CONFIG.sidebar.display !== 'remove') sidebarToggleMotion.init();

  function updateFooterPosition() {
    const footer = document.querySelector('.footer');
    const containerHeight = document.querySelector('.header').offsetHeight + document.querySelector('.main').offsetHeight + footer.offsetHeight;
    footer.classList.toggle('footer-fixed', containerHeight <= window.innerHeight);
  }

  updateFooterPosition();
  window.addEventListener('resize', updateFooterPosition);
  window.addEventListener('scroll', updateFooterPosition, { passive: true });
});
