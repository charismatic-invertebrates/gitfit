// API Handler
//_____________
//
// The API Handler is a collection of promises that can be called from elsewhere to simplify code readability.

var Q = require('q');
var deferredRequest = Q.nfbind(require('request'));
var assignRequestParams = require('./requestParameters.js');

module.exports = {

  // Takes in a userAccount, exchanges the provider codes in the account object for their respective tokens.
  getTokens: function(userAccount) {
    // Get Github token from code
    var githubTokenParams = assignRequestParams('github', 'getToken', userAccount.github.code);

    return deferredRequest(githubTokenParams)
      // Save token to userAccount
      .then(function(response){
        userAccount.github.accessToken = response[1].access_token;
      })
      // If there is a Fitness Provider, get its token from code
      .then(function(){
        if( userAccount.fitness ) {
        var fitnessParams = assignRequestParams(userAccount.fitness.provider, 'getToken', userAccount.fitness.code);
        return deferredRequest(fitnessParams)
          // Save Fitness token to userAccount
          .then(function(response) {
            userAccount.fitness.accessToken = JSON.parse(response[1]).access_token;
            return userAccount;
          });
        }
      })
      .fail(function(error) {
        console.error('Error in apiHandler.getTokens, token exchange failed: ', error);
      });
  },

  getGithubUser: function(userAccount) {
    var githubUserParams = assignRequestParams('github', 'getUser', userAccount.github.accessToken);
    return deferredRequest(githubUserParams)
    // Store Github User information
      .then(function(response) {
        var githubUser = JSON.parse(response[1]);
        userAccount.github.user = {
          id: githubUser.id,
          reposUrl: githubUser.repos_url,
          username: githubUser.login,
          commitDates: [],
          commitCounts: []
        };
        return userAccount;
      });
  },

  getGithubData: function(userAccount) {

    var githubRepoParams = assignRequestParams('github', 'repos', userAccount.github);

    // Get Github Repo information
    return deferredRequest(githubRepoParams)
    
      // Extract individual repo names and store:
      .then(function(response){
        var repos = JSON.parse(response[1]);
        var repoList = [];
        repos.forEach(function(repo) {
          repoList.push(repo.name);
        });
        userAccount.github.repos = repoList;
      })
      // Extract commit information by repo and store on userAccount:
      .then(function() {
        var commitCountDates = {};
        var repoUrlsToCall = userAccount.github.repos.map(function(repo) {
          return assignRequestParams('github', 'commits-weekly', userAccount, repo);
        });
        return Q.all(repoUrlsToCall.map(function(callParam) {
          return deferredRequest(callParam);
        }))
          .then(function(results) {
            return results.forEach(function(response) {
              var commits = JSON.parse(response[1]);
              console.log(Array.isArray(commits));
              if( Array.isArray(commits) ) { 
                commits.forEach(function(commitInfo){
                  var commitDateInfo = new Date(commitInfo.commit.committer.date);
                  var commitDate = (commitDateInfo.getYear() + 1900) + '-' + (commitDateInfo.getMonth() + 1) + '-' + commitDateInfo.getDate();
                  commitCountDates[commitDate] = commitCountDates[commitDate] + 1 || 1;
                });
              }
            });
          })
          .then(function() {
            Object.keys(commitCountDates).forEach(function(key) {
              userAccount.github.user.commitDates.push(key);
              userAccount.github.user.commitCounts.push(commitCountDates[key]);
            });
            return userAccount;
          });
      })

      .fail(function(error) {
        console.error('Error in apiHandler.getGithubData, failed to get Github data: ', error);
      });
  },

  getFitnessData: function(userAccount) {
    var fitnessStepsParams = assignRequestParams(userAccount.fitness.provider, 'steps', userAccount.fitness.accessToken);
    userAccount.fitness.stepDates = [];
    userAccount.fitness.stepCounts = [];

    return deferredRequest(fitnessStepsParams)
      // Get and process data
      .then(function(response) {
        var jawboneMoves = JSON.parse(response[1]).data.items;
        if( Array.isArray(jawboneMoves) ) {
          jawboneMoves.forEach(function(moveData) {
            var date = moveData.date.toString();
            date = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            userAccount.fitness.stepDates.push(date);
            userAccount.fitness.stepCounts.push(moveData.details.steps);
          });
        }
        return userAccount;
      })

      .fail(function(error) {
        console.error('Error in apiHandler.getFitnessData, failed to get steps: ', error);
      });
  }

};
