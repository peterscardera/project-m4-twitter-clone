/**
  Endpoints related to feeds (ordered sets of tweets)
*/
const lodash = require('lodash');
const router = require('express').Router();
var cors = require('cors')

const data = require('../data');

var corsOptions = {
  origin: 'https://twitterclone-bc.firebaseapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const {
  CURRENT_USER_HANDLE,
  getUser,
  getUserProfile,
  getTweetsFromUser,
  getTweetsForUser,
  simulateProblems,
  resolveRetweet,
  denormalizeTweet,
} = require('./routes.helpers.js');

const formatTweetResponse = tweets => {
  const tweetIds = lodash
    .sortBy(tweets, 'sortedTimestamp')
    .reverse()
    .map(tweet => tweet.id);

  const tweetsById = tweets.reduce((acc, tweet) => {
    acc[tweet.id] = { ...tweet };

    // Clients don't need to know about this.
    delete acc[tweet.id].sortedTimestamp;

    return acc;
  }, {});

  return { tweetsById, tweetIds };
};

router.get('/api/me/home-feed', cors(corsOptions),(req, res) => {
  const relevantTweets = getTweetsForUser(CURRENT_USER_HANDLE);

  const { tweetsById, tweetIds } = formatTweetResponse(relevantTweets);

  return simulateProblems(res, {
    tweetsById,
    tweetIds,
  });
});

router.get('/api/:handle/feed',cors(corsOptions), (req, res) => {
  const { handle } = req.params;

  const tweets = getTweetsFromUser(handle);

  const { tweetsById, tweetIds } = formatTweetResponse(tweets);

  return res.json({
    tweetsById,
    tweetIds,
  });
});

module.exports = router;
