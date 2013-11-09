if (!JSZip) {
  if (typeof require === 'undefined') {
    // we are running in browser, someone else
    // should take care of dependencies
  } else {
    var JSZip = require('node-zip');
  }
}
/**
 * Helper method for formatting XML.
 */
String.prototype.format = function () {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function (m, n) { return args[n]; });
};

var Constants = {
  MIMETYPE_FILE_NAME: "mimetype",
  MIMETYPE_FILE_CONTENT: "application/epub+zip",
  CONTAINER_FILE_NAME: "container.xml",
  CONTAINER_FILE_CONTENT: [
    '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">',
    ' <rootfiles>',
    '  <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>',
    ' </rootfiles>',
    '</container>'].join("\n"),
  TOC_NCX_FILE_NAME: "toc.ncx",
  TOC_NCX_FILE_CONTENT_START: [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">',
    ' <head>',
    '   <meta content="fanficdownloader-uid:www.fanfiction.net-u1013852-s6652537" name="dtb:uid"/>',
    '   <meta content="1" name="dtb:depth"/>',
    '   <meta content="0" name="dtb:totalPageCount"/>',
    '   <meta content="0" name="dtb:maxPageNumber"/>',
    ' </head>'].join("\n"),
  CONTENT_OPF_FILE_NAME: "content.opf",
  CONTENT_OPF_FILE_CONTENT:  [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<package unique-identifier="fanficdownloader-uid" version="2.0" xmlns="http://www.idpf.org/2007/opf">',
    '{0}',
    '{1}',
    '{2}',
    '</package>'].join("\n"),
  CONTENT_OPF_FILE_HEADER: [
    '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">',
    ' <dc:identifier id="epubgenjs-uid">epubgenjs-uid:{0}</dc:identifier>',
    ' <dc:title>{1}</dc:title>',
    ' <dc:creator opf:role="aut">{2}</dc:creator>',
    ' <dc:contributor opf:role="bkp">epubgenjs</dc:contributor>',
    ' <dc:rights></dc:rights>',
    ' <dc:language>{3}</dc:language>',
    ' <dc:date opf:event="publication">{4}</dc:date>',
    ' <dc:date opf:event="creation">{7}</dc:date>',
    ' <dc:date opf:event="modification">{8}</dc:date>',
    ' <dc:description>{5}</dc:description>',
    ' <dc:publisher>TBC</dc:publisher>',
    ' <dc:identifier opf:scheme="URL">{6}</dc:identifier>',
    ' <dc:source>{6}</dc:source>',
    '</metadata>'].join("\n"),
  CONTENT_OPF_MANIFEST: '<manifest>\n{0}</manifest>',
  CONTENT_OPF_ITEM: '<item href="{0}" id="{1}" media-type="{2}"/>\n',
  CONTENT_OPF_SPINE: '<spine toc="ncx">\n{0}</spine>',
  CONTENT_OPF_SPINE_ITEM: '<itemref idref="{0}" linear="yes"/>\n',
  OEBPS: "OEBPS"
};

/**
 * Helper object to encapsulate a chapter in a book
 * @param title_ Chapter title, e.g. "CHAPTER I, IN WHICH WE ARE INTRODUCED TO
 *      WINNIE-THE-POOH AND SOME BEES, AND THE STORIES BEGIN".
 * @param content_ Valid XHTML document - content of the chapter.
 * @constructor
 */
function Chapter(title_, content_) {
  /**
   * @returns {String} Chapter title
   */
  this.title = function() {
    return title_;
  }
  /**
   * @returns {String} Chapter content
   */
  this.content = function() {
    return content_;
  }
}

/**
 * Creates new ePub object
 *
 * @param chapters List or a single {Chapter}
 * @constructor
 */
function Epub(chapters) {
	this.storyName_ = "Just another ePub story";
	this.storyAuthor_ = "EPubGenJs";

  if (chapters) {
  	if (chapters.length) {
      this.chapters_ = chapters;  
    } else if (chapters) {
      this.chapters_ = [ chapters ]; 
    } 
  } 
  
  this.description_ = "";
  this.language_ = "Unknown";
  this.source_ = "EPubGenJs";
  this.createdOn_ = this.publishedOn_ = this.modifiedOn_ = new Date().toISOString();
};


/**
 * Creates an empty {Epub} object.
 * @returns {Epub}
 */
Epub.emptyBook = function() {
  return new Epub(new Chapter("", ""));
};

Epub.prototype.withStoryName = function(storyName) {
  this.storyName_ = storyName;
  return this;
};

Epub.prototype.withChapters = function(chapters) {
  if (chapters) {
    if (chapters.length) {
      this.chapters_ = chapters;
    } else {
      this.chapters_ = [ chapters ];
    }
  } else {
    throw "Chapters is empty";
  }

  return this;
};

