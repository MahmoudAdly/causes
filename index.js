var restify = require('restify');
const fs = require('fs');
var request = require('request');

function download(url, filename, callback) {
    var photoStream = fs.createWriteStream(filename);
    var r = request(url).pipe(photoStream);
    r.on('close', function() {
      return callback(null)
    });
    r.on('error', function() {
      return callback(error)
    });
}

function getFbPicUrl(id, callback) {
  apiUrl = 'http://graph.facebook.com/v2.5/' + id
    + '/picture?height=500&redirect=false';

  request(apiUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var body = JSON.parse(body);
      return callback(null, body.data.url);
    } else {
      return callback(body);
    }
  });
}
var server = restify.createServer();

server.get('/', function (req, res, next) {
  fs.readFile(__dirname + '/public/index.html', function (err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(data);
    next();
  });
});

server.get('/fbpic/:id', function (req, res, next) {
  var id = req.params.id;

  var picUrl = getFbPicUrl(id, function(error, url) {
    if(error) {
      res.send({ error: error, data: error });
      next();
    } else {
      var filename = __dirname + '/public/photos/' + id + '.jpg';
      download(url, filename, function(error) {
        if(error) res.send(error);
        else res.send('photo downloaded');
        next();
      });
    }

  });
});

// server.get('/', function (req, res, next) {
//   res.send('hello');
//   next();
// });

server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
