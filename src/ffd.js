const FFNRE = /www\.fanfiction\.net\/s\/([0-9]+)\/.+/;
const FFN_BASE = 'http://www.fanfiction.net/s/';

function normaliseUrl(url) {
  if (url.indexOf("/") > 0) {
    var result = FFNRE.exec(url);
    if (result.length != 2) {
      throw "Incorrect storyId " + storyId;
    } else {
      url = result[1];
    }
  }

  return FFN_BASE + url;
}

function FFD(storyId) {
  if (storyId.indexOf("/") > 0) {
    var result = FFNRE.exec(storyId);
    if (result.length != 2) {
      throw "Incorrect storyId " + storyId;
    } else {
      storyId = result[1];
    }
  }
};

FFD.prototype.setStoryId_ = function (storyId) {
  this.storyId_ = storyId;
  this.url_ = FFN_BASE + storyId;
};

FFD.prototype.download = function (chapterCb, doneCb) {
  var request = new XMLHttpRequest();

  request.open("get", this.url_, true);
  var that = this;
  request.addEventListener("load", function (page) {
    var el = document.createElement('div');
    el.innerHTML = page.currentTarget.response;
    var options = el.querySelectorAll("#chap_select option");

    var storyName = el.querySelector('b.xcontrast_txt').innerHTML;
    var authorName = el.querySelector('td a.xcontrast_txt').innerHTML;
    var description = el.querySelector('td div.xcontrast_txt').innerHTML;
    var options = el.querySelectorAll("#chap_select option");

    var processedOptions = [];

    for (var i = 0; i < options.length; ++i) {
      var val = options[i].value;

      if (processedOptions.indexOf(val) > -1) {
        continue;
      } else {
        processedOptions.push(val);
      }

      var url = normaliseUrl(window.location.href) + "/" + val;
      console.log("Requesting " + url);
      var req = new XMLHttpRequest();
      req.open("get", url, false);

      req.addEventListener('load', function (page) {
        chapterCb(val, page.currentTarget.response);
      });

      req.send();
    }
  });

  request.send();
};
