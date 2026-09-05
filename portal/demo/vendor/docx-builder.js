/**
 * Enkel OOXML-byggare för .docx-filer
 * Använder PizZip för att skapa zip-strukturen
 */
(function(window) {
  'use strict';

  function buildDocx(sections) {
    var zip = new PizZip();
    
    // [Content_Types].xml
    var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      '</Types>';
    zip.file('[Content_Types].xml', contentTypes);
    
    // _rels/.rels
    var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      '</Relationships>';
    zip.file('_rels/.rels', rels);
    
    // word/_rels/document.xml.rels
    var wordRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '</Relationships>';
    zip.file('word/_rels/document.xml.rels', wordRels);
    
    // word/document.xml med innehåll
    var body = '';
    sections.forEach(function(section) {
      // Rubrik (Heading 1)
      body += '<w:p>' +
        '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>' +
        '<w:r><w:t>' + escapeXml(section.title) + '</w:t></w:r>' +
        '</w:p>';
      
      // Innehåll (paragraf för varje rad)
      if (section.content) {
        var lines = section.content.split('\n').filter(function(l) { return l.trim(); });
        lines.forEach(function(line) {
          body += '<w:p><w:r><w:t xml:space="preserve">' + escapeXml(line) + '</w:t></w:r></w:p>';
        });
      }
      
      // Tom rad efter sektion
      body += '<w:p><w:r><w:t></w:t></w:r></w:p>';
    });
    
    var document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' + body + '</w:body>' +
      '</w:document>';
    zip.file('word/document.xml', document);
    
    return zip.generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  
  function escapeXml(text) {
    return String(text || '').replace(/[<>&'"]/g, function(c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c];
    });
  }
  
  window.DocxBuilder = {
    build: buildDocx
  };
})(window);
