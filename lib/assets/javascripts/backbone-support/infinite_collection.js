Support.InfiniteCollection = function (models, options) {
  Backbone.Collection.apply(this, [models, options]);
}

_.extend(Support.InfiniteCollection.prototype, Backbone.Collection.prototype, {
  initialize: function (models, options) {
    _.bindAll(this, 'parse', 'url', 'nextSet', 'setInfo', 'hasNextSet');
    typeof (options) != 'undefined' || (options = {});

    // really this is just a paginated collection 
    // but we can't go 'back' pages. We just add them to the current
    // set of models

    // keep track of the page we are on internally
    this.page = 1;
    typeof (this.perPage) != 'undefined' || (this.perPage = 12);
  },

  fetch: function (options) {
    typeof (options) != 'undefined' || (options = {});
    this.trigger("fetching");
    var self = this;
    var success = options.success;
    options.success = function (resp, xhr) {
      self.trigger("fetched");
      if (success) {
        success(self, resp);
      }
    };
    return Backbone.Collection.prototype.fetch.call(this, options);
  },

  parse: function (resp) {
    this.page = parseInt(resp.page);
    this.perPage = parseInt(resp.per_page);
    this.total = parseInt(resp.total);
    return resp.models;
  },

  url: function () {
    return this.baseUrl + '/page/' + this.page + '?' + $.param({
      per_page: this.perPage
    });
  },

  setInfo: function () {
    var info = {
      total: this.total,
      next: false
    };

    var pInfo = {
      page: this.page,
      perPage: this.perPage,
      pages: Math.ceil(this.total / this.perPage)
    }

    if (this.page < pInfo.pages) {
      info.next = parseInt(this.page) + 1;
    }

    return info;
  },

  hasNextSet: function () {
    return this.setInfo().next ? true : false;
  },

  nextSet: function () {
    if (!this.hasNextSet()) {
      return false;
    }

    this.page = parseInt(this.page) + 1;
    return this.fetch({
      add: true
    });
  }
});

Support.InfiniteCollection.extend = Backbone.Collection.extend;