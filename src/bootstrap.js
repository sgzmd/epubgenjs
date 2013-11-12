/*
 * Copyright (C) 2013 Roman "sgzmd" Kirillov [me@romankirillov.info]
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// bookmarklet:
// javascript:var a=document.createElement('script');\
//    a.setAttribute('src', 'http://localhost:8000/bootstrap.js');\
//    document.head.appendChild(a);

var scriptUrl = null;
const scripts = document.getElementsByTagName('script');
for (var i = 0; i < scripts.length; ++i) {
  if (scripts[i].src.indexOf('bootstrap.js') > 0) {
    scriptUrl = scripts[i].src;
  }
}
const baseUrl = scriptUrl.split("/").slice(0, -1).join("/");
console.log("Will download stuff from base URL " + baseUrl);

var include = function(src, cb) {
  var script = document.createElement('script');
  script.setAttribute('src', baseUrl + "/" + src);
  script.addEventListener('load', cb);
  document.head.appendChild(script);
};

include('jszip.js', function() {
  include('simplehtmlparser.js');
  include('epubgen.js', function() {
    include('ffd.js', function(){
      FFD.createEbook(window.location.href);
    });
  });
});


