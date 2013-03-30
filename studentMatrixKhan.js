/**
 * Adds a custom menu to the active spreadsheet on opening the spreadsheet.
 */
function onOpen() {
  var menuEntries = [];
  menuEntries.push({name : "TMP", functionName : "tmp"});
  SpreadsheetApp.getActiveSpreadsheet().addMenu("Khan stuff", menuEntries);
};

/**
 * Temporary stuff, for executing code easily while developing.
 */
function tmp() {
  var oAuthConfig = UrlFetchApp.addOAuthService("khanacademy");
  oAuthConfig.setConsumerKey("key1");
  oAuthConfig.setConsumerSecret("key2");
  oAuthConfig.setRequestTokenUrl("http://www.khanacademy.org/api/auth/request_token");
//  oAuthConfig.setAuthorizationUrl("http://www.khanacademy.org/api/auth/access_token"); // I have't found any URL for authorization at Khan.
  oAuthConfig.setAccessTokenUrl("http://www.khanacademy.org/api/auth/access_token");

  // Setup optional parameters to point request at OAuthConfigService. The "khanacademy"
  // value matches the argument to "addOAuthService" above.
  var options =
    {
      "oAuthServiceName" : "khanacademy",
      "oAuthUseToken" : "always",
    };

  try {
//    var result = UrlFetchApp.getRequest("http://www.khanacademy.org/api/v1/playlists"); // I've tried to access things that doesn't require authorization, also with no success.
    var result = UrlFetchApp.fetch("http://www.khanacademy.org/api/v1/playlists", options);
    Browser.msgBox(result);
//    var output  = Utilities.jsonParse(result.getContentText());
//    Browser.msgBox(output);
  }
  catch (err) {
    Browser.msgBox(err);
  }
}
