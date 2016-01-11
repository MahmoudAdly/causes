var restify = require('restify');
var fs = require('fs');
var request = require('request');
var Jimp = require('jimp');

const templates = [
  {
    id: 1,
    title: 'Flickr',
    photo: '/public/templates/flickr-thumb.jpg',
    thumb: '/public/templates/flickr-thumb.jpg'
  },
  {
    id: 2,
    title: 'Facebook',
    photo: '/public/templates/facebook-thumb.png',
    thumb: '/public/templates/facebook-thumb.png'
  },
  {
    id: 3,
    title: 'Confederate',
    photo: '/public/templates/confederate.png',
    thumb: '/public/templates/confederate.png'
  }
];

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

function calculateMaxSquare(w, h, callback) {
  var s = (w > h ? h : w);
  var x = (s == w ? 0 : (w - s)/2);
  var y = (s == h ? 0 : (h - s)/2);

  return callback(null, { x: x, y: y, w: s, h: s });
}

function mergePhotos(bottomPhotoPath, topPhotoPath, outputPath, callback) {
  // Read bottom photo and crop it.
  Jimp.read(bottomPhotoPath, function (err, bottomImage) {
    if (err) return callback(err);

    // Calculate maximum square size of bottom photo with x,y,w,h.
    calculateMaxSquare(
      bottomImage.bitmap.width, bottomImage.bitmap.height,
      function(error, dimensions) {

      bottomImage.crop(dimensions.x, dimensions.y, dimensions.w, dimensions.h);

      // Read the top photo and resize it.
      Jimp.read(topPhotoPath, function (err, topImage) {
        if (err) return callback(err);
        topImage.resize(dimensions.w, dimensions.h);

        // Draw the two photos over each other.
        bottomImage.composite(topImage, 0, 0);

        // Write new image into a file.
        bottomImage.write(outputPath, function(error) {
          // NOTE: do NOT return data from write callback. It is HUGE.
          if(error) return callback(error);
          return callback(null, outputPath);
        });
      });
    });
  });
}

var server = restify.createServer();

server.get('/', function (req, res, next) {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end('Under construction. For now, please visit '
    + '<a href="/causes">Causes page</a>');
  next();
});

server.get('/causes', function (req, res, next) {
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

server.get('/causes/templates/all', function (req, res, next) {
  res.send({
    data: templates
  });
  next();
});

server.post('/causes/templates/:templateId/fbId/:fbId', function (req, res, next) {
  var fbId = req.params.fbId;
  var originalFilename = __dirname + '/public/photos/' + fbId + '.jpg';
  var templateId = req.params.templateId;
  var templateFilename = __dirname + templates[templateId-1].photo;
  var outputFilenameBase = '/public/photos/' + fbId + '-' + templateId + '.jpg';
  var outputFilename = __dirname + outputFilenameBase

  // Get Facebook profile picture url. Dimensions are returned too.
  getFbPicUrl(fbId, function(error, url) {
    if(error) {
      res.send({ error: error });
      next();
    } else {
      // Download profile picture.
      download(url, originalFilename, function(error) {
        if(error) {
          res.send({ error: error });
          next();
        } else {
          // Plot the template over the profile picture.
          mergePhotos(originalFilename, templateFilename, outputFilename,
            function(error, outputPath) {

            if(error) res.send({error: error});
            else
              res.send({
                data: {
                  url: outputFilenameBase
                }
              });
            next();
          });
        }
      });
    }

  });
});

// server.get('/', function (req, res, next) {
//   res.send('hello');
//   next();
// });

server.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}));

server.listen(8090, function() {
  console.log('%s listening at %s', server.name, server.url);
});
