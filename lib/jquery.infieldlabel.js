/*
 * jquery.infieldlabel
 * A simple jQuery plugin for adding labels that sit over a form field and fade away when the fields are populated.
 * 
 * Copyright (c) 2009 - 2013 Doug Neiner <doug@dougneiner.com> (http://code.dougneiner.com)
 * Source: https://github.com/dcneiner/In-Field-Labels-jQuery-Plugin
 * Dual licensed MIT or GPL
 *   MIT (http://www.opensource.org/licenses/mit-license)
 *   GPL (http://www.opensource.org/licenses/gpl-license)
 *
 * @version 0.1.2
 */
(function ($) {

  $.InFieldLabels = function (label, field, options) {
    // To avoid scope issues, use 'base' instead of 'this'
    // to reference this class from internal events and functions.
    var base = this;
  
    // Access to jQuery and DOM versions of each element
    base.$label = $(label);
    base.label  = label;

    base.$field = $(field);
    base.field  = field;

    base.$label.data("InFieldLabels", base);
    base.showing = true;

    base.init = function () {
      // Merge supplied options with default options
      base.options = $.extend({}, $.InFieldLabels.defaultOptions, options);

      // Check if the field is already filled in
      if (base.$field.val() !== "") {
        base.$label.hide();
        base.showing = false;
      }

      base.$field.focus(function () {
        base.fadeOnFocus();
      }).blur(function () {
        base.checkForEmpty(true);
      }).bind('keydown.infieldlabel', function (e) {
        // Use of a namespace (.infieldlabel) allows us to
        // unbind just this method later
        base.hideOnChange(e);
      }).bind('paste', function () {
        // Since you can not paste an empty string we can assume
        // that the fieldis not empty and the label can be cleared.
        base.setOpacity(0.0);
      }).change(function () {
        base.checkForEmpty();
      }).bind('onPropertyChange', function () {
        base.checkForEmpty();
      });
    };

    // If the label is currently showing
    // then fade it down to the amount
    // specified in the settings
    base.fadeOnFocus = function () {
      if (base.showing) {
        base.setOpacity(base.options.fadeOpacity);
      }
    };

    base.setOpacity = function (opacity) {
      base.$label.stop().animate({ opacity: opacity }, base.options.fadeDuration);
      base.showing = (opacity > 0.0);
    };

    // Checks for empty as a fail safe
    // set blur to true when passing from
    // the blur event
    base.checkForEmpty = function (blur) {
      if (base.$field.val() === "") {
        base.prepForShow();
        base.setOpacity(blur ? 1.0 : base.options.fadeOpacity);
      } else {
        base.setOpacity(0.0);
      }
    };

    base.prepForShow = function () {
      if (!base.showing) {
        // Prepare for a animate in...
        base.$label.css({opacity: 0.0}).show();

        // Reattach the keydown event
        base.$field.bind('keydown.infieldlabel', function (e) {
          base.hideOnChange(e);
        });
      }
    };

    base.hideOnChange = function (e) {
      if (
          (e.keyCode === 16) || // Skip Shift
          (e.keyCode === 9) // Skip Tab
        ) {
        return; 
      }

      if (base.showing) {
        base.$label.hide();
        base.showing = false;
      }

      // Remove keydown event to save on CPU processing
      base.$field.unbind('keydown.infieldlabel');
    };

    // Run the initialization method
    base.init();
  };

  $.InFieldLabels.defaultOptions = {
    fadeOpacity: 0.5, // Once a field has focus, how transparent should the label be
    fadeDuration: 300, // How long should it take to animate from 1.0 opacity to the fadeOpacity
    enabledInputTypes: [ "text", "search", "tel", "url", "email", "password", "number", "textarea" ]
  };


  $.fn.inFieldLabels = function (options) {
    var allowed_types = options && options.enabledInputTypes || $.InFieldLabels.defaultOptions.enabledInputTypes;

    return this.each(function () {
      // Find input or textarea based on for= attribute
      // The for attribute on the label must contain the ID
      // of the input or textarea element
      var for_attr = $(this).attr('for'), $field, restrict_type;
      if (!for_attr) {
        return; // Nothing to attach, since the for field wasn't used
      }

      // Find the referenced input or textarea element
      $field = $( "#" + for_attr );
      if ( !$field.length ) {
        return; // No element found
      }

      // Restrict input type
      restrict_type = $.inArray( $field.attr('type'), allowed_types );

      if ( restrict_type === -1 && !$field.is( "textarea" )) {
        return; // Again, nothing to attach
      } 

      // Only create object for matched input types and textarea
      (new $.InFieldLabels(this, $field[0], options));
    });
  };

}(jQuery));