var Promise = require('bluebird'),
    google  = require('googleapis'),
    OAuth2  = google.auth.OAuth2,
    fs      = require('fs')

var CLIENT_ID = process.env.CLIENT_ID
var CLIENT_SECRET = process.env.CLIENT_SECRET
var REDIRECT_URL = process.env.REDIRECT_URL
var refresh_token = process.env.refresh_token

var YouTubeAPIService = function YouTubeAPIService() {
  this.OAuth2Client = null
  this.youtube = null
}

YouTubeAPIService.prototype.initialize = function initialize(what) {
  var self = this;
  if(what==='Client'){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      self.OAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    })
  }else if(what==='Tokens'){
    self.OAuth2Client.setCredentials({
      refresh_token: refresh_token
    });
    return new Promise(function(resolve, reject){
      self.refreshAccessToken()
        .then(function(response){
          console.log(self.OAuth2Client);
          self.youtube = google.youtube({
            version: 'v3',
            auth: self.OAuth2Client
          });
          resolve('YouTube oAuth client authenticated.');
        })
        .catch(function(err){
          console.log(err);
          reject(err);
        });
    });
  }
};

YouTubeAPIService.prototype.refreshAccessToken = function refreshAccessToken(){
  var self = this;
  return new Promise(function(resolve, reject){
    self.OAuth2Client.refreshAccessToken(function(err, tokens){
      if(err){
        //do something with the error
        console.log(err);
        return reject('error in authenticating YouTube oAuth client.');
      }
      resolve(tokens);
    });
  });
};

YouTubeAPIService.prototype.generateAuthURL = function generateAuthURL(){
  var self = this;
  var url = self.OAuth2Client.generateAuthURL({
    access_type: 'offline',
    scope: 'https://gdata.youtube.com'
  });
  return url;
};

YouTubeAPIService.prototype.getToken = function getToken(code){
  var self = this;
  self.OAuth2Client.getToken(code, function(err, tokens){
    console.log(tokens);
  });
};

module.exports = YouTubeAPIService
