(function() {
  "use strict";

  var Context;

  Context = function Context() {
    var self = this instanceof Context ? this : Object.create(Context.prototype);
    return self;
  };

  Context.prototype = Object.create(Object.prototype);
  Context.prototype.constructor = Context;

  Context.prototype.businessRules = [];

  Context.prototype.applyRules = function applyRules() {
   var indexer, len;

   if (this.businessRules.length > 0) {
      for (indexer = 0, len = this.businessRules.length; indexer < len; indexer += 1) {
        this.businessRules[indexer].action(this);
      }
    }
  };

  module.exports = {Context: Context};
})();
