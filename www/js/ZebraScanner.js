// Install this plugin
// com-darryncampbell-cordova-plugin-intent@1.3.0
var Scanner_IntentAction = "com.ServiceTracker.ACTION";
var Scanner_ProfileName = "ServiceTracker";
var ServiceTracker_PackageName = "com.telerik.ServiceTracker";
var isZebraDevice = false;


function createProfile() {
    //DataWedge profile details
    var profileConfig = {
        "PROFILE_NAME": Scanner_ProfileName,
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "CREATE_IF_NOT_EXIST",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "false",
            "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": Scanner_IntentAction,
                "intent_delivery": 2
            }
        },
        "APP_LIST": [{
            "PACKAGE_NAME": ServiceTracker_PackageName,
            "ACTIVITY_LIST": ["*"]
        }]
    };

    //Broadcast the action to create the profile
    sendBroadcast('com.symbol.datawedge.api.SET_CONFIG', profileConfig)
}

function registerBroadcastReceiver() {
    // Register a broadcast receiver to receive scanned barcodes
    window.plugins.intentShim.registerBroadcastReceiver({
        filterActions: [
            Scanner_IntentAction, //  Scans
            'com.symbol.datawedge.api.RESULT_ACTION' //  Messages from service
        ],
        filterCategories: [
            'com.android.intent.category.DEFAULT'
        ]
    }, function (intent) {
        //  Broadcast received
        isZebraDevice = true;
        if (intent.extras["com.symbol.datawedge.data_string"] != null) {
            console.log("Scan: " + intent.extras["com.symbol.datawedge.data_string"]);
            CheckCurrentPageAndNavigate(intent.extras["com.symbol.datawedge.data_string"]);
        } else {
            alert("Not able to scan the barcode.");
        }

        // if (intent.extras.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
        // }
    });
}

function sendBroadcast(extraName, extraValue) {
    window.plugins.intentShim.sendBroadcast({
        action: 'com.symbol.datawedge.api.ACTION',
        extras: {
            [extraName]: extraValue
        }
    }, function (a) {
        console.log("%c a:", "background-color:green;color:white;", a);
    }, function (b) {
        console.log("%c b:", "background-color:red;color:white;", b);
    });
}


function CheckCurrentPageAndNavigate(dataString) {
    //Check if current page is visit detail then navigate to inspection page 
    var FoundBarcode = false;
    if((location.href.toLocaleLowerCase().indexOf('visitdetail.html') != -1 || location.href.toLocaleLowerCase().indexOf('inspection.html') != -1) && isCurrentVisitInProgress){
        console.log('true');
   // alert('Scanned Data : ' + dataString);
    for (var i = 0; i < InspectionItemData.length; i++) {
        if (InspectionItemData[i]['STKR__Bar_Code_Number__c'] == dataString) {
            for (var j = 0; j < InspectionData.length; j++) {
                if (InspectionData[j]['STKR__Visit__c'] === ParamVisitId && InspectionData[j]['STKR__Service_Item__c'] === InspectionItemData[i]['Id']) {
                    FoundBarcode = true;
                    app.navigate("view/InspectionDetailPage.html?inspectionid=" + InspectionData[j]['Id'] + "&inspectionitemid=" + InspectionItemData[i]['Id']);
                    break;
                } else if (j === InspectionData.length - 1) {
                    app.toastMessage('Service Tracker Could not find inspection item for barcode:' + dataString, 'long');
                }
            }
            break;
        }
    }
    if (!FoundBarcode) {
        app.toastMessage('Result is not match with the Inspection Item', 'long')
    }
  }

}