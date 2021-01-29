(function (root) {
    /**
     * ForceOAuth constructor
     *
     * @param loginURL string Login url, typically it is: https://login.salesforce.com/
     * @param consumerKey string Consumer Key from Setup | Develop | Remote Access
     * @param callbackURL string Callback URL from Setup | Develop | Remote Access
     * @param successCallback function Function that will be called on successful login, it accepts single argument with forcetk.Client instance
     * @param errorCallback function Function that will be called when login process fails, it accepts single argument with error object
     *
     * @constructor
     */
    root.ForceOAuth = function (loginURL, consumerKey, callbackURL, successCallback, errorCallback, proxyUrl) {
        if (typeof loginURL !== 'string')
            throw new TypeError('loginURL should be of type String');
        this.loginURL = loginURL;

        if (typeof consumerKey !== 'string')
            throw new TypeError('consumerKey should be of type String');
        this.consumerKey = consumerKey;

        if (typeof callbackURL !== 'string')
            throw new TypeError('callbackURL should be of type String');
        this.callbackURL = callbackURL;

        if (typeof successCallback !== 'function')
            throw new TypeError('successCallback should of type Function');
        this.successCallback = successCallback;

        if (typeof errorCallback !== 'undefined' && typeof errorCallback !== 'function')
            throw new TypeError('errorCallback should of type Function');
        this.errorCallback = errorCallback;
    };
    var interval;
    root.ForceOAuth.prototype = {

        /**
         * Starts OAuth login process.
         */
        login: function login() {
            var that = this;

            var winHeight = 524,
                winWidth = 674,
                centeredY = window.screenY + (window.outerHeight / 2 - winHeight / 2),
                centeredX = window.screenX + (window.outerWidth / 2 - winWidth / 2);

            var authUrl = that.loginURL + 'services/oauth2/authorize?'
                + '&response_type=token&client_id=' + encodeURIComponent(that.consumerKey)
                + '&redirect_uri=' + encodeURIComponent(that.callbackURL);
            var loginWindow = window.open(authUrl, '_blank', 'location=no');
            var loc;
            loginWindow.addEventListener('loadstart', function (e) {
                loc = e.url;
                //LOG && console.log(e.url);
                //LOG && console.log('callbackURL', that.callbackURL);
            });
            loginWindow.addEventListener('loadstop', function (e) {
                loc = e.url;
            });
            if (loginWindow) {
                // Creating an interval to detect popup window location change event
                interval = setInterval(function () {
                    if (loginWindow.closed) {
                        // Clearing interval if popup was closed
                        clearInterval(interval);
                    } else {
                        if (typeof loc !== 'undefined' && loc.indexOf(that.callbackURL) == 0) {
                            loginWindow.close();
                            clearInterval(interval);
                            that.oauthCallback('#' + loc.split('#')[1]);
                        }
                    }
                }, 250);
            }
        },

        logout: function logout(logoutCallback) {
        },

        oauthCallback: function oauthCallback(locHash) {
            var fragment = (locHash || window.location.hash).split("#")[1];
            this.oauthResponse = {};

            if (fragment) {
                this.oauthResponse['response'] = fragment;
                var nvps = fragment.split('&');
                for (var nvp in nvps) {
                    if (nvps.hasOwnProperty(nvp)) {
                        var parts = nvps[nvp].split('=');

                        //Note some of the values like refresh_token might have '=' inside them
                        //so pop the key(first item in parts) and then join the rest of the parts with =
                        var key = parts.shift();
                        var val = parts.join('=');
                        this.oauthResponse[key] = decodeURIComponent(val);
                    }
                }
            }

            if (typeof this.oauthResponse.access_token === 'undefined') {
                if (this.errorCallback)
                    this.errorCallback({ code: 0, message: 'Unauthorized - no OAuth response!' });
                else
                    LOG && console.log('ERROR: No OAuth response!')
            } else {
                if (this.successCallback) {
                    this.successCallback(this.oauthResponse);
                    window.location.hash = "";
                } else {
                    LOG && console.log('INFO: OAuth login successful!')
                }
            }
        }
    };
})(this);