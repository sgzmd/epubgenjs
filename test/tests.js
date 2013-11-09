var epub = require('./epubgen.js')
var parseString = require('xml2js').parseString;

require("./../src/jszip.js");

module.exports = {
    setUp: function (callback) {
        this.epub_ = epub.Epub.emptyBook()
          .withStoryName("storyName")
          .withAuthor("author")
          .withLanguage("en-GB")
          .withDescription("StoryDescription")
          .withChapters([ 
            new epub.Chapter("title1", "content1"),
            new epub.Chapter("title2", "content2")])
          .withCreatedOn("2013-11-09 16:51")
          .withPublishedOn("2013-11-09 16:52")
          .withModifiedOn("2013-11-09 16:52")
          .withSource("www.sigizmund.com")
          .build();

        callback();
    },

    'toc.ncx is built correctly': function (test) {
      parseString(this.epub_.makeTocNcx_(), function(err,result){
        test.equals(1, result.ncx.navMap.length);
        test.done();
      });      
    },

    'content.opf header is built correctly': function(test) {
      var xml = this.epub_.makeContentOpf_();

      test.ok(xml.indexOf('<dc:identifier id="epubgenjs-uid">epubgenjs-uid:www.sigizmund.com</dc:identifier>') > 0);
      test.ok(xml.indexOf('<dc:title>storyName</dc:title>') > 0);
      test.ok(xml.indexOf('<dc:creator opf:role="aut">author</dc:creator>') > 0);
      test.ok(xml.indexOf('<dc:description>StoryDescription</dc:description>') > 0);

      test.done();    
    },

    'content.opf manifest is built correctly': function(test) {
      var xml = this.epub_.makeContentOpfManifest_();
      parseString(xml, function(err,result){
        test.equals(3, result.manifest.item.length);
        test.equals("toc.ncx", result.manifest.item[0].$.href);
        test.equals("OEBPS/chapter_0.xhtml", result.manifest.item[1].$.href);
      });
      test.done();
    },

    'content.opf spines are built correctly': function(test){
      var xml = this.epub_.makeContentOpfSpine_();
      var expected = [
        '<spine toc="ncx">',
        '<itemref idref="chapter_0" linear="yes"/>',
        '<itemref idref="chapter_1" linear="yes"/>',
        '</spine>'].join("\n");
      test.equals(expected, xml);
      test.done();
    },

    'Epub file is compiled': function(test) {
      // just a smoke test really
      var compiled = this.epub_.compile();
      test.ok(compiled.length > 0);
      test.done();
    },

    'Empty ePub will throw an error': function(test) {
      test.throws(epub.Epub.emptyBook().build());

      test.done();
    }
};