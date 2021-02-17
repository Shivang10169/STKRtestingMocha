class StartWorkVehicleCheck {
    get finishBtn() { return $('//android.view.View[@content-desc=" Start Work"]') }
    // get finishBtnPopupOk() { return $('//android.widget.TextView[@index="0"]') }
    // get finishBtnPopupCancel() { return $('//android.widget.EditText[@index="1"]') }
    get finishBtnPopupOk() { return $('/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.ListView/android.widget.TextView[1]') }
    get finishBtnPopupCancel() { return $('/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.ListView/android.widget.TextView[2]') }
    get requiedValue() { return $('/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.webkit.WebView/android.webkit.WebView/android.view.View/android.view.View[2]/android.view.View[2]/android.view.View[3]/android.view.View[2]/android.view.View[1]/android.widget.Spinner') }
}

module.exports = new StartWorkVehicleCheck();