Epub.prototype.withLanguage = function(language) {
  this.language_ = language;
  return this;
};

Epub.prototype.withAuthor = function(author) {
  this.storyAuthor_ = author;
  return this;
};

Epub.prototype.withCreatedOn = function(createdOn) {
  this.createdOn_ = createdOn;
  return this;
};

Epub.prototype.withPublishedOn = function(publishedOn) {
  this.publishedOn_ = publishedOn;
  return this;
};

Epub.prototype.withModifiedOn = function(modifiedOn) {
  this.modifiedOn_ = modifiedOn;
  return this;
};

Epub.prototype.withDescription = function(description) {
  this.description_ = description;
  return this;
};

Epub.prototype.withSource = function(source) {
  this.source_ = source;
  return this;
};

/**
 * No-op, validates essential Epub fields.
 * @returns {Epub}
 */
Epub.prototype.build = function() {
  if (!this.storyName_ || !this.chapters_) {
    throw "At least story name and chapters must be specified";
  }

  return this;
};

/**
 * Compiles created ePub object into a epub (zip) blob.
 *
 * @param type
 * @returns {Blob}
 */
Epub.prototype.compile = function(type) {
  var zip = new JSZip();

  zip.file(Constants.MIMETYPE_FILE_NAME, Constants.MIMETYPE_FILE_CONTENT);
  zip.folder("META-INF").file(Constants.CONTAINER_FILE_NAME, Constants.CONTAINER_FILE_CONTENT);

  zip.file(Constants.CONTENT_OPF_FILE_NAME, this.makeContentOpf_());
  zip.file(Constants.TOC_NCX_FILE_NAME, this.makeTocNcx_());

  var oebps = zip.folder(Constants.OEBPS);

  for (var i = 0; i < this.chapters_.length; ++i) {
    oebps.file(this.makeChapterFileName_(i), this.chapters_[i].content());
  }

  return zip.generate(type);
};

Epub.prototype.makeContentOpf_ = function() {
  var header = Constants.CONTENT_OPF_FILE_HEADER.format(
    this.source_,
    this.storyName_,
    this.storyAuthor_,
    this.language_,
    this.publishedOn_,
    this.description_,
    this.source_,
    this.createdOn_,
    this.modifiedOn_);

  return Constants.CONTENT_OPF_FILE_CONTENT.format(
      header,
      this.makeContentOpfManifest_(),
      this.makeContentOpfSpine_());
};

Epub.prototype.makeContentOpfManifest_ = function() {
  var items = Constants.CONTENT_OPF_ITEM.format("toc.ncx", "ncx", "application/x-dtbncx+xml");
  for (var i = 0; i < this.chapters_.length; ++i) {
    items += Constants.CONTENT_OPF_ITEM.format(
        this.makeChapterFilePath_(i),
        this.makeChapterId_(i),
        "application/xhtml+xml");
  }
  return Constants.CONTENT_OPF_MANIFEST.format(items);
};

Epub.prototype.makeContentOpfSpine_ = function() {
  var items = "";
  for (var i = 0; i < this.chapters_.length; ++i) {
    items += Constants.CONTENT_OPF_SPINE_ITEM.format(this.makeChapterId_(i));
  }
  return Constants.CONTENT_OPF_SPINE.format(items);
};

Epub.prototype.makeChapterId_ = function(sequentialNumber) {
  return "chapter_" + sequentialNumber;
};

Epub.prototype.makeChapterFileName_ = function(sequentialNumber) {
  return this.makeChapterId_(sequentialNumber) + ".xhtml";
};

Epub.prototype.makeChapterFilePath_ = function(sequentialNumber) {
  return Constants.OEBPS + "/" + this.makeChapterFileName_(sequentialNumber);
};

Epub.prototype.makeTocNcx_ = function() {
  var result = Constants.TOC_NCX_FILE_CONTENT_START;
  result += "<docTitle><text>" + this.storyName_ + "</text></docTitle>\n";

  result += "<navMap>\n";
  for (var i = 0; i < this.chapters_.length; ++i) {
    var chapterId = this.makeChapterId_(i);
    result += "<navPoint id='" + chapterId + "' playOrder='" + i + "'>\n";
    result += "<navLabel><text>" + this.chapters_[i].title() + "</text></navLabel>\n";
    result += "<content src='" + this.makeChapterFilePath_(i) + "'/></navPoint>\n";
  }
  result += "</navMap>\n</ncx>\n";

  return result;
};

if (typeof exports != 'undefined') {
  // for Node.js
  exports.Epub = Epub;
  exports.Chapter = Chapter;
};