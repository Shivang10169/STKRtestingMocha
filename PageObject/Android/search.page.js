class searchPage {
    get searchBtn() { return $('//android.view.View[@content-desc=" Search"]') }
    get searchTextBox() { return $('//android.widget.EditText[@resource-id="term"]') }
    get searchTextBtn() { return $('//android.widget.Button[@resource-id="searchVisitsButton"]') }
    get searchNotFoundVisitMessage() { return $('//android.view.View[@resource-id="VisitNotFoundMessage"]') }
    get homePage() { return $('//android.widget.Button[@resource-id="HomePage"]') }
    get searchItemListView() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[3]/android.widget.ListView/android.view.View[1]/android.view.View') }
        //get searchTextBox() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View/android.widget.EditText') }
        //get searchTextBtn() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View/android.widget.Button') }
        //get searchNotFoundVisitMessage() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[3]/android.view.View/android.view.View') }
        //get homePage() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[1]/android.view.View/android.view.View[1]/android.widget.Button[1]') }

}

module.exports = new searchPage();
