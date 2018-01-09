var PORT = 6006;

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var mime = require('./mime').types;

var folderPath = '/Users/lixiaojuan/documents/node_server';

var server = http.createServer(function(request, response){
  var pathname = url.parse(request.url).pathname;
  var realpath = path.join(folderPath, pathname);

  var ext = path.extname(realpath);
  ext = ext ? ext.slice(1) : 'unknown';

  fs.exists(realpath, function(exists){
    if(!exists){
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      response.write('页面未找到');
      response.end();
    }else{
      fs.readFile(realpath, 'binary', function(err, file){
        if(err){
          response.writeHead(404, {
            'Content-Type': 'text/plain'
          })
          response.end(err);
        }else{
          var contentType = mime[ext];
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, 'binary');
          response.end()
        }
      })
    }
  })
})

server.listen(PORT);
console.log('start server');
