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

const FFNRE = /www\.fanfiction\.net\/s\/([0-9]+)\/.+/;
const FFN_BASE = 'https://www.fanfiction.net/s/';

const CHAPTER_START =
    ['<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"',
      '    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    "<html xmlns='http://www.w3.org/1999/xhtml'><head><title>Chapter</title></head><body>\n"]
        .join("\n");

const OVERLAY_STYLE = 'width: 100%; height: 100%; z-index: 10; background-color: #000; opacity: 0.9;  position: absolute; top: 0; left: 0;';
const CENTRE_STYLE = 'position: fixed; top: 50%; left: 50%; margin-top: -25px; margin-left: -60px; color: green';

const CHAPTER_END = "\n</body></html>\n";

function FFD(storyId) {
  console.log("Creating FFD for " + storyId);
  if (storyId.indexOf("/") > 0) {
    var result = FFNRE.exec(storyId);
    if (result.length != 2) {
      throw "Incorrect storyId " + storyId;
    } else {
      storyId = result[1];
    }
  }

  this.setStoryId_(storyId);
}

FFD.prototype.setStoryId_ = function (storyId) {
  this.url_ = FFN_BASE + storyId;
};

FFD.downloadFunctionFactory = function(chapterCb, doneCb, url) {
  return function (page) {
    var el = document.createElement('div');
    el.innerHTML = page.currentTarget.response;

    var storyName = el.querySelector('b.xcontrast_txt').innerHTML;
    var authorName = el.querySelector('a.xcontrast_txt[href*="/u/"').innerHTML;
    var description = el.querySelector('div#content_wrapper_inner div.xcontrast_txt').innerHTML;
    var options = el.querySelectorAll("#chap_select option");

    var processedOptions = [];

    for (var i = 0; i < options.length; ++i) {
      var val = options[i].value;

      if (processedOptions.indexOf(val) > -1) {
        continue;
      } else {
        processedOptions.push(val);
      }

      var chapterUrl = url + "/" + val;
      console.log("Requesting " + chapterUrl);
      var req = new XMLHttpRequest();
      req.open("get", chapterUrl, false);

      req.addEventListener('load', function (page) {
        chapterCb(val, options[i].innerText, FFD.extractChapter(page.currentTarget.response));
      });

      req.send();
    }

    doneCb(storyName, authorName, description);
  }
};

FFD.extractChapter = function(html) {
  var div = document.createElement('div');
  div.innerHTML = html;

  var storyTextDiv = div.querySelector("div#storytext");

  var xml = HTMLtoXML(storyTextDiv.innerHTML);
  return CHAPTER_START + xml + CHAPTER_END;
};

FFD.prototype.download_ = function (chapterCb, doneCb) {
  console.log("FFD: starting download");
  var request = new XMLHttpRequest();

  request.open("get", this.url_, true);
  var callback = FFD.downloadFunctionFactory(chapterCb, doneCb, this.url_);
  request.addEventListener("load", callback);

  request.send();
};

FFD.createEbook = function (storyUrl) {
  if (confirm("Process of downloading a story may take up to few minutes, more on " +
      "low internet connection. During this time browser may appear frozen. Please " +
      "confirm if you would like to continue")) {
    var ffd = new FFD(storyUrl);
    var chapters = [];
    ffd.download_(
        function (chapterId, chapterName, chapterText) {
          chapters[parseInt(chapterId)] = {
            'text': chapterText,
            'name': chapterName
          };
        }, function (storyName, authorName, description) {

          var epubChapters = [];
          for (var chapter in chapters) {
            epubChapters.push(new Chapter(chapters[chapter].name, chapters[chapter].text));
          }

          var epub = Epub.emptyBook()
              .withChapters(epubChapters)
              .withAuthor(authorName)
              .withStoryName(storyName)
              .withDescription(description)
              .withSource(storyUrl)
              .build();

          var blob = epub.compile({type: 'blob'});
          var uriContent = window.URL.createObjectURL(blob);

          var fileName = storyName.replace(/\s/gi, "_");

          var overlay = document.createElement('div');
          overlay.setAttribute('style', OVERLAY_STYLE);
          var btn = document.createElement('a');
          btn.setAttribute('style', CENTRE_STYLE);
          btn.setAttribute('download', fileName + '.epub');
          btn.setAttribute('href', uriContent);
          btn.textContent = "Download story";
          overlay.appendChild(btn);
          document.body.appendChild(overlay);
        })
  }
};
