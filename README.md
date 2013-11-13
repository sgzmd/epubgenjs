EpubGenJs
=========

A JavaScript library to produce ePub files from valid XHTML. Example:

    // Defining story content
    var xhtml = "<html><head><title>Hello!</title></head><body>World!</body></html>";
    var chapter = new Chapter("My Sample Chapter", xhtml);

    // building epub object
    var epub = Epub.emptyBook()
      .withChapters(chapter)
      .withAuthor("Roman Kirillov")
      .withDescription("Test ePub file")
      .withLanguage("en")
      .withCreatedOn(new DateTime().toISOString())
      .withPublishedOn(new DateTime().toISOString())
      .withSource("https://github.com/sigizmund/epubgenjs")
      .build();

    // compiling epub blob
    var blob = epub.compile({type: 'blob'});
    var uriContent = window.URL.createObjectURL(blob);

    // creating a link to download produced file
    var btn = document.createElement("a");

    btn.textContent = "Download ePub";
    btn.setAttribute('href', uriContent);
    btn.setAttribute('download', 'my-sample-story.epub');

    document.body.appendChild(btn);

Use `examples/make_simple_epub.html` to start, and I hope to add better documentation later.

Another good example is `ffd.js` -- use example bookmarklet in `bootstrap.js` or follow these instructions:

  * Create a bookmarklet with this code (naturally, all in one line):


    javascript:var a=document.createElement('script');a.setAttribute('src', \
      'https://raw.github.com/sigizmund/epubgenjs/master/src/bootstrap.js');\
      document.head.appendChild(a);


  * Navigate to Fanfiction.Net story

  * Click created bookmarklet

You will (hopefully) be able to download full story as a epub file with chapters and TOC.