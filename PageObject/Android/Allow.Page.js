class AllowDataAccessFromSalesforce {
    //get AllowData() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View/android.view.View/android.view.View[3]/android.widget.Button[1]') }
    //get AllowAccessPage() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.RelativeLayout/android.webkit.WebView/android.webkit.WebView/android.view.View') }

    get AllowData() { return $('//android.widget.Button[@resource-id="oaapprove"]') }
    get AllowAccessPage() { return $('//android.view.View[@resource-id="wrapper"]') }
}

module.exports = new AllowDataAccessFromSalesforce();