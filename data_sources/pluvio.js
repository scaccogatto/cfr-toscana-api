var page = require('webpage').create();
page.open('http://cfr.toscana.it/monitoraggio/stazioni.php?type=pluvio', function(status) {
  if(status === "success") {
    var data = page.evaluate(function () {
      document.querySelector('form table tbody').removeChild(document.querySelector('form table.sortable tr:first-child'))
      return document.querySelector('form table.sortable');
    })
    console.log(data.outerHTML)
  }
  phantom.exit();
});