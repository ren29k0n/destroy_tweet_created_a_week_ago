var CONSUMER_KEY = 'XXXXXXXXX'; //TWITTER_CONSUMER_KEY;
var CONSUMER_SECRET = 'XXXXXXXXX'; //TWITTER_CONSUMER_SECRET;
var SCREEM_NAME = 'XXXXXXXXX'; //TWITTER_SCREEN_NAME;

var twitter = TwitterWebService.getInstance(CONSUMER_KEY,CONSUMER_SECRET);

function authorize() {
  twitter.authorize();
}

function authCallback(request) {
  return twitter.authCallback(request);
}

function postDestroyStatus() {
  var service  = twitter.getService();
  //自身のツイートの情報を取得
  var tweetData = JSON.parse(service.fetch("https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=" + SCREEM_NAME));

  //７日前までの投稿のみ削除するよう期日を設定
  var deadLine = new Date();
  deadLine.setDate( deadLine.getDate() - 7);

  var destroyTweetId = [];

  for(var i=0; i<tweetData.length; i++){
    if(new Date(tweetData[i].created_at) <= deadLine){
      destroyTweetId.push(tweetData[i].id_str);
    }
  }

  for(var i=0; i<destroyTweetId.length; i++){
    var destroy = service.fetch("https://api.twitter.com/1.1/statuses/destroy/" + destroyTweetId[i] + ".json",{
      method: "post"
   });
  }
}