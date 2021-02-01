class LoginPage {
    /**
     * Define Elements
     */
    get userNameField() {return $("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]/android.view.View[1]/android.view.View[2]/android.widget.EditText");}
    get passwordField() {return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]/android.widget.EditText');}
    get loginButton() {return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]/android.widget.Button');}
    get rememberMe()  {return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]/android.view.View[3]/android.widget.CheckBox');}
    get forgotPasswordLink() {return $('//android.view.View[@content-desc="Forgot Your Password?"]/android.widget.TextView');}

    get forgotPasswordPage() {return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View[1]/android.view.View/android.view.View[2]');}
    get vfCodeScreen(){ return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View[1]/android.view.View/android.view.View[2]');}
    get AllowData(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View/android.view.View[3]/android.widget.Button[1]')}
    get AllowAccessPage(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View')}
    get refreshAlldataPage(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View[2]')}
    
    get searchBtn(){return $('//android.view.View[@content-desc=" Search"]')}
    get searchTextBox(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View/android.widget.EditText')}
    get searchTextBtn(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View/android.widget.Button')}
    get searchItemListView(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[3]/android.widget.ListView/android.view.View[1]/android.view.View')}
    get searchNotFoundVisitMessage(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[3]/android.view.View/android.view.View')}
    get homePage(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[1]/android.view.View/android.view.View[1]/android.widget.Button[1]')}
    // #endregion
    get finishBtn(){return $('//android.view.View[@content-desc=" Start Work"]')}
    get finishBtnPopupOk(){return $('/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.ListView/android.widget.TextView[1]')}
    get finishBtnPopupCancel(){return $('/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.ListView/android.widget.TextView[2]')}
    get requiedValue(){return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View[3]/android.view.View[2]/android.view.View[1]/android.widget.Spinner')}
    // get createVehicle(){return $('')}
  }
  module.exports = new LoginPage();
  
