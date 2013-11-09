EpubGenJs
=========

A JavaScript library to produce ePub files from valid XHTML. Example:

    // Defining story content
    var xhtml = "<html><head><title>Hello!</title></head><body>World!</body></html>";
    var chapter = new Chapter("My Sample Chapter", xhtml);

    // building epub object
    var epub = Epub.emptyStory()
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
