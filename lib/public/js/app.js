var upload_url = "/cms/upload";
var download_url = "/cms/download";
var delete_url = "/cms/delete_resource/";

function init_cms(base_url) {
  // track control/meta key
  var ctrlKeyDown;
  $(window).keydown(function (e) {
    ctrlKeyDown = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
  }).keyup(function (e) {
    ctrlKeyDown = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
  });

  // the "app"
  var app = {
    base_url: base_url ? base_url : '/cms',
    layers: new layers_layers(),
    $el: function(){ return app.layers.$el(); }
  }

  // restoring state
  window.addEventListener("popstate", function (e) {
    var s = e.state ? e.state : location.pathname;
    var f = app.layers.find(s);
    if (f != -1) {
      if (f == 0 && app.layers.size() == 1)
        history.back();
      else
        app.layers.pop_to(s);
    }
    else {
      app.layers.clear_layers();
      create_layer(s);
    }
  });
//  var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;
//  if (!popped)
    create_layer(location.pathname);

  // creating layers for
  //   browse/:type
  //   form/create/:type
  //   form/update/:type/:id
  function create_layer(path) {
    var p = path.substring(1).split('/');
    if (p[1] == 'browse')
      browse(p[2])
    else if (p[1] == 'create')
      form(p[2])
    else if (p[1] == 'update')
      form(p[2], p[3]);
  }

  function form(type, id) {
    var ff = new form_form(app, type, id);
    ff.add_listener('browse', function (f, o) {
      var bb = new browse_browse(app, o.type);
      bb.add_listener('select', function (e, r) {
        o.field.push(r);
        o.field.emit('change');
        ff.save(0);
        app.layers.pop_layer();
      });
      app.layers.add_layer(bb);
    });
    ff.add_listener('create', function (f, o) {
      var fff = form(o.type);
      var once = false;
      fff.add_listener('save', function (e, r) {
        if (!once && r.created)
        {
          o.field.push(r);
          o.field.emit('change');
          ff.save(0);
          once = true;
        }
      });
    });
    ff.add_listener('select', function (f, o) {
      var ff = form(o.type, o.id);
      ff.add_listener('close', function (e, r) {
//        update_object(o.field, r);//happens in layer.refresh
      });
    });
    ff.refresh();
    app.layers.add_layer(ff);
    return ff;
  }

  function browse(type) {
    var browser = new browse_browse(app, type);
    browser.add_listener('select', function (f, r) {
      if (ctrlKeyDown) {
        var url = base_url + '/update/' + type + '/' + r._id;
        var win = window.open(url, ctrlKeyDown ? '_blank' : '_self');
        win.focus();
      }
      else {
        var ff = form(type, r._id);
        ff.add_listener('close', function (e, r) {
          app.layers.pop_layer();
        });
      }
    });
    app.layers.add_layer(browser);
  }

  return app;
}