module.exports = {
  getAttribute: function(el, name) {
    if (el.hasAttribute(name)) {
      return el.getAttribute(name);
    }

    name = 'data-' + name;
    if (el.hasAttribute(name)) {
      return el.getAttribute(name);
    }

    return null;
  },
  getChildContent: function(parent, selector) {
    var node = parent.querySelector(selector);
    if (node !== null) {
      return node.innerHTML;
    }
    return null;
  }
};
