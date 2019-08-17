#概要
投稿して１週間以上経過したツイートを自動で削除してくれるスクリプトです。
過去ツイートの炎上防止などの用途での使用を想定しています。

##事前準備

事前に[Twitter Application Management ](https://developer.twitter.com/en/application/)で開発者申請を行う必要があります。
参考：[Twitter API 登録 (アカウント申請方法) から承認されるまでの手順まとめ　※2019年8月時点の情報](https://qiita.com/kngsym2018/items/2524d21455aac111cdee)

##Twitter APIの設定

承認が降りたら再度[Twitter Application Management ](https://developer.twitter.com/en/application/)にアクセスし、APIキーを取得します。
`Callback URL`には`https://script.google.com/macros/d/{作成するアプリのスクリプトID}/usercallback`を設定します。
以前は適当に埋めていれば問題なかったようですが、仕様が変更され正しいURLでないと認証が通らなくなっています。
`スクリプトID`はスクリプトエディタの`ファイル\プロジェクトのプロパティ`で確認できます。

![1.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147205/a6310acb-ca5f-427a-735b-99e8fc0357d0.jpeg)

取得したAPIキーは同じページの`Keys and tokens`にて確認できます。
APIキーは後ほど実装時に使用します。

<img width="863" alt="2.jpg" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147205/0e38226c-4383-4807-e040-f6858220e60e.jpeg">


##ライブラリをインストールする

今回は[TwitterWebService](https://gist.github.com/M-Igashi/750ab08718687d11bff6322b8d6f5d90) というライブラリを使用します。
`リソース\ライブラリ…`にて、プロジェクトキー`1rgo8rXsxi1DxI_5Xgo_t3irTw1Y5cxl2mGSkbozKsSXf2E_KBBPC3xTF`を入力して追加します。

#実装

以下のようなスクリプトを用意します。
先ほど確認した`API key`、`API secret key`を`CONSUMER_KEY`、`CONSUMER_SECRET`に指定します。
また、`SCREEM_NAME`に`自身のTwitterアカウントID`を指定します。

```
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
```
##Twitterの認証を行う

スクリプトエディタの`関数を選択`から`authorize`を選択し実行します。
`表示\ログ`にURLが出力されるので、コピーしてアクセスします。
![3.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147205/e13146aa-dee5-f4e9-e130-1c742982e754.jpeg)

「連携アプリを認証」を押します。
![4.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147205/3c62971a-2f31-5c77-5148-31b9d270b5ac.jpeg)

##トリガーを設定する

スクリプトエディタのメニューにある時計アイコンからトリガーの指定を行います。
今回は毎日日付が変わったタイミングで削除したかったため、以下のように指定します。
![5.jpg](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/147205/f2878d60-7ac9-e6d7-a9a0-6f49a9ca420d.jpeg)

参考：[Google Apps Scriptでトリガーを設定する方法](https://reasonable-code.com/gas-trigger/)

###注意点

- `user_timeline`の仕様上、最新の3200件のツイート情報のみしか取得できないため、１回の実行でそれ以上のツイートを削除することはできません。
- `deadline`を変更することで削除する範囲を変更できますが、期間中のツイートが3200件以上あった場合、削除されません。(`deadline`を１年前とした場合、1年に3200件以上ツイートしていると１件も削除されない)

参考：[GET statuses/user_timeline](https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline)

##参考記事まとめ
- [Twitter API 登録 (アカウント申請方法) から承認されるまでの手順まとめ　※2019年8月時点の情報](https://qiita.com/kngsym2018/items/2524d21455aac111cdee)
- [[GAS] GoogleAppsScriptでTwitterbotを作る](https://qiita.com/k7a/items/e6a456bec26b4e667c47)
- [RubyによるTwitter全ツイート削除](https://tamosblog.wordpress.com/2017/04/07/remove_all_tweets/)
- [Google Apps Scriptでトリガーを設定する方法](https://reasonable-code.com/gas-trigger/)
- [GET statuses/user_timeline](https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline)
- [POST statuses/destroy/:id](https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/post-statuses-destroy-id)
