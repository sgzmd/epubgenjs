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

var download = function() {
  new FFD(window.location.href).download(function(chapterId, chapterText) {
    console.log(chapterId);
  }, alert);
}

include('jszip.js', function() {
  include('epubgen.js', function() {
    include('ffd.js', function(){
      download();
    });
  });
});


