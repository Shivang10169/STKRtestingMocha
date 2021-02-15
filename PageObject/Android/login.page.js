class LoginPage {
    /**
     * Define Elements
     */
    get userNameFieldUsingId() {return $('~username');} //using accessiblity Id not just id
    // using classname and id resourceid and id should be same, android.widget.EditText is class
    get usernameFieldUsingResourceId() { return $('//android.widget.EditText[@resource-id="username"]')}
    // using index attributes and class
    get usernameFieldUsingIndex() { return $('//android.widget.EditText[@index="0"]')}

    get userNameField() {return $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]/android.view.View[1]/android.view.View[2]/android.widget.EditText");}
    get passwordField() {return $('//android.widget.EditText[@resource-id="password"]');}
    get loginButton() {return $('//android.widget.Button[@resource-id="Login"]');}
    get rememberMe()  {return $('//android.widget.CheckBox[@resource-id="rememberUn"]');}
    get forgotPasswordLink() {return $('//android.view.View[@content-desc="Forgot Your Password?"]/android.widget.TextView');}
    get forgotPasswordPage() {return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View[1]/android.view.View/android.view.View[2]');}
    get vfCodeScreen(){ return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View[1]/android.view.View/android.view.View[2]');}
    get homePage(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[1]/android.view.View/android.view.View[1]/android.widget.Button[1]')}
}

  module.exports = new LoginPage();
  
