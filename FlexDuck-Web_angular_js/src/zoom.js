function applyZoom() {
  if (window.innerWidth <= 1079) {
    document.body.style.transform = 'scale(0.8)';
    document.body.style.transformOrigin = 'top';
    document.body.style.width = '125%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }
}
