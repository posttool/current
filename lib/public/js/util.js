// Avoid `console` errors in browsers that lack a console.
(function() {
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = window.console || {};

    while (length--) {
        // Only stub undefined methods.
        console[methods[length]] = console[methods[length]] || noop;
    }
}());

// Local Storage
var zcookie = {
    exists: (typeof (Storage) !== "undefined" && window['localStorage'] !== null && window['localStorage'] !== undefined)? true: false,
    set: function(key,val){
        if(!this.exists) return null;
        localStorage.setItem( key, JSON.stringify(val) );
        return true;
    },
    get: function(key, default_if_null){
        if(!this.exists) return null;
        var value = localStorage.getItem(key);
        if (!value)
            return default_if_null;
        return value && JSON.parse(value);
    },
    remove: function(key){
        if(!this.exists) return null;
        localStorage.removeItem(key);
        return true;
    },
    destroy: function(){
        if(!this.exists) return null;
        localStorage.clear();
    }
};
//        console.log('window.location.pathname',window.location.pathname)

var obj_to_attr = function(obj){
    var str = ' ';
    for( var p in obj ){
        str += p +'="'+ obj[p] + '" ';
    }
    return str;
}

// Place any jQuery/helper plugins in here.

var $$ = function(className, options)
{
    options = $.extend({
        el: 'div',
        attributes: {},
        css: {},
        parent: null,
        children: [],
        data: {}
    }, options);

     /* Unfortunately, jquery doesn't seem to like to set some attributes as DOM properties. (Notably href for off-DOM objects!!)
        Converting the attributes to a string and making that part of the $el constructor forces jquery to use innerHTML for atts. Yes, slower.
        If there's any problem constructing elements, use the following line:*/
    //  var $el = $( '<'+ options.el + obj_to_attr(options.attributes) +' />' ).css( options.css );
    var $el = $( '<'+ options.el +' />', options.attributes ).css( options.css );

    $el.addClass(className);

    if (options.parent!=null)
        options.parent.append($el);
    for (var i=0; i<options.children.length; i++)
        $el.append(options.children[i]);
    for (var p in options.data)
        $el.attr('data-'+p, options.data[p]);
    return $el;
}


function $$icon(className, options) {
  var $c = $("<span><i class='fa fa-" + options.fa + "'></i></span>");
  if (options.label)
    $c.append(options.label);
  if (options.parent)
    options.parent.append($c);
  if (className)
    $c.addClass(className);
  $c.setfa = function(fa){
    $c.find('i').remove();
    $c.prepend("<i class='fa fa-" +fa + "'></i>")
  };
  return $c;
}

function $$ajax(url,data,type)
{
    return $.ajax({
        crossDomain:false,
        method: type ? type : 'get',
        url: url,
        dataType: "json",
        contentType: "application/json",
        processData: false,
        data: data ? data : ""
    }).fail(function(e){
            console.log("ERROR",e.responseText);
        });
}


function timeSince(date) {

  return moment(date).fromNow();
}


function formatDate(date)
{
  return moment(date).format('MMMM Do YYYY, h:mm:ss a');
}


// modal template
function $$modal(title)
{
    var $el = $$('modal', { css: { display: 'none'} });

    var $head = $$('modal-header',{parent: $el});
    var $btn = $$('close', { el: 'button', parent: $head,
        attributes: { type:'button'}, data: { dismiss: 'modal' }, children: [ $('<span>&times;</span>') ]
    });
    var $h = $$(null,{ el: 'h3',parent: $head, children: [title] });
    var $form = $$('dirty_form', { el: 'form', parent: $el,css: { marginBottom: 0}
    });
    var $body = $$('modal-body', { parent: $form});
    var $foot = $$('modal-footer',{ parent: $form });
    return $el;
}







// component mixin


function form_make_listener(c) {
  if (c.add_listener)
    return;
  var listeners = {};
  var bubbler = null;
  c.add_listener = function (name, callback) {
    if (!listeners[name])
      listeners[name] = [];
    listeners[name].push(callback);
  }
  c.remove_listeners = function (name) {
    listeners[name] = [];
  }
  c.emit = function (name, data) {
    if (bubbler)
      bubbler.emit(name, data);
    else if (listeners[name])
      for (var i = 0; i < listeners[name].length; i++)
        listeners[name][i](c, data);
  }
  c.bubble_listener = function(p){
    bubbler = p;
  }
}




// find a property named 'thumb' within the provided object

function find_thumb(v) {
  var t = find_obj_by_attr(v, 'thumb');
  if (t)
  return t.thumb;
  else return null;
}


function find_obj_by_attr(v, attr, val) {
  if (v == null)
    return null;
  if ($.isPlainObject(v)) {
    var prop = find_prop(v, attr);
    if (prop.found)
      if (val) {
        if (prop.value == val)
          return v;
      }
      else
        return v;
    for (var p in v) {
      var f = find_obj_by_attr(v[p], attr, val);
      if (f)
        return f;
    }
  } else if ($.isArray(v)) {
    for (var i = 0; i < v.length; i++) {
      var f = find_obj_by_attr(v[i], attr, val);
      if (f)
        return f;
    }
  } else {
    return null;
  }
}

function find_prop(v, p){
  var ps = p.split('.');
  var t = v;
  for (var i=0; i<ps.length; i++) {
    if (!t[ps[i]])
      return {found: false, at: ps[i]};
    t = t[ps[i]];
  }
  return {found: true, value: t};
}

function find_thumb2(c){
  var f = find_obj_by_attr(c, 'meta.job_name', 'image thumb');
  if (f) return media_path(f);
  f = find_obj_by_attr(c, 'mime', 'image/jpeg');
  return media_path(f);
}

function media_path(resource)
{
  if (!resource)
    return null;
  if (containerHttp)
    return containerHttp + resource.path;
  else
    return download_url + '/' + resource._id
}