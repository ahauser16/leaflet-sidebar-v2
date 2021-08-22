// @ts-nocheck
/**
 * @name Sidebar
 * @class L.Control.Sidebar
 * @extends L.Control
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @param {string} [options.id] - ID of a predefined sidebar container that should be used
 * @param {boolean} [data.close=true] Whether to add a close button to the pane header
 * @see L.control.sidebar
 */

L.Control.Sidebar = L.Control.extend(
  /** @lends L.Control.Sidebar.prototype */ {
    //  Q: does 'includes: L.Evented' refer to the Array.prototype.includes() function?  Also, is it being used as a generic method that's being applied to other kinds of 'array-like objects'?

    //  Definition of 'Mixin class' is a class containing methods that can be used by other classes without a need to inherit from it.

    //  L.Evented is an abstract class within the Leaflet library containing a set of methods shared between event-powered classes (like Map and Marker).  Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire 'click' event).

    //  L.Events is a set of methods which include Layer events, Map state change events, Popup events, Tooltip events, Location events, Interaction events...see --> https://leafletjs.com/reference-1.7.1.html#map-event

    //  === QUESTION A - how would you explain this ternary explanation below?
    //  === myAnswerAttempt:  condition: L.Evented is included in the L.Control.Sidebar.prototype ? if true, then L.Evented.prototype xxxxx : if false then the L.Event class is mixed into L.Control.Sidebar.prototype.
    // https://leafletjs.com/examples/extending/extending-1-classes.html

    includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

    // ===I'm not sure what is happening here with these options
    options: {
      autopan: false,
      closeButton: true,
      container: null,
      position: "left",
    },
    /**
     * Create a new sidebar on this object.
     *
     * @constructor
     * @param {Object} [options] - Optional options object
     * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
     * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
     * @param {string} [options.container] - ID of a predefined sidebar container that should be used
     * @param {bool} [data.close=true] - Whether to add a close button to the pane header
     *
     */

    //===  L.Class.initialize()
    //===  In OOP, classes have a constructor method. In Leaflet’s L.Class, the constructor method is always named initialize.
    //===  If your class has some specific options, it’s a good idea to initialize them with L.setOptions() in the constructor. This utility function will merge the provided options with the default options of the class.
    //===  see --> https://leafletjs.com/examples/extending/extending-1-classes.html

    initialize: function (options, deprecatedOptions) {
      //=================START==========================
      //  QQQ what is it about the syntax that's causing the deprecation warning?
      if (typeof options === "string") {
        console.warn(
          "this syntax is deprecated. please use L.control.sidebar({ container }) now"
        );
        options = { container: options };
      }

      if (typeof options === "object" && options.id) {
        console.warn(
          "this syntax is deprecated. please use L.control.sidebar({ container }) now"
        );
        options.container = options.id;
      }
      //===================END==========================

      //===  When naming classes, methods and properties, adhere to the following conventions:
      //=== (a) Function, method, property and factory names should be in lowerCamelCase.
      //=== (b) Class names should be in UpperCamelCase.
      //=== (c) Private properties and methods start with an underscore (_). This doesn’t make them private, just recommends developers not to use them directly.

      this._tabitems = [];
      this._panes = [];
      this._closeButtons = [];

      //  see --> https://leafletjs.com/reference-1.7.1.html#util-setoptions
      //  setOptions syntax: setOptions(<Object> obj, <Object> options)
      //  returns Object
      //  setOptions() merges the given properties to the options of the obj object returning the resulting options.
      //  Note: options is a special property that unlike other objects can be passed to a child class from a parent will be merged with the parent one instead of overriding it completely.  See Class options --> https://leafletjs.com/reference-1.7.1.html#class

      L.setOptions(this, options);
      L.setOptions(this, deprecatedOptions);
      return this;
    },

    /**
     * Add this sidebar to the specified map.
     * (i) map is the name of the function parameter and (ii) the { L.Map } type is, as described by JSDoc namepath documentation, is set to the L.Map variable referenced elsewhere in this code block.
     * @param {L.Map} map
     * // QQQ does this mean the L.Map constructor function returns Sidebar?  AAA- most likely, yes.
     * @returns {Sidebar}
     */

    //  ===see --> https://leafletjs.com/reference-1.7.1.html#layer-onadd
    //  ===onAdd syntax: onAdd(<Map> map)
    //  ===returns: this
    //  ===Should contain code that creates DOM elements for the layer, adds them to <map panes> where they should belong and puts listeners on relevant map events. Called on map.addLayer(layer).

    onAdd: function (map) {
      var i, child, tabContainers, newContainer, container;
      //  ===QQQ at this point in the code are these declarations are evaluated by the interpreter to be undefined?

      // use container from previous onAdd();
      container = this._container;

      // ===see above: @param {string} [options.container] which is the ID of a predefined sidebar container that should be used.

      // use the container given via options.
      if (!container) {
        container =
          this._container || typeof this.options.container === "string"
            ? L.DomUtil.get(this.options.container)
            : this.options.container;
      }

      // if no container was specified or not found, create it and apply an ID
      if (!container) {
        //=== 'L.DomUtil.create' will create a <canvas> element for drawing
        //=== example syntax: var tile = L.DomUtil.create('canvas', 'leaflet-tile')
        //===  see https://leafletjs.com/reference-1.7.1.html#gridlayer
        //=== in the code below its being used to create the parent div containing the sidebar HTML
        container = L.DomUtil.create("div", "leaflet-sidebar collapsed");
        if (typeof this.options.container === "string")
          container.id = this.options.container;
      }

      // Find paneContainer in DOM & store reference
      //  ===div.leaflet-sidebar-content is the div for the "panel content" in the HTML file.
      this._paneContainer = container.querySelector(
        "div.leaflet-sidebar-content"
      );

      // If none is found, create it
      if (this._paneContainer === null)
        this._paneContainer = L.DomUtil.create(
          "div",
          "leaflet-sidebar-content",
          container
        );

      // Find tabContainerTop & tabContainerBottom in DOM & store reference
      // === div.leaflet-sidebar-tabs refer to the "nav tabs" in the HTML file.
      // === ul.leaflet-sidebar-tabs refer to the "top aligned tabs" in the HTML file.
      tabContainers = container.querySelectorAll(
        "ul.leaflet-sidebar-tabs, div.leaflet-sidebar-tabs > ul"
      );

      //===When naming classes, methods and properties, adhere to the following conventions:
      //===(1)  Function, method, property and factory names should be in lowerCamelCase.
      //===(2)  Class names should be in UpperCamelCase.
      //===(3)  Private properties and methods start with an underscore (_). This doesn’t make them private, just recommends developers not to use them directly.
      //see --> https://leafletjs.com/examples/extending/extending-1-classes.html

      this._tabContainerTop = tabContainers[0] || null;
      this._tabContainerBottom = tabContainers[1] || null;

      // If no container was found, create it
      if (this._tabContainerTop === null) {
        newContainer = L.DomUtil.create(
          "div",
          "leaflet-sidebar-tabs",
          container
        );
        newContainer.setAttribute("role", "tablist");
        this._tabContainerTop = L.DomUtil.create("ul", "", newContainer);
      }
      if (this._tabContainerBottom === null) {
        newContainer = this._tabContainerTop.parentNode;
        this._tabContainerBottom = L.DomUtil.create("ul", "", newContainer);
      }

      // Store Tabs in Collection for easier iteration
      for (i = 0; i < this._tabContainerTop.children.length; i++) {
        child = this._tabContainerTop.children[i];
        child._sidebar = this;
        child._id = child.querySelector("a").hash.slice(1); // FIXME: this could break for links!
        this._tabitems.push(child);
      }
      for (i = 0; i < this._tabContainerBottom.children.length; i++) {
        child = this._tabContainerBottom.children[i];
        child._sidebar = this;
        child._id = child.querySelector("a").hash.slice(1); // FIXME: this could break for links!
        this._tabitems.push(child);
      }

      // Store Panes in Collection for easier iteration
      for (i = 0; i < this._paneContainer.children.length; i++) {
        child = this._paneContainer.children[i];
        if (
          child.tagName === "DIV" &&
          L.DomUtil.hasClass(child, "leaflet-sidebar-pane")
        ) {
          this._panes.push(child);

          // Save references to close buttons
          var closeButtons = child.querySelectorAll(".leaflet-sidebar-close");
          if (closeButtons.length) {
            this._closeButtons.push(closeButtons[closeButtons.length - 1]);
            this._closeClick(closeButtons[closeButtons.length - 1], "on");
          }
        }
      }

      // set click listeners for tab & close buttons
      for (i = 0; i < this._tabitems.length; i++) {
        this._tabClick(this._tabitems[i], "on");
      }

      // leaflet moves the returned container to the right place in the DOM
      return container;
    },

    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    onRemove: function (map) {
      // Remove click listeners for tab & close buttons
      for (var i = 0; i < this._tabitems.length; i++)
        this._tabClick(this._tabitems[i], "off");
      for (var i = 0; i < this._closeButtons.length; i++)
        this._closeClick(this._closeButtons[i], "off");

      this._tabitems = [];
      this._panes = [];
      this._closeButtons = [];

      return this;
    },

    /**
     * @method addTo(map: Map): this
     * Adds the control to the given map. Overrides the implementation of L.Control,
     * changing the DOM mount target from map._controlContainer.topleft to map._container
     */
    addTo: function (map) {
      this.onRemove();
      this._map = map;

      this._container = this.onAdd(map);

      L.DomUtil.addClass(this._container, "leaflet-control");
      L.DomUtil.addClass(
        this._container,
        "leaflet-sidebar-" + this.getPosition()
      );
      if (L.Browser.touch) L.DomUtil.addClass(this._container, "leaflet-touch");

      // when adding to the map container, we should stop event propagation
      L.DomEvent.disableScrollPropagation(this._container);
      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.on(this._container, "contextmenu", L.DomEvent.stopPropagation);

      // insert as first child of map container (important for css)
      map._container.insertBefore(this._container, map._container.firstChild);

      return this;
    },

    /**
     * @deprecated - Please use remove() instead of removeFrom(), as of Leaflet 0.8-dev, the removeFrom() has been replaced with remove()
     * Removes this sidebar from the map.
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    removeFrom: function (map) {
      console.warn(
        "removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon."
      );
      this._map._container.removeChild(this._container);
      this.onRemove(map);

      return this;
    },

    /**
     * Open sidebar (if it's closed) and show the specified tab.
     *
     * @param {string} id - The ID of the tab to show (without the # character)
     * @returns {L.Control.Sidebar}
     */
    open: function (id) {
      var i, child, tab;

      // If panel is disabled, stop right here
      tab = this._getTab(id);
      if (L.DomUtil.hasClass(tab, "disabled")) return this;

      // Hide old active contents and show new content
      for (i = 0; i < this._panes.length; i++) {
        child = this._panes[i];
        if (child.id === id) L.DomUtil.addClass(child, "active");
        else if (L.DomUtil.hasClass(child, "active"))
          L.DomUtil.removeClass(child, "active");
      }

      // Remove old active highlights and set new highlight
      for (i = 0; i < this._tabitems.length; i++) {
        child = this._tabitems[i];
        if (child.querySelector("a").hash === "#" + id)
          L.DomUtil.addClass(child, "active");
        else if (L.DomUtil.hasClass(child, "active"))
          L.DomUtil.removeClass(child, "active");
      }

      this.fire("content", { id: id });

      // Open sidebar if it's closed
      if (L.DomUtil.hasClass(this._container, "collapsed")) {
        this.fire("opening");
        L.DomUtil.removeClass(this._container, "collapsed");
        if (this.options.autopan) this._panMap("open");
      }

      return this;
    },

    /**
     * Close the sidebar (if it's open).
     *
     * @returns {L.Control.Sidebar}
     */
    close: function () {
      var i;

      // Remove old active highlights
      for (i = 0; i < this._tabitems.length; i++) {
        var child = this._tabitems[i];
        if (L.DomUtil.hasClass(child, "active"))
          L.DomUtil.removeClass(child, "active");
      }

      // close sidebar, if it's opened
      if (!L.DomUtil.hasClass(this._container, "collapsed")) {
        this.fire("closing");
        L.DomUtil.addClass(this._container, "collapsed");
        if (this.options.autopan) this._panMap("close");
      }

      return this;
    },

    /**
     * Add a panel to the sidebar
     *
     * @example
     * sidebar.addPanel({
     *     id: 'userinfo',
     *     tab: '<i class="fa fa-gear"></i>',
     *     pane: someDomNode.innerHTML,
     *     position: 'bottom'
     * });
     *
     * @param {Object} [data] contains the data for the new Panel:
     * @param {String} [data.id] the ID for the new Panel, must be unique for the whole page
     * @param {String} [data.position='top'] where the tab will appear:
     *                                       on the top or the bottom of the sidebar. 'top' or 'bottom'
     * @param {HTMLString} {DOMnode} [data.tab]  content of the tab item, as HTMLstring or DOM node
     * @param {HTMLString} {DOMnode} [data.pane] content of the panel, as HTMLstring or DOM node
     * @param {String} [data.link] URL to an (external) link that will be opened instead of a panel
     * @param {String} [data.title] Title for the pane header
     * @param {String} {Function} [data.button] URL to an (external) link or a click listener function that will be opened instead of a panel
     * @param {bool} [data.disabled] If the tab should be disabled by default
     *
     * @returns {L.Control.Sidebar}
     */
    addPanel: function (data) {
      var pane, tab, tabHref, closeButtons, content;

      // Create tab node
      tab = L.DomUtil.create("li", data.disabled ? "disabled" : "");
      tabHref = L.DomUtil.create("a", "", tab);
      tabHref.href = "#" + data.id;
      tabHref.setAttribute("role", "tab");
      tabHref.innerHTML = data.tab;
      tab._sidebar = this;
      tab._id = data.id;
      tab._button = data.button; // to allow links to be disabled, the href cannot be used
      if (data.title && data.title[0] !== "<") tab.title = data.title;

      // append it to the DOM and store JS references
      if (data.position === "bottom") this._tabContainerBottom.appendChild(tab);
      else this._tabContainerTop.appendChild(tab);

      this._tabitems.push(tab);

      // Create pane node
      if (data.pane) {
        if (typeof data.pane === "string") {
          // pane is given as HTML string
          pane = L.DomUtil.create(
            "DIV",
            "leaflet-sidebar-pane",
            this._paneContainer
          );
          content = "";
          if (data.title)
            content += '<h1 class="leaflet-sidebar-header">' + data.title;
          if (this.options.closeButton)
            content +=
              '<span class="leaflet-sidebar-close"><i class="fa fa-caret-' +
              this.options.position +
              '"></i></span>';
          if (data.title) content += "</h1>";
          pane.innerHTML = content + data.pane;
        } else {
          // pane is given as DOM object
          pane = data.pane;
          this._paneContainer.appendChild(pane);
        }
        pane.id = data.id;

        this._panes.push(pane);

        // Save references to close button & register click listener
        closeButtons = pane.querySelectorAll(".leaflet-sidebar-close");
        if (closeButtons.length) {
          // select last button, because thats rendered on top
          this._closeButtons.push(closeButtons[closeButtons.length - 1]);
          this._closeClick(closeButtons[closeButtons.length - 1], "on");
        }
      }

      // Register click listeners, if the sidebar is on the map
      this._tabClick(tab, "on");

      return this;
    },

    /**
     * Removes a panel from the sidebar
     *
     * @example
     * sidebar.remove('userinfo');
     *
     * @param {String} [id] the ID of the panel that is to be removed
     * @returns {L.Control.Sidebar}
     */
    removePanel: function (id) {
      var i, j, tab, pane, closeButtons;

      // find the tab & panel by ID, remove them, and clean up
      for (i = 0; i < this._tabitems.length; i++) {
        if (this._tabitems[i]._id === id) {
          tab = this._tabitems[i];

          // Remove click listeners
          this._tabClick(tab, "off");

          tab.remove();
          this._tabitems.splice(i, 1);
          break;
        }
      }

      for (i = 0; i < this._panes.length; i++) {
        if (this._panes[i].id === id) {
          pane = this._panes[i];
          closeButtons = pane.querySelectorAll(".leaflet-sidebar-close");
          for (j = 0; j < closeButtons.length; j++) {
            this._closeClick(closeButtons[j], "off");
          }

          pane.remove();
          this._panes.splice(i, 1);

          break;
        }
      }

      return this;
    },

    /**
     * enables a disabled tab/panel
     *
     * @param {String} [id] ID of the panel to enable
     * @returns {L.Control.Sidebar}
     */
    enablePanel: function (id) {
      var tab = this._getTab(id);
      L.DomUtil.removeClass(tab, "disabled");

      return this;
    },

    /**
     * disables an enabled tab/panel
     *
     * @param {String} [id] ID of the panel to disable
     * @returns {L.Control.Sidebar}
     */
    disablePanel: function (id) {
      var tab = this._getTab(id);
      L.DomUtil.addClass(tab, "disabled");

      return this;
    },

    onTabClick: function (e) {
      // `this` points to the tab DOM element!
      if (L.DomUtil.hasClass(this, "active")) {
        this._sidebar.close();
      } else if (!L.DomUtil.hasClass(this, "disabled")) {
        if (typeof this._button === "string")
          // an url
          window.location.href = this._button;
        else if (typeof this._button === "function")
          // a clickhandler
          this._button(e);
        // a normal pane
        else this._sidebar.open(this.querySelector("a").hash.slice(1));
      }
    },

    /**
     * (un)registers the onclick event for the given tab,
     * depending on the second argument.
     * @private
     *
     * @param {DOMelement} [tab]
     * @param {String} [on] 'on' or 'off'
     */
    _tabClick: function (tab, on) {
      var link = tab.querySelector("a");
      if (!link.hasAttribute("href") || link.getAttribute("href")[0] !== "#")
        return;

      if (on === "on") {
        L.DomEvent.on(
          tab.querySelector("a"),
          "click",
          L.DomEvent.preventDefault,
          tab
        ).on(tab.querySelector("a"), "click", this.onTabClick, tab);
      } else {
        L.DomEvent.off(tab.querySelector("a"), "click", this.onTabClick, tab);
      }
    },

    onCloseClick: function () {
      this.close();
    },

    /**
     * (un)registers the onclick event for the given close button
     * depending on the second argument
     * @private
     *
     * @param {DOMelement} [closeButton]
     * @param {String} [on] 'on' or 'off'
     */
    _closeClick: function (closeButton, on) {
      if (on === "on") {
        L.DomEvent.on(closeButton, "click", this.onCloseClick, this);
      } else {
        L.DomEvent.off(closeButton, "click", this.onCloseClick);
      }
    },

    /**
     * Finds & returns the DOMelement of a tab
     *
     * @param {String} [id] the id of the tab
     * @returns {DOMelement} the tab specified by id, null if not found
     */
    _getTab: function (id) {
      for (var i = 0; i < this._tabitems.length; i++) {
        if (this._tabitems[i]._id === id) return this._tabitems[i];
      }

      throw Error('tab "' + id + '" not found');
    },

    /**
     * Helper for autopan: Pans the map for open/close events
     *
     * @param {String} [openClose] The behaviour to enact ('open' | 'close')
     */
    _panMap: function (openClose) {
      var panWidth =
        Number.parseInt(L.DomUtil.getStyle(this._container, "max-width")) / 2;
      if (
        (openClose === "open" && this.options.position === "left") ||
        (openClose === "close" && this.options.position === "right")
      )
        panWidth *= -1;
      this._map.panBy([panWidth, 0], { duration: 0.5 });
    },
  }
);

/**
 * Create a new sidebar.
 *
 * @example
 * var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);
 *
 * @param {Object} [options] - Optional options object
 * @param {string} [options.autopan=false] - whether to move the map when opening the sidebar to make maintain the visible center point
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @param {string} [options.container] - ID of a predefined sidebar container that should be used
 * @param {boolean} [data.close=true] Whether to add a close button to the pane header
 * @returns {Sidebar} A new sidebar instance
 */
L.control.sidebar = function (options, deprecated) {
  return new L.Control.Sidebar(options, deprecated);
};
