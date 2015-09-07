/* globals jQuery */
/**
 The MIT License

 Copyright (c) 2010 Daniel Park (http://metaweb.com, http://postmessage.freebaseapps.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 **/

NO_JQUERY={};
(function(d,b,h){if(!("console"in d)){var g=d.console={};g.log=g.warn=g.error=g.debug=function(){}}b===NO_JQUERY&&(b={fn:{},extend:function(){for(var b=arguments[0],d=1,g=arguments.length;d<g;d++){var k=arguments[d],h;for(h in k)b[h]=k[h]}return b}});b.fn.pm=function(){console.log("usage: \nto send:    $.pm(options)\nto receive: $.pm.bind(type, fn, [origin])");return this};b.pm=d.pm=function(b){k.send(b)};b.pm.bind=d.pm.bind=function(b,d,g,h){k.bind(b,d,g,h)};b.pm.unbind=d.pm.unbind=function(b,d){k.unbind(b,
    d)};b.pm.origin=d.pm.origin=null;b.pm.poll=d.pm.poll=200;var k={send:function(d){d=b.extend({},k.defaults,d);var g=d.target;if(d.target)if(d.type){var h={data:d.data,type:d.type};d.success&&(h.callback=k._callback(d.success));d.error&&(h.errback=k._callback(d.error));"postMessage"in g&&!d.hash?(k._bind(),g.postMessage(JSON.stringify(h),d.origin||"*")):(k.hash._bind(),k.hash.send(d,h))}else console.warn("postmessage type required");else console.warn("postmessage target window required")},bind:function(e,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              g,h,m){"postMessage"in d&&!m?k._bind():k.hash._bind();m=k.data("listeners.postmessage");m||(m={},k.data("listeners.postmessage",m));var n=m[e];n||(n=[],m[e]=n);n.push({fn:g,origin:h||b.pm.origin})},unbind:function(b,d){var g=k.data("listeners.postmessage");if(g)if(b)if(d){var h=g[b];if(h){for(var n=[],q=0,u=h.length;q<u;q++){var t=h[q];t.fn!==d&&n.push(t)}g[b]=n}}else delete g[b];else for(q in g)delete g[q]},data:function(b,d){return d===h?k._data[b]:k._data[b]=d},_data:{},_CHARS:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
  _random:function(){for(var b=[],d=0;32>d;d++)b[d]=k._CHARS[0|32*Math.random()];return b.join("")},_callback:function(b){var d=k.data("callbacks.postmessage");d||(d={},k.data("callbacks.postmessage",d));var g=k._random();d[g]=b;return g},_bind:function(){k.data("listening.postmessage")||(d.addEventListener?d.addEventListener("message",k._dispatch,!1):d.attachEvent&&d.attachEvent("onmessage",k._dispatch),k.data("listening.postmessage",1))},_dispatch:function(b){try{var d=JSON.parse(b.data)}catch(g){console.warn("postmessage data invalid json: ",
      g);return}if(d.type){var h=(k.data("callbacks.postmessage")||{})[d.type];if(h)h(d.data);else for(var h=(k.data("listeners.postmessage")||{})[d.type]||[],n=0,q=h.length;n<q;n++){var u=h[n];if(u.origin&&b.origin!==u.origin&&-1==b.data.indexOf("getSuggestionsRecord"))console.warn("postmessage message origin mismatch",b.origin,u.origin),d.errback&&k.send({target:b.source,data:{message:"postmessage origin mismatch",origin:[b.origin,u.origin]},type:d.errback});else try{var t=u.fn(d.data);d.callback&&k.send({target:b.source,
    data:t,type:d.callback})}catch(z){d.errback&&k.send({target:b.source,data:z,type:d.errback})}}}else console.warn("postmessage message type required")},hash:{send:function(b,g){var h=b.target,m=b.url;if(m){var m=k.hash._url(m),n,q=k.hash._url(d.location.href);if(d==h.parent)n="parent";else try{for(var u=0,t=parent.frames.length;u<t;u++)if(parent.frames[u]==d){n=u;break}}catch(z){n=d.name}null==n?console.warn("postmessage windows must be direct parent/child windows and the child must be available through the parent window.frames list"):
      (n={"x-requested-with":"postmessage",source:{name:n,url:q},postmessage:g},q="#x-postmessage-id="+k._random(),h.location=m+q+encodeURIComponent(JSON.stringify(n)))}else console.warn("postmessage target window url is required")},_regex:/^\#x\-postmessage\-id\=(\w{32})/,_regex_len:50,_bind:function(){k.data("polling.postmessage")||(setInterval(function(){var b=""+d.location.hash,g=k.hash._regex.exec(b);g&&(g=g[1],k.hash._last!==g&&(k.hash._last=g,k.hash._dispatch(b.substring(k.hash._regex_len))))},b.pm.poll||
  200),k.data("polling.postmessage",1))},_dispatch:function(b){if(b){try{if(b=JSON.parse(decodeURIComponent(b)),!("postmessage"===b["x-requested-with"]&&b.source&&null!=b.source.name&&b.source.url&&b.postmessage))return}catch(g){return}var h=b.postmessage,m=(k.data("callbacks.postmessage")||{})[h.type];if(m)m(h.data);else for(var m="parent"===b.source.name?d.parent:d.frames[b.source.name],n=(k.data("listeners.postmessage")||{})[h.type]||[],q=0,u=n.length;q<u;q++){var t=n[q];if(t.origin){var z=/https?\:\/\/[^\/]*/.exec(b.source.url)[0];
    if(z!==t.origin){console.warn("postmessage message origin mismatch",z,t.origin);h.errback&&k.send({target:m,data:{message:"postmessage origin mismatch",origin:[z,t.origin]},type:h.errback,hash:!0,url:b.source.url});continue}}try{var O=t.fn(h.data);h.callback&&k.send({target:m,data:O,type:h.callback,hash:!0,url:b.source.url})}catch(r){h.errback&&k.send({target:m,data:r,type:h.errback,hash:!0,url:b.source.url})}}}},_url:function(b){return(""+b).replace(/#.*$/,"")}}};b.extend(k,{defaults:{target:null,
  url:null,type:null,data:null,success:null,error:null,origin:"*",hash:!1}})})(this,"undefined"===typeof jQuery?NO_JQUERY:jQuery);
