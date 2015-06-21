(function() {
  "use strict";

  var Context;

  Context = {
    businessRules: [],
    applyRules: function applyRules() {
     var indexer, len;

     if (this.businessRules.length > 0) {
        for (indexer = 0, len = this.businessRules.length; indexer < len; indexer += 1) {
          this.businessRules[indexer].action(this);
        }
      }
    }
  };

  module.exports = {Context: Context};
})();
