var BillingRecords = [], PricebookEntries = [], BillingMetadata, BillingRecordtype;
var NewVisitOverdue_OldestSort = [];

function CheckInternetConnection() {
    if (navigator.onLine) {
        var networkState = navigator.connection.type;
        if (networkState === 'wifi' || networkState === '3g' || networkState === '4g' || networkState === "cellular") {
            AppIsOnline = true;
            //isAppStartedInOfflineMode = false;
            if (DataFromCredentialTable.rows.length === 1) {
                InitializeAllConnection(null, true);
                // Set Cookies in the InAppABrowser
                var loginWindowCookie = window.open(creds.instanceUrl + "/secur/frontdoor.jsp?sid=" + creds.accessToken, '_blank', 'hidden=yes');

                loginWindowCookie.addEventListener('loadstop', function (e) {
                    loginWindowCookie.close();
                });
            } else if (DataFromCredentialTable.rows.length <= 0) {
                Login();
            } else {
                app.toastMessage('More than one user found', 'long');
            }
        } else {
            AppIsOnline = false;
            //isAppStartedInOfflineMode = true;
            app.toastMessage('Slower Connection', 'long');
            if (DataFromCredentialTable.rows.length > 0) {
                app.navigate('view/LoadAllDataOffline.html');
            } else {
                app.toastMessage('No user data found', 'long');
            }
        }
    } else {
        //isAppStartedInOfflineMode = true;
        AppIsOnline = false;

        if (DataFromCredentialTable.rows.length > 0) {
            app.navigate('view/LoadAllDataOffline.html');
        } else {
            app.toastMessage('No user data found, Please Login', 'long');
        }
    }
}
// Events for resize
window.addEventListener("resize", CheckKeyboard);
function CheckKeyboard() {
    //keyboard
    if ((PhoneHeight > window.innerHeight)) {
        //$('footer').hide(); 
        $("div[data-role=footer]").hide();
    } else {
    }
    if (PhoneHeight === window.innerHeight) {
        // $('footer').show();
        $("div[data-role=footer]").show();
    }
}
//Event for Orientation change
/*window.addEventListener('orientationchange', CheckOrientation);
function CheckOrientation() {
PhoneHeight = window.innerHeight;
PhoneWidth = window.innerWidth;
CheckKeyboard();
}*/

function b64toBlob(b64Data, contentType, sliceSize) {
    //LOG && console.log('b64toBlob', b64Data, contentType, sliceSize);
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    //.split("data:image/jpeg;base64,")[1]
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function base64ToThumbnail(base64, fileName, VisitId, isSignature, VisitName) {

    if (device.platform === 'Android') {
        window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dir) {
            dir.getDirectory('ServiceTracker/', { create: true, exclusive: false }, function (dirEntry1) {
                dirEntry1.getDirectory(VisitName, { create: true, exclusive: false }, function (dirEntry2) {
                    dirEntry2.getFile(VisitId + fileName, { create: true }, function (file) {
                        file.createWriter(function (writer) {
                            writer.onwrite = function (evt) {
                                // Update variables and database ... 
                                app.db.transaction(function (tx) {
                                    tx.executeSql("SELECT jsondata FROM Visits WHERE visitid=?", [VisitId], function (t, res) {
                                        var detailvalue = JSON.parse(res.rows.item(0)['jsondata']);
                                        //LOG && console.log('Signature detailvalue Value', detailvalue);
                                        if (detailvalue['AttachmentThumbnail'] === undefined) {
                                            detailvalue['AttachmentThumbnail'] = {};
                                        }
                                        if (detailvalue['AttachmentThumbnail']['OfflineUrls'] === undefined) {
                                            detailvalue['AttachmentThumbnail']['OfflineUrls'] = []
                                        }
                                        if (detailvalue['AttachmentThumbnail']['OfflineUrls'].indexOf(file.nativeURL) === -1)
                                            detailvalue['AttachmentThumbnail']['OfflineUrls'].push(file.nativeURL);

                                        //app.db.transaction(function(tx){
                                        // Insert to Visits table..
                                        tx.executeSql('INSERT OR REPLACE INTO Visits (id,jsondata,updated,userid,visitid) VALUES ((select id from Visits where visitid = "' + VisitId + '"),?,?,?,?)',
                                            [JSON.stringify(detailvalue), false, creds.UserID, VisitId],
                                            function () {
                                                $('#VisitDetail_Thumbnail_Local').html('');
                                                ShowLocalThumbnail();
                                            }, function (err) {
                                                console.error('err' + err);
                                            });
                                        //});
                                    }, function (err) {
                                        console.error('eerr', err);
                                    });
                                });
                            };
                            if (isSignature)
                                writer.write(b64toBlob(base64, "image/jpeg"));
                            else {
                                fetchBase64(base64, function (iData) {
                                    writer.write(b64toBlob(iData, "image/jpeg"));
                                }, "image/jpeg")
                            }
                        });
                    });
                }, function (err) { console.error(err); });
            }, function (err) { console.error(err); });

        });
    } else if (device.platform === 'iOS') {
        window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, function (dir) {
            dir.getFile(VisitId + fileName, { create: true }, function (file) {
                file.createWriter(function (writer) {
                    writer.onwrite = function (evt) {
                        //LOG && console.log('newDetailValue on function.js', newDetailValue[0]);
                        // Update variables and database ... 
                        app.db.transaction(function (tx) {
                            tx.executeSql("SELECT jsondata FROM Visits WHERE visitid=?", [VisitId], function (t, res) {
                                var detailvalue = JSON.parse(res.rows.item(0)['jsondata']);
                                //LOG && console.log('Signature detailvalue Value', detailvalue);
                                if (detailvalue['AttachmentThumbnail'] === undefined) {
                                    detailvalue['AttachmentThumbnail'] = {};
                                }
                                if (detailvalue['AttachmentThumbnail']['OfflineUrls'] === undefined) {
                                    detailvalue['AttachmentThumbnail']['OfflineUrls'] = []
                                }
                                if (detailvalue['AttachmentThumbnail']['OfflineUrls'].indexOf(file.nativeURL) === -1)
                                    detailvalue['AttachmentThumbnail']['OfflineUrls'].push(file.nativeURL);

                                //app.db.transaction(function(tx){
                                // Insert to Visits table..
                                tx.executeSql('INSERT OR REPLACE INTO Visits (id,jsondata,updated,userid,visitid) VALUES ((select id from Visits where visitid = "' + VisitId + '"),?,?,?,?)',
                                    [JSON.stringify(detailvalue), false, creds.UserID, VisitId],
                                    function () {
                                        $('#VisitDetail_Thumbnail_Local').html('');
                                        ShowLocalThumbnail(VisitId);
                                    }, function (err) {
                                        console.error('err' + err);
                                    });
                                //});
                            }, function (err) {
                                console.error('eerr', err);
                            });
                        });
                    }
                    try {
                        if (isSignature)
                            writer.write(b64toBlob(base64, "image/jpeg"));
                        else {
                            fetchBase64(base64, function (iData) {
                                writer.write(b64toBlob(iData, "image/jpeg"));
                            }, "image/jpeg")
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            });
        });
    }
}

function Login() {
    navigator.splashscreen.hide();
    if (device.platform === 'iOS') {
        consumerKey = "3MVG99qusVZJwhsmpFBHZEzbpThQkW1_Vq8W9RnyVzQxlhcdbYp2svQxncQyI1huaMjwg11mEwf2mZ3OiUrBK";
        ConsumerSecret = "7173060251584626205";
    } else {
        consumerKey = "3MVG99qusVZJwhsmpFBHZEzbpTlF9ZKt0.1tkL7Oh6uIVUXu.sctSo_ONlJrVzkJb2YmstgJoK0cYwmviNwjM";
        ConsumerSecret = "6986285610977870398";
    }
    oauthClient = new ForceOAuth(loginUrl, consumerKey, callbackUrl,
        function forceOAuthUI_successHandler(forcetkClient) {
            InitializeAllConnection(oauthClient, false);
        },
        function forceOAuthUI_errorHandler(error) {
            // errorCallback
            if (confirm("Authentication Failed. Try again?"))
                oauthClient.login();
        });
    oauthClient.login();
}

function InitializeAllConnection(oauthClient, UserExists) {
    if (UserExists) {
        // Initialize jsforce
        jsconn = new jsforce.Connection({
            oauth2: {
                clientId: consumerKey,
                clientSecret: ConsumerSecret,
                redirectUri: callbackUrl
            },
            instanceUrl: creds.instanceUrl,
            accessToken: creds.accessToken,
            refreshToken: creds.refresh_token
        });
        jsconn.on("refresh", function (accessToken, res) {
            try {
                oauthClient.oauthResponse.refresh_token = accessToken;
            } catch (e) {
                console.error(e)
            }
            AppIsOnline = true;
            //isAppStartedInOfflineMode = false;
            creds.accessToken = accessToken;

            // Set the seesion on the webview browser
            var loginWindowCookie = window.open(creds.instanceUrl + "/secur/frontdoor.jsp?sid=" + creds.accessToken, '_blank', 'hidden=yes');

            loginWindowCookie.addEventListener('loadstop', function (e) {
                loginWindowCookie.close();
            });
            //END
            // Update Credential Table
            app.db.transaction(function (tx) {
                tx.executeSql("UPDATE Credential SET accesstoken = ? WHERE id = ?", [accessToken, 1],
                    function () {
                    },
                    function (err) {
                        console.error(' 1. Error in updating Credential Table', err);
                    });
            });
            // ReInitialize forcetk
            ForcetkClient = new forcetk.Client(consumerKey, loginUrl, null, null);
            ForcetkClient.setSessionToken(creds.accessToken, "v33.0", creds.instanceUrl);
            ForcetkClient.setRefreshToken(creds.refresh_token);
            var patchUserAgent = function (userAgent) {
                var match = /^(SalesforceMobileSDK\/[^\ ]* [^\/]*\/[^\ ]* \([^\)]*\) [^\/]*\/[^ ]* )(Hybrid|Web)(.*$)/.exec(userAgent);
                if (match != null && match.length == 4) {
                    return match[1] + match[2] + "SmartSync" + match[3];
                } else {
                    // Not a SalesforceMobileSDK user agent, we leave it unchanged
                    return userAgent;
                }
            };
            ForcetkClient.setUserAgentString(patchUserAgent(creds.userAgent || ForcetkClient.getUserAgentString()));
        }, function (err, x) {
        });
        // Initialize ForceTK
        ForcetkClient = new forcetk.Client(consumerKey, loginUrl, null, null);
        ForcetkClient.setSessionToken(creds.accessToken, "v33.0", creds.instanceUrl);
        ForcetkClient.setRefreshToken(creds.refresh_token);
        var patchUserAgent = function (userAgent) {
            var match = /^(SalesforceMobileSDK\/[^\ ]* [^\/]*\/[^\ ]* \([^\)]*\) [^\/]*\/[^ ]* )(Hybrid|Web)(.*$)/.exec(userAgent);
            if (match != null && match.length == 4) {
                return match[1] + match[2] + "SmartSync" + match[3];
            } else {
                // Not a SalesforceMobileSDK user agent, we leave it unchanged
                return userAgent;
            }
        };
        ForcetkClient.setUserAgentString(patchUserAgent(creds.userAgent || ForcetkClient.getUserAgentString()));
        //Download New data
        DownloadAllDataIndexPage();
    } else {
        try {
            creds = {
                accessToken: oauthClient.oauthResponse.access_token,
                instanceUrl: oauthClient.oauthResponse.instance_url,
                refresh_token: oauthClient.oauthResponse.refresh_token,
                UserID: (oauthClient.oauthResponse.id).split('/')[(oauthClient.oauthResponse.id).split('/').length - 1]
            };
            app.deleteAllData('Credential', function (a, b) {
                app.insertRecord('Credential', {
                    AccessToken: creds.accessToken,
                    InstanceUrl: creds.instanceUrl,
                    OrgType: 'Production',
                    RefreshToken: creds.refresh_token,
                    UserID: creds.UserID
                });
            });
            // Initialize jsforce
            jsconn = new jsforce.Connection({
                oauth2: {
                    clientId: consumerKey,
                    clientSecret: ConsumerSecret,
                    redirectUri: callbackUrl
                },
                instanceUrl: creds.instanceUrl,
                accessToken: creds.accessToken,
                refreshToken: creds.refresh_token
            });
            jsconn.on("refresh", function (accessToken, res) {
                oauthClient.oauthResponse.refresh_token = accessToken;
                creds.accessToken = accessToken;

                AppIsOnline = true;
                //isAppStartedInOfflineMode = false;
                // Set the session in the web view 
                var loginWindowCookie = window.open(creds.instanceUrl + "/secur/frontdoor.jsp?sid=" + creds.accessToken, '_blank', 'hidden=yes');

                loginWindowCookie.addEventListener('loadstop', function (e) {
                    loginWindowCookie.close();
                });
                //END
                // Update Credential Table
                app.db.transaction(function (tx) {
                    tx.executeSql("UPDATE Credential SET accesstoken = ? WHERE id = ?", [accessToken, 1],
                        function () {
                        },
                        function (err) {
                            console.error('2. Error in updating Credential Table', err);
                        });
                });
            });
            // Initialize ForceTK
            ForcetkClient = new forcetk.Client(creds.clientId, creds.loginUrl, null, null);
            ForcetkClient.setSessionToken(creds.accessToken, "v33.0", creds.instanceUrl);
            ForcetkClient.setRefreshToken(creds.refresh_token);
            var patchUserAgent = function (userAgent) {
                var match = /^(SalesforceMobileSDK\/[^\ ]* [^\/]*\/[^\ ]* \([^\)]*\) [^\/]*\/[^ ]* )(Hybrid|Web)(.*$)/.exec(userAgent);
                if (match != null && match.length == 4) {
                    return match[1] + match[2] + "SmartSync" + match[3];
                } else {
                    // Not a SalesforceMobileSDK user agent, we leave it unchanged
                    return userAgent;
                }
            };
            ForcetkClient.setUserAgentString(patchUserAgent(creds.userAgent || ForcetkClient.getUserAgentString()));
            //Download Visits data
            DownloadAllDataIndexPage();
        } catch (err) {
            console.error(err);
        }
    }
}

var InternetStatusFooter = '';

document.addEventListener("online", function () {
    // If app comes online from offline; Keep app offline unless user click Complete button 
    // When user click on complete and app is online then store the data in database and then ask them to sync the data
    if (CheckSecondTimeOnlineStatus) {
        AppIsOnline = false;
    }
    //NetworkChangePopup();
}, false);

document.addEventListener("offline", function () {
    AppIsOnline = false;
    //isAppStartedInOfflineMode = true;
    InternetStatusFooter = "ServiceTracker is offline. Data is stored for upload when online";
    $('#InternetStatusFooter').html(InternetStatusFooter);
    $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
    $('#MyVisitsFooter').css("color", "#ff6666");
    $(".OfflineOnlineMessage").text(InternetStatusFooter);
    CheckSecondTimeOnlineStatus = true;

    // If user is on Refresh All Data and phone goes offline, Take the user to LoadAllDataOffline.html
    if (window.location.hash.indexOf("#view/LoadAllData.html") > -1) {
        $("button").attr('disabled', false);
        app.navigate('view/LoadAllDataOffline.html');
    }
}, false);

function DownloadAllData() {
    if (!DownloadNewData) {
        return;
    }
    //if (device.platform == 'Android') {
    window.plugins.calendar.listCalendars(function (message) {
        //LOG && console.log("Success: ", (message));
        let found = false;
        for (var i = 0; i < message.length; i++) {

            if (message[i].name == "Service Tracker") {
                calDetails = message[i];
                found = true;
                break;
            }
        }

        if (found) {
            window.plugins.calendar.deleteCalendar("Service Tracker", function (ss) {
                var createCalOptions = window.plugins.calendar.getCreateCalendarOptions();
                createCalOptions.calendarName = "Service Tracker";
                createCalOptions.calendarColor = "#0000ff";
                window.plugins.calendar.createCalendar(createCalOptions, function (message) {
                    //LOG && console.log("Success: " + JSON.stringify(message));
                    calDetails = {};
                    if (message) {
                        createCalOptions
                        calDetails['name'] = createCalOptions.calendarName;
                        calDetails['id'] = message;
                    }
                }, function (message) {
                    console.error("Error: " + message);
                });
            }, function (err) {
                LOG && console.log('Delete : Calendar', err);
            });
        } else {
            var createCalOptions = window.plugins.calendar.getCreateCalendarOptions();
            createCalOptions.calendarName = "Service Tracker";
            createCalOptions.calendarColor = "#0000ff";
            window.plugins.calendar.createCalendar(createCalOptions, function (message) {
                //LOG && console.log("Success: " + JSON.stringify(message));
                calDetails = {};
                if (message) {
                    createCalOptions
                    calDetails['name'] = createCalOptions.calendarName;
                    calDetails['id'] = message;
                }
            }, function (message) {
                console.error("Error: " + message);
            });
        }

    }, function (message) {
        console.error("Error: " + message);
    });
    //}
    // Modified by Ashutosh 17-03-2017
    // Download All Data after offline data is uploaded... 
    jsconn.sobject("STKR__Visit__c")
        .select("*,STKR__Account_lkp__r.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Parent.Id")
        .where("STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')) ORDER BY STKR__Due_Date__c ASC")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading visits', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            AllVisits = records;

            app.deleteAllData('Visits');
            VisitOverdue = [];
            VisitToday = [];
            VisitThisWeek = [];
            VisitWithin45 = [];
            VisitCompleted = [];
            VisitOverdueCount = 0;
            VisitTodayCount = 0;
            VisitThisWeekCount = 0;
            VisitWithin45Count = 0;
            VisitCompletedCount = 0;
            var WaitForInsert = 0;
            if (records.length) {
                function InsertVisitIntoTable(records) {
                    app.db.transaction(function (tx) {
                        for (var i = 0; i < records.length; i++) {
                            tx.executeSql('INSERT OR REPLACE INTO Visits(id,jsondata,updated,userid,visitid) VALUES ((select id from ' +
                                'Visits' +
                                ' where visitid = "' + data.VisitID + '"),?,?,?,?)',
                                [JSON.stringify(records[i]), 'false', records[i]['STKR__UserId__c'], records[i]['Id']],
                                function (tr, res) {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                    }
                                }, function (err) {
                                    console.error('error', err);
                                });
                        }
                    });
                }
                InsertVisitIntoTable(records);

                var visitdueDate;
                var visitduefinishDate;
                var Subject;
                var currentDateTime = new Date();
                var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

                for (var i = 0; i < records.length; i++) {
                    if(records[i]['STKR__Status__c'] === 'Complete'){
                        visitdueDate = calculateRecordDate(records[i]['STKR__Arrival_Time__c']);
                        visitduefinishDate = calculateRecordDate(records[i]['STKR__Completion_Time__c']);
                    }
                    else{
                        visitdueDate = calculateRecordDate(records[i]['STKR__Due_Date__c']);
                        visitduefinishDate = calculateRecordDate(records[i]['STKR__Due_Finish__c']);
                    }
                    
                    Subject = records[i]['STKR__Account__c'] + '\n' + records[i]['Name'];

                    let calNotes = null;
                    try {
                        calNotes = records[i]['STKR__Notes__c'];
                    } catch (err) {

                    }
                    //Check there is already an event and then update it instead of creating new event
                    var calOptions = window.plugins.calendar.getCalendarOptions();
                    calOptions.calendarId = calDetails.id;
                    calOptions.calendarName = calDetails.name;

                    //ios
                    setTimeout(function (Subject, calNotes, visitdueDate, visitduefinishDate) {
                        sep_fetchandCreate(Subject, calNotes, visitdueDate, visitduefinishDate);
                    }, 500 * i, Subject, calNotes, visitdueDate, visitduefinishDate);

                    if (records[i]['STKR__Status__c'] === 'Complete') {
                        VisitCompletedCount++;
                        VisitCompleted.push(records[i]);
                        if ((VisitCompletedCount + VisitOverdueCount + VisitTodayCount + VisitThisWeekCount + VisitWithin45Count) === records.length) {
                            RenderIt();
                        }
                    } else {




                        var diff = 0;
                        diff = (visitdueDate).getTime() - (CurrentDate).getTime();
                        diff = diff / (1000 * 60 * 60 * 24);

                        if (diff < 0) {
                            VisitOverdue[VisitOverdueCount++] = records[i];
                        } else if (diff >= 0 && diff < 1) {
                            VisitToday[VisitTodayCount++] = records[i];
                        } else if (diff >= 1 && diff < 7) {
                            VisitThisWeek[VisitThisWeekCount++] = records[i];
                        } else if (diff >= 7 && diff <= 46) {
                            VisitWithin45[VisitWithin45Count++] = records[i];
                        }
                        if ((VisitCompletedCount + VisitOverdueCount + VisitTodayCount + VisitThisWeekCount + VisitWithin45Count) === records.length) {
                            RenderIt();
                        }
                    }
                }
                CountAllDownloadObjects++;
                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });


    jsconn.sobject("Account")
        .find({
        })
        .where("Id IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading accounts', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }

            AllAccounts = records;
            //  app.dropTable("Account");
            app.deleteAllData('Account')

            if (records.length) {
                function InsertAccountIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, AccountID: records[i]['Id'] };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Account' +
                                '(id,jsondata,updated,userid,accountid) VALUES ((select id from ' +
                                'Account' +
                                ' where accountid = "' + data.AccountID + '"),?,?,?,?)',
                                [data.JsonData, data.Updated, data.UserId, data.AccountID],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Accounts ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertAccountIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    // Added on 14/07/2016 by Ashutosh

    jsconn.identity(function (err, res) {
        if (err) {
            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading org info', count: 0, iserror: true }]);
            app.pane.loader.hide();
            $("button").attr('disabled', false);
            $('#ReloadButton').show();
            err = err.toString();
            if (err.indexOf("Access Declined") > -1) {
                AppIsOnline = false;
                navigator.splashscreen.hide();
                if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                    app.navigate('view/LoadAllDataOffline.html');
                }
            }
            return console.error(err);
        }
        //LOG && console.log('OrgInfo', res);
        OrgInfo = res;
        app.deleteAllData('OrgInfo');
        app.insertRecord('OrgInfo', { JsonData: JSON.stringify(res), UserId: creds.UserID }, function () {
        });
        CountAllDownloadObjects++;
        if (CountAllDownloadObjects === TotalObjectCount) {
            AllDownloaded();
        }
    });

    jsconn.sobject("STKR__Chlorination_Results__c")
        .find({
        })
        .where("STKR__Inspection__r.STKR__Visit__r.STKR__OWNED_BY_CURRENT_USER__c= 'TRUE' AND ((STKR__Inspection__r.STKR__Visit__r.STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__Inspection__r.STKR__Visit__r.STKR__STATUS__C != 'Complete') OR (STKR__Inspection__r.STKR__Visit__r.STKR__COMPLETION_TIME__C  >= LAST_N_DAYS:7 AND STKR__Inspection__r.STKR__Visit__r.STKR__STATUS__C = 'Complete')) Order By CreatedDate ASC")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading analysis', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }

            AnalysisData = records;
            //app.dropTable("Analysis");
            app.deleteAllData('Analysis');
            var WaitForInsert = 0;
            if (records.length) {
                for (var i = 0; i < records.length; i++) {
                    app.insertRecord('Analysis', { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, AnalysisID: records[i]['Id'] }, function () {
                        WaitForInsert++;
                        if (WaitForInsert === records.length) {
                            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Analysis ', count: records.length, iserror: false }]);
                            CountAllDownloadObjects++;

                            if (CountAllDownloadObjects === TotalObjectCount) {
                                AllDownloaded();
                            }
                        }
                    });
                }
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    // Modified by Ashutosh 19-03-2017
    jsconn.sobject("STKR__Prep_Waste__c")
        .find({
        })
        .where("STKR__Status__c = 'Active' OR STKR__Status__c = null")
        .sort({ Name: 1 })
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading prep-waste', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            Prep_WasteData = records;

            /* // Sort the array by name , @Ridhi
            for (var Index1 = 0;Index1 < Prep_WasteData.length;Index1++) {
            for (var Index2 = 0;Index2 < Prep_WasteData.length - Index1 - 1;Index2++) {
            if (Prep_WasteData[Index2]['Name'] > Prep_WasteData[Index2 + 1]['Name']) {
            var tempvisit = Prep_WasteData[Index2]; 
            Prep_WasteData[Index2] = Prep_WasteData[Index2 + 1];
            Prep_WasteData[Index2 + 1] = tempvisit;
            }
            }
            }*/

            //app.dropTable("Prep_Waste");
            app.deleteAllData('Prep_Waste');
            var WaitForInsert = 0;
            if (records.length) {
                function InsertContactIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = {
                                JsonData: JSON.stringify(records[i]),
                                Updated: 'false',
                                UserId: creds.UserID,
                                Prep_WasteID: records[i]['Id']
                            }
                            tx.executeSql('INSERT OR REPLACE INTO ' + 'Prep_Waste' + '(id,jsondata,updated,userid,Prep_WasteId) VALUES ((select id from ' +
                                'Prep_Waste' +
                                ' where Prep_WasteId = "' + data.Prep_WasteID + '"),?,?,?,?)',
                                [data.JsonData, data.Updated, data.UserId, data.Prep_WasteID],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Prep/Waste ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertContactIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    //added by gaurav 27-04-2020
  
    //end

    // Modified by Ashutosh 19-03-2017
    /* 
  
          */


   


    // Modified by Ashutosh 19-03-2017
    jsconn.sobject("STKR__Service_Item__c")
        .select('*, RecordType.Name')
        .where("ID IN (SELECT STKR__Service_Item__c From STKR__Inspection__c where STKR__Visit__r.STKR__Owned_by_current_user__c='TRUE' AND ((STKR__Visit__r.STKR__DUE_DATE__C <=NEXT_N_DAYS:46 AND STKR__Visit__r.STKR__STATUS__C != 'Complete') OR (STKR__Visit__r.STKR__COMPLETION_TIME__C  >= LAST_N_DAYS:7 AND STKR__Visit__r.STKR__STATUS__C = 'Complete')))")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading inspection items', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            InspectionItemData = records;
            app.deleteAllData('InspectionItem');
            //app.dropTable("InspectionItem");
            //LOG && console.log('Inspection Item', records[0]); 
            if (records.length) {
                function InsertInspectionItemIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'InspectionItem' +
                                '(id,jsondata,updated,userid,accountid,inspectionitemid) VALUES ((select id from ' +
                                'InspectionItem' +
                                ' where inspectionitemid = "' + records[i]['Id'] + '"),?,?,?,?,?)',
                                [JSON.stringify(records[i]), 'false', creds.UserID, records[i]['STKR__Account__c'], records[i]['Id']],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Inspection Items ', count: records.length, iserror: false }]);

                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertInspectionItemIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });


    // Download Inspection item parameters
    jsconn.sobject("STKR__InspectionParameter__c")
        .select('*')
        .where("STKR__Inspection_Item__c IN (SELECT STKR__Service_Item__c From STKR__Inspection__c where STKR__Visit__r.STKR__Owned_by_current_user__c='TRUE' AND ((STKR__Visit__r.STKR__DUE_DATE__C <=NEXT_N_DAYS:46 AND STKR__Visit__r.STKR__STATUS__C != 'Complete') OR (STKR__Visit__r.STKR__DUE_DATE__C >= LAST_N_DAYS:7 AND STKR__Visit__r.STKR__STATUS__C = 'Complete'))) AND (STKR__Valid_From__c <= Today) AND (STKR__Valid_To__c >= Today OR STKR__Valid_To__c =null)")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading inspection items parameters', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            InspectionItemParameterData = records;
            app.deleteAllData('InspectionItemParameter');

            // LOG && console.log('Inspection Item Parameter', records);

            if (records.length) {
                function InsertInspectionItemParameterIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'InspectionItemParameter' +
                                '(id,jsondata,updated,userid,inspectionitemid,inspectionitemparameterid) VALUES ((select id from ' +
                                'InspectionItemParameter' +
                                ' where inspectionitemparameterid = "' + records[i]['Id'] + '"),?,?,?,?,?)',
                                [JSON.stringify(records[i]), 'false', creds.UserID, records[i]['STKR__Inspection_Item__c'], records[i]['Id']],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Inspection Items Parameters', count: records.length, iserror: false }]);

                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertInspectionItemParameterIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    // Modified by Ashutosh 19-03-2017
    jsconn.sobject("STKR__Actions__c")
        .find({
        })
        //.where("STKR__VISIT__c IN (SELECT Id From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")        
        .where("STKR__Account__c IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading action', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                    app.navigate('view/LoadAllDataOffline.html');
                }
                return console.error(err);
            }
            ActionData = records;
            app.deleteAllData('Action');
            if (records.length) {
                function InsertActionIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Action' +
                                '(id,jsondata,updated,userid,accountid,actionid) VALUES ((select id from ' +
                                'Action' +
                                ' where actionid = "' + records[i]['Id'] + '"),?,?,?,?,?)',
                                [JSON.stringify(records[i]), 'false', records[i]['STKR__Assigned_To__c'], records[i]['STKR__Account__c'], records[i]['Id']],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Actions ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertActionIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    jsconn.sobject("STKR__Resource__c")
        .find({
        })
        .select('*,STKR__User__r.IsActive')
        .where("STKR__User__r.IsActive= true")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading resources', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            ResourceData = records;

            app.deleteAllData('Resource');
            //Download Resource Signature
            for (var i = 0; i < ResourceData.length; i++) {
                if (ResourceData[i]['STKR__User__c'] === creds.UserID)
                    jsconn.sobject("Document")
                        .find({
                            Id: ResourceData[i]['STKR__Signature_Id__c']

                        })
                        .execute(function (err, records) {
                            if (err) {
                                err = err.toString();
                                if (err.indexOf("Access Declined") > -1) {
                                    AppIsOnline = false;
                                    navigator.splashscreen.hide();
                                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                                        app.navigate('view/LoadAllDataOffline.html');
                                    }
                                }
                                return console.error(err);
                            }
                            DocumentData = records;
                            download(creds.instanceUrl + records[0]['Body'], 'UserSignature.jpg');
                        });
            }
            if (records.length) {
                function InsertResourcesIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: records[i]['STKR__User__c'], ResourceId: records[i]['Id'] };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Resource' +
                                '(id,jsondata,userid,resourceid) VALUES ((select id from ' +
                                'Resource' +
                                ' where resourceid = "' + data.ResourceId + '"),?,?,?)',
                                [data.JsonData, data.UserId, data.ResourceId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Resource ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertResourcesIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    jsconn.sobject("STKR__Prep_Waste_Management__c")
        .find({})
        .select('*, STKR__Prep_Waste__r.Id,STKR__Prep_Waste__r.Name,STKR__Prep_Waste__r.STKR__Volume__c')
        .sort({ Name: 1 })
        .where("STKR__VISIT__c IN (SELECT Id From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading prep-waste management', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }

            Prep_WasteManagementData = records;
            app.deleteAllData('Prep_WasteManagement');

            if (records.length) {
                function InsertPrepWasteManagementIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, Prep_WasteMgmtId: records[i]['Id'] };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Prep_WasteManagement' +
                                '(id,jsondata,userid,Prep_WasteMgmtId) VALUES ((select id from ' +
                                'Prep_WasteManagement' +
                                ' where Prep_WasteMgmtId = "' + data.Prep_WasteMgmtId + '"),?,?,?)',
                                [data.JsonData, data.UserId, data.Prep_WasteMgmtId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Prep/Waste Management ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertPrepWasteManagementIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    // Modified by Ashutosh 17-3-2017
    jsconn.sobject("User")
        .select('*,Contact.AccountId,Contact.Account.Parent.Id,Contact.Account.Parent.Parent.Id,Contact.Account.Parent.Parent.Parent.Id,Contact.Account.Parent.Parent.Parent.ParentId')
        .where('isActive = true')
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading user details', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }
            Userdata = records;
            app.deleteAllData('Userdata');
            if (records.length) {
                function InsertUserIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, UserObjectId: records[i]['Id'] };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Userdata' +
                                '(id,jsondata,userid,UserObjectId) VALUES ((select id from ' +
                                'Userdata' +
                                ' where UserObjectId = "' + data.UserObjectId + '"),?,?,?)',
                                [data.JsonData, data.UserId, data.UserObjectId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'User data ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;

                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertUserIntoTable(records);
            } else {
                CountAllDownloadObjects++;

                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    // Modified by Ashutosh 19-03-2017
    // Download Event data
    jsconn.sobject("Event")
        .find({
        })
        .where("STKR__SendToMobile__c = TRUE Order By ActivityDate ASC")
        .run({ autoFetch: true }, function (err, records) {
            if (err) {
                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading events', count: 0, iserror: true }]);
                app.pane.loader.hide();
                $("button").attr('disabled', false);
                $('#ReloadButton').show();
                err = err.toString();
                if (err.indexOf("Access Declined") > -1) {
                    AppIsOnline = false;
                    navigator.splashscreen.hide();
                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                        app.navigate('view/LoadAllDataOffline.html');
                    }
                }
                return console.error(err);
            }


            EventsOverdue = [];
            EventsToday = [];
            EventsThisWeek = [];
            EventsWithin45 = [];
            EventsOverdueCount = 0;
            EventsTodayCount = 0;
            EventsThisWeekCount = 0;
            EventsWithin45Count = 0;

            PersonalEvents = records;
            //  app.dropTable("Account");
            app.deleteAllData('PersonalEvents')

            if (records.length) {
                function InsertEventIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'PersonalEvents' +
                                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                                'PersonalEvents' +
                                ' where recordid = "' + records[i]['Id'] + '"),?,?,?)',
                                [JSON.stringify(records[i]), creds.UserID, records[i]['Id']],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Events ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;
                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertEventIntoTable(records);

                for (var i = 0; i < records.length; i++) {
                    var EventStartDate;
                    var EventEndDate;
                    var Subject;
                    var currentDateTime = new Date();
                    var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

                    if (device.platform === 'Win32NT') {
                    } else if (device.platform === 'iOS') {
                        var dates = (records[i]['StartDateTime']).split('T')[0];
                        var times = (records[i]['StartDateTime']).split('T')[1];
                        var day = dates.split('-')[2];
                        var month = dates.split('-')[1];
                        var year = dates.split('-')[0];

                        var end_dates = (records[i]['EndDateTime']).split('T')[0];
                        var end_times = (records[i]['EndDateTime']).split('T')[1];
                        var end_day = end_dates.split('-')[2];
                        var end_month = end_dates.split('-')[1];
                        var end_year = end_dates.split('-')[0];

                        var hour = times.split(':')[0];
                        var minute = times.split(':')[1];
                        var seconds = (times.split(':')[2]).split('.')[0];
                        var milliseconds = times.split('.')[1].split('+')[0];

                        var end_hour = end_times.split(':')[0];
                        var end_minute = end_times.split(':')[1];
                        var end_seconds = (end_times.split(':')[2]).split('.')[0];
                        var end_milliseconds = end_times.split('.')[1].split('+')[0];

                        EventStartDate = new Date(year, month - 1, day, hour, minute, seconds, milliseconds);
                        EventEndDate = new Date(end_year, end_month - 1, end_day, end_hour, end_minute, end_seconds, end_milliseconds);
                        Subject = records[i]['Subject'];

                        var calOptions = window.plugins.calendar.getCalendarOptions();
                        calOptions.calendarId = calDetails.id;
                        calOptions.calendarName = calDetails.name;

                        let calNotes = null;
                        try {
                            calNotes = records[i]['Description'];
                        } catch (err) {

                        }
                        //ios
                        setTimeout(function (Subject, calNotes, visitdueDate, visitduefinishDate) {
                            sep_fetchandCreate(Subject, calNotes, visitdueDate, visitduefinishDate);
                        }, 500 * i, Subject, calNotes, EventStartDate, EventEndDate);

                    } else {
                        var EventStartDateTime = new Date(records[i]['StartDateTime']);
                        var EventEndDateTime = new Date(records[i]['EndDateTime']);

                        EventStartDate = new Date(EventStartDateTime.getFullYear(), EventStartDateTime.getMonth(), EventStartDateTime.getDate(), EventStartDateTime.getHours(), EventStartDateTime.getMinutes(), EventStartDateTime.getSeconds(), EventStartDateTime.getMilliseconds());
                        EventEndDate = new Date(EventEndDateTime.getFullYear(), EventEndDateTime.getMonth(), EventEndDateTime.getDate(), EventEndDateTime.getHours(), EventEndDateTime.getMinutes(), EventEndDateTime.getSeconds(), EventEndDateTime.getMilliseconds());
                        Subject = records[i]['Subject'];

                        var calOptions = window.plugins.calendar.getCalendarOptions();
                        calOptions.calendarId = calDetails.id;
                        calOptions.calendarName = calDetails.name;


                        let calNotes = null;
                        try {
                            calNotes = records[i]['Description'];
                        } catch (err) {

                        }
                        setTimeout(function (Subject, calNotes, visitdueDate, visitduefinishDate) {
                            //LOG && console.log(Subject, calNotes, visitdueDate, visitduefinishDate);
                            sep_fetchandCreate(Subject, calNotes, visitdueDate, visitduefinishDate);
                        }, 500 * i, Subject, calNotes, EventStartDate, EventEndDate);
                    }

                    var diff = 0;
                    diff = (EventStartDate).getTime() - (CurrentDate).getTime();
                    diff = diff / (1000 * 60 * 60 * 24);

                    if (diff < 0) {
                        EventsOverdue[EventsOverdueCount++] = records[i];
                    } else if (diff >= 0 && diff < 1) {
                        EventsToday[EventsTodayCount++] = records[i];
                    } else if (diff >= 1 && diff < 7) {
                        EventsThisWeek[EventsThisWeekCount++] = records[i];
                    } else if (diff >= 7 && diff <= 46) {
                        EventsWithin45[EventsWithin45Count++] = records[i];
                    }
                }
            } else {
                CountAllDownloadObjects++;
                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    jsconn.sobject("STKR__Service_Contract__c")
        .select('*')
        .where("STKR__Account__c IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run(function (err, records) {
            ContractData = records;
            app.deleteAllData('ContractData');
            if (records.length) {
                function InsertContractIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = {
                                JsonData: JSON.stringify(records[i]),
                                UserId: creds.UserID,
                                RecordId: records[i]['Id']
                            };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'ContractData' +
                                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                                'ContractData' +
                                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                                [data.JsonData, data.UserId, data.RecordId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Contract ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;
                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertContractIntoTable(records);
            } else {
                CountAllDownloadObjects++;
                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    jsconn.sobject("Task")
        .select('*')
        .where("CreatedById='" + creds.UserID + "' AND WhatId IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run(function (err, records) {
            TaskData = records;
            app.deleteAllData('TaskData');

            if (records.length) {
                function InsertTaskIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = {
                                JsonData: JSON.stringify(records[i]),
                                UserId: creds.UserID,
                                RecordId: records[i]['Id']
                            };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'TaskData' +
                                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                                'TaskData' +
                                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                                [data.JsonData, data.UserId, data.RecordId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Task ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;
                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertTaskIntoTable(records);
            } else {
                CountAllDownloadObjects++;
                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }
        });

    jsconn.apex.get("/STKR/DownloadAlerts/", {}, function (err, records) {
        if (err) {
            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading alerts', count: 0, iserror: true }]);
            app.pane.loader.hide();
            $("button").attr('disabled', false);
            $('#ReloadButton').show();
            err = err.toString();
            if (err.indexOf("Access Declined") > -1) {
                AppIsOnline = false;
                navigator.splashscreen.hide();
                if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                    app.navigate('view/LoadAllDataOffline.html');
                }
            }
            return console.error(err);
        }
    }).then(function (records) {
        AlertsData = records;
        app.deleteAllData('Alerts');
        if (records.length) {
            function InsertAlertIntoTable(records) {
                app.db.transaction(function (tx) {
                    var WaitForInsert = 0;
                    for (var i = 0; i < records.length; i++) {
                        var data = {
                            JsonData: JSON.stringify(records[i]),
                            Updated: 'false',
                            UserId: creds.UserID,
                            AccountID: records[i]['AccountId'],
                            AlertID: records[i]['Id']
                        };
                        tx.executeSql('INSERT OR REPLACE INTO ' +
                            'Alerts' +
                            '(id,jsondata,updated,userid,accountid,alertid) VALUES ((select id from ' +
                            'Alerts' +
                            ' where alertid = "' + data.AlertID + '"),?,?,?,?,?)',
                            [data.JsonData, data.Updated, data.UserId, data.AccountID, data.AlertID],
                            function () {
                                WaitForInsert++;
                                if (WaitForInsert === records.length) {
                                    scrollToBottom();
                                    $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Alerts ', count: records.length, iserror: false }]);
                                    CountAllDownloadObjects++;
                                    if (CountAllDownloadObjects === TotalObjectCount) {
                                        AllDownloaded();
                                    }
                                }
                            },
                            app.onError);
                    }
                });
            }
            InsertAlertIntoTable(records);
        } else {
            CountAllDownloadObjects++;
            if (CountAllDownloadObjects === TotalObjectCount) {
                AllDownloaded();
            }
        }
    });

    
        //download vehicle object JULY
        jsconn.sobject("STKR__Vehicle__c")
.find({
})
.where("STKR__Driver__c In ( SELECT Id From STKR__Resource__c where STKR__User__c  ='" + creds.UserID + "')")
.run({ autoFetch: true }, function (err, records) {
    if (err) {
        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading vehicle', count: 0, iserror: true }]);
        app.pane.loader.hide();
        $("button").attr('disabled', false);
        $('#ReloadButton').show();
        err = err.toString();
        if (err.indexOf("Access Declined") > -1) {
            AppIsOnline = false;
            navigator.splashscreen.hide();
            if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                app.navigate('view/LoadAllDataOffline.html');
            }
        }
        return console.error(err);
    }

    vehicleData = records;
    //  app.dropTable("Account");
    app.deleteAllData('Vehicle')

    if (records.length) {
        function InsertAccountIntoTable(records) {
            app.db.transaction(function (tx) {
                var WaitForInsert = 0;
                for (var i = 0; i < records.length; i++) {
                    var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, vehicleId: records[i]['Id'] };
                    tx.executeSql('INSERT OR REPLACE INTO ' +
                        'Vehicle' +
                        '(id,jsondata,updated,userid,vehicleId) VALUES ((select id from ' +
                        'Vehicle' +
                        ' where vehicleId = "' + data.vehicleId + '"),?,?,?,?)',
                        [data.JsonData, data.Updated, data.UserId, data.vehicleId],
                        function () {
                            WaitForInsert++;
                            if (WaitForInsert === records.length) {
                                scrollToBottom();
                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Vehicle ', count: records.length, iserror: false }]);
                                CountAllDownloadObjects++;

                                if (CountAllDownloadObjects === TotalObjectCount) {
                                    AllDownloaded();
                                }
                            }
                        },
                        app.onError);
                }
            });
        }
        InsertAccountIntoTable(records);
    } else {
        CountAllDownloadObjects++;

        if (CountAllDownloadObjects === TotalObjectCount) {
            AllDownloaded();
        }
    }
});

 //skill requirement

 jsconn.sobject("STKR__Client_Requirement__c")
 .select("*,STKR__Requirement__r.Name,STKR__Requirement__r.STKR__Notes__c")
 .where("STKR__Requirement__r.STKR__Show_on_Mobile__c = TRUE ")
 .run({ autoFetch: true }, function(err, records) {
     if (err) {
         $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading vehicle', count: 0, iserror: true }]);
         app.pane.loader.hide();
         $("button").attr('disabled', false);
         $('#ReloadButton').show();
         err = err.toString();
         if (err.indexOf("Access Declined") > -1) {
             AppIsOnline = false;
             navigator.splashscreen.hide();
             if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                 app.navigate('view/LoadAllDataOffline.html');
             }
         }
         return console.error(err);
     }

     SkillReqData = records;

     //  app.dropTable("Account");
     app.deleteAllData('SkillRequirement')

     if (records.length) {
         function InsertAccountIntoTable(records) {
             app.db.transaction(function(tx) {
                 var WaitForInsert = 0;
                 for (var i = 0; i < records.length; i++) {
                     var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, SkillId: records[i]['Id'] };
                     tx.executeSql('INSERT OR REPLACE INTO ' +
                         'SkillRequirement' +
                         '(id,jsondata,updated,userid,SkillId) VALUES ((select id from ' +
                         'SkillRequirement' +
                         ' where SkillId = "' + data.SkillId + '"),?,?,?,?)', [data.JsonData, data.Updated, data.UserId, data.SkillId],
                         function() {
                             WaitForInsert++;
                             if (WaitForInsert === records.length) {
                                 scrollToBottom();
                                 $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Vehicle ', count: records.length, iserror: false }]);
                                 CountAllDownloadObjects++;

                                 if (CountAllDownloadObjects === TotalObjectCount) {
                                     AllDownloaded();
                                 }
                             }
                         },
                         app.onError);
                 }
             });
         }
         InsertAccountIntoTable(records);
     } else {
         CountAllDownloadObjects++;

         if (CountAllDownloadObjects === TotalObjectCount) {
             AllDownloaded();
         }
     }
 });
        //

    //Download Billing records, only for visit that are availble on device
    jsconn.sobject("STKR__Billing__c")
        .select("*,STKR__Owner__r.LastName,STKR__Owner__r.FirstName")
        .where("STKR__Type__c ='Quote' AND STKR__Visit__c IN (SELECT Id FROM STKR__Visit__c WHERE STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
        .run(function (err, records) {
            BillingRecords = records;

            app.deleteAllData('Billing');

            if (records.length) {
                function InsertBillingIntoTable(records) {
                    app.db.transaction(function (tx) {
                        var WaitForInsert = 0;
                        for (var i = 0; i < records.length; i++) {
                            var data = {
                                JsonData: JSON.stringify(records[i]),
                                Updated: 'false',
                                UserId: creds.UserID,
                                VisitId: records[i]['STKR__Visit__c'],
                                BillingId: records[i]['Id']
                            };
                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                'Billing' +
                                '(id,jsondata,updated,userid,visitid,billingid) VALUES ((select id from ' +
                                'Billing' +
                                ' where billingid = "' + data.BillingId + '"),?,?,?,?,?)',
                                [data.JsonData, data.Updated, data.UserId, data.VisitId, data.BillingId],
                                function () {
                                    WaitForInsert++;
                                    if (WaitForInsert === records.length) {
                                        scrollToBottom();
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Quote ', count: records.length, iserror: false }]);
                                        CountAllDownloadObjects++;
                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                            AllDownloaded();
                                        }
                                    }
                                },
                                app.onError);
                        }
                    });
                }
                InsertBillingIntoTable(records);
            } else {
                CountAllDownloadObjects++;
                if (CountAllDownloadObjects === TotalObjectCount) {
                    AllDownloaded();
                }
            }

        });

    //Download custom settings
    jsconn.apex.get("/STKR/Mapp_FetchCustomSettings/", {}, function (err, records) {
        if (err) {
            err = err.toString();
            if (err.indexOf("Access Declined") > -1) {
                AppIsOnline = false;
                navigator.splashscreen.hide();
                if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                    app.navigate('view/LoadAllDataOffline.html');
                }
            }
            return console.error(err);
        }
    }).then(function (records) {
        customSettings = records;

        // Quick inspect checkbox for inspection
        window.localStorage.setItem("QuickInspect", customSettings.STKR__QuickInspect__c.STKR__enabled__c);
        QuickInspect = customSettings.STKR__QuickInspect__c.STKR__enabled__c;

        // Show All Visits Settings
        window.localStorage.setItem("ShowAllVisitsSettings", JSON.stringify(customSettings.STKR__Show_All_Visits__c));
        ShowAllVisitsSettings = customSettings.STKR__Show_All_Visits__c;

        // Download label for quote description
        window.localStorage.setItem("QuoteDescriptionLabel", customSettings.STKR__Mobile_Quote_Description_Label1__c.STKR__Label_Text__c);
        QuoteDescriptionLabel = customSettings.STKR__Mobile_Quote_Description_Label1__c.STKR__Label_Text__c;

        window.localStorage.setItem("FixedVisitCheck", customSettings.STKR__Mobile_Fixed_Visit__c.STKR__Uncheck_Fix_Visit__c);
        FixedVisitCheck = customSettings.STKR__Mobile_Fixed_Visit__c.STKR__Uncheck_Fix_Visit__c;

        // Camera settings
        window.localStorage.setItem("CameraSettings", JSON.stringify(customSettings.STKR__Mobile_Camera_Settings__c));
        CameraSettings = customSettings.STKR__Mobile_Camera_Settings__c;

        // Download label for quote location
        window.localStorage.setItem("QuoteLocationLabel", customSettings.STKR__Mobile_App_Quote_Location_Label1__c.STKR__Label_Text__c);
        QuoteLocationLabel = customSettings.STKR__Mobile_App_Quote_Location_Label1__c.STKR__Label_Text__c;

        window.localStorage.setItem("PrepWasteLabel", customSettings.STKR__Mobile_App_Prep_Waste_Label1__c.STKR__Label_Text__c);
        PrepWasteLabel = customSettings.STKR__Mobile_App_Prep_Waste_Label1__c.STKR__Label_Text__c;

        // Download label for action
        window.localStorage.setItem("ActionLabel", customSettings.STKR__Mobile_App_Action_Label__c.STKR__Label_Text__c);
        ActionLabel = customSettings.STKR__Mobile_App_Action_Label__c.STKR__Label_Text__c;

        window.localStorage.setItem("ButtonSettings", JSON.stringify(customSettings.STKR__MobileAppButtonSetting__c));
        ButtonSettings = customSettings.STKR__MobileAppButtonSetting__c;
        
        // show all related contacts
        window.localStorage.setItem("ShowRelatedContacts", customSettings.STKR__ShowRelatedContactsInAlerts__c);
        ShowRelatedContacts = customSettings.STKR__ShowRelatedContactsInAlerts__c;
        
        // Inspection sort order
        var sortOrderInspection = [];
        var OrderByForInspection = ' Order By ';
        if (ButtonSettings.STKR__Inspection_Sort_Order__c != undefined) {
            sortOrderInspection = ButtonSettings.STKR__Inspection_Sort_Order__c.split(',');
            for (var i = 0; i < sortOrderInspection.length; i++) {
                console.log('abc',  sortOrderInspection[i])
                if (i == sortOrderInspection.length - 1) {
                    OrderByForInspection = OrderByForInspection + sortOrderInspection[i] + ' ASC';
                } else {
                    OrderByForInspection = OrderByForInspection + sortOrderInspection[i] + ' ASC, ';
                }
            } console.log('inspectionorder customsetting having value', OrderByForInspection);
        } else {
            OrderByForInspection = 'Order By STKR__SERVICE_ITEM__R.STKR__ORDER__C ASC, STKR__SERVICE_ITEM__R.NAME ASC';
            console.log('customsettingfalse', OrderByForInspection)
        }

         // Modified by Ashutosh 19-03-2017
    jsconn.sobject("STKR__Inspection__c")
    .find({
    })
    //.where("STKR__VISIT__c IN (SELECT Id From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete'))) ORDER BY STKR__SERVICE_ITEM__R.STKR__ORDER__C ASC, STKR__SERVICE_ITEM__R.NAME ASC")        
    .where("STKR__VISIT__c IN ( SELECT Id FROM STKR__VISIT__c WHERE STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))" + OrderByForInspection)
    .run({ autoFetch: true }, function (err, records) {
        if (err) {
            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading inspection', count: 0, iserror: true }]);
            app.pane.loader.hide();
            $("button").attr('disabled', false);
            $('#ReloadButton').show();
            err = err.toString();
            if (err.indexOf("Access Declined") > -1) {
                AppIsOnline = false;
                navigator.splashscreen.hide();
                if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                    app.navigate('view/LoadAllDataOffline.html');
                }
            }
            return console.error(err);
        }
        //LOG && console.log('STKR__Inspection__c', records[0]);
        //data.JsonData,data.Updated,data.UserId,data.VisitID,data.InspectionID
        InspectionData = records;
        //app.dropTable("Inspection");
        app.deleteAllData('Inspection');
        if (records.length) {
            function InsertInspectionIntoTable(records) {
                app.db.transaction(function (tx) {
                    var WaitForInsert = 0;
                    for (var i = 0; i < records.length; i++) {
                        tx.executeSql('INSERT OR REPLACE INTO ' +
                            'Inspection' +
                            '(id,jsondata,updated,userid,visitid,inspectionid) VALUES ((select id from ' +
                            'Inspection' +
                            ' where inspectionid = "' + records[i]['Id'] + '"),?,?,?,?,?)',
                            [JSON.stringify(records[i]), 'false', creds.UserID, records[i]['STKR__Visit__c'], records[i]['Id']],
                            function () {
                                WaitForInsert++;
                                if (WaitForInsert === records.length) {
                                    scrollToBottom();
                                    $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Inspections ', count: records.length, iserror: false }]);
                                    CountAllDownloadObjects++;

                                    if (CountAllDownloadObjects === TotalObjectCount) {
                                        AllDownloaded();
                                    }
                                }
                            },
                            app.onError);
                    }
                });
            }
            InsertInspectionIntoTable(records);
        } else {
            CountAllDownloadObjects++;

            if (CountAllDownloadObjects === TotalObjectCount) {
                AllDownloaded();
            }
        }
    });
        //

        if (ShowRelatedContacts != undefined ){
           // if enabled then download from related contact otherwise downloand Contact records
            if(ShowRelatedContacts.STKR__Enable__c){
            var queryString = '';
            if (ContactMetadata.fields.length) {
                queryString = '';
                for (var i = 0; i < ContactMetadata.fields.length; i++) {
                    if (i === (ContactMetadata.fields.length - 1))
                        queryString = queryString + 'Contact.' + ContactMetadata.fields[i].name + ', Account.Id';
                    else
                        queryString = queryString + 'Contact.' + ContactMetadata.fields[i].name + ', ';
                }
            }
            queryString = "SELECT " + queryString + " FROM AccountContactRelation WHERE AccountId IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))";
        
            $.ajax({
                url: creds.instanceUrl + "/services/data/v33.0/query?q=" + queryString,
                type: 'GET',
                headers: { Authorization: 'Bearer ' + creds.accessToken },
                success: function (data) {
                    if (data.records.length) {
                        for (var i = 0; i < data.records.length; i++) {
                            data.records[i].Contact['RelatedAccount'] =  data.records[i].Account.Id;
                            ContactData.push(data.records[i].Contact);
                        }
                    }
        
                    app.deleteAllData('Contact');
                    //app.dropTable("Contact");
                    if (ContactData.length) {
                        function InsertContactIntoTable(records) {
                            app.db.transaction(function (tx) {
                                var WaitForInsert = 0;
                                for (var i = 0; i < records.length; i++) {
                                    var data = {
                                        JsonData: JSON.stringify(records[i]),
                                        Updated: 'false',
                                        UserId: creds.UserID,
                                        AccountID: records[i]['AccountId'],
                                        ContactID: records[i]['Id']
                                    };
                                    tx.executeSql('INSERT OR REPLACE INTO ' +
                                        'Contact' +
                                        '(id,jsondata,updated,userid,accountid,contactid) VALUES ((select id from ' +
                                        'Contact' +
                                        ' where contactid = "' + data.ContactID + '"),?,?,?,?,?)',
                                        [data.JsonData, data.Updated, data.UserId, data.AccountID, data.ContactID],
                                        function () {
                                            WaitForInsert++;
                                            if (WaitForInsert === records.length) {
                                                scrollToBottom();
                                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Contacts ', count: records.length, iserror: false }]);
                                                CountAllDownloadObjects++;
        
                                                if (CountAllDownloadObjects === TotalObjectCount) {
                                                    AllDownloaded();
                                                }
                                            }
                                        },
                                        app.onError);
                                }
                            });
                        }
                        InsertContactIntoTable(ContactData);
                    } else {
                        CountAllDownloadObjects++;
        
                        if (CountAllDownloadObjects === TotalObjectCount) {
                            AllDownloaded();
                        }
                    }
                },
                error: function (err) {
                    $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading contacts', count: 0, iserror: true }]);
                    app.pane.loader.hide();
                    $("button").attr('disabled', false);
                    $('#ReloadButton').show();
                    err = err.toString();
                    if (err.indexOf("Access Declined") > -1) {
                        AppIsOnline = false;
                        navigator.splashscreen.hide();
                        if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                            app.navigate('view/LoadAllDataOffline.html');
                        }
                    }
                    console.error(err);
                }
            });
           }else{
            jsconn.sobject("Contact")
            .find({
            })
            .where("AccountId IN (SELECT STKR__Account_lkp__c From STKR__VISIT__c where STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')))")
            .run({ autoFetch: true }, function (err, records) {
                if (err) {
                    $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading contacts', count: 0, iserror: true }]);
                    app.pane.loader.hide();
                    $("button").attr('disabled', false);
                    $('#ReloadButton').show();
                    err = err.toString();
                    if (err.indexOf("Access Declined") > -1) {
                        AppIsOnline = false;
                        navigator.splashscreen.hide();
                        if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                            app.navigate('view/LoadAllDataOffline.html');
                        }
                    }
                    return console.error(err);
                }
                ContactData = records;
                app.deleteAllData('Contact');
                //app.dropTable("Contact");
                if (records.length) {
                    function InsertContactIntoTable(records) {
                        app.db.transaction(function (tx) {
                            var WaitForInsert = 0;
                            for (var i = 0; i < records.length; i++) {
                                var data = {
                                    JsonData: JSON.stringify(records[i]),
                                    Updated: 'false',
                                    UserId: creds.UserID,
                                    AccountID: records[i]['AccountId'],
                                    ContactID: records[i]['Id']
                                };
                                tx.executeSql('INSERT OR REPLACE INTO ' +
                                    'Contact' +
                                    '(id,jsondata,updated,userid,accountid,contactid) VALUES ((select id from ' +
                                    'Contact' +
                                    ' where contactid = "' + data.ContactID + '"),?,?,?,?,?)',
                                    [data.JsonData, data.Updated, data.UserId, data.AccountID, data.ContactID],
                                    function () {
                                        WaitForInsert++;
                                        if (WaitForInsert === records.length) {
                                            scrollToBottom();
                                            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Contacts ', count: records.length, iserror: false }]);
                                            CountAllDownloadObjects++;
    
                                            if (CountAllDownloadObjects === TotalObjectCount) {
                                                AllDownloaded();
                                            }
                                        }
                                    },
                                    app.onError);
                            }
                        });
                    }
                    InsertContactIntoTable(records);
                } else {
                    CountAllDownloadObjects++;
    
                    if (CountAllDownloadObjects === TotalObjectCount) {
                        AllDownloaded();
                    }
                }
            }); 
           }
        }

        var whereClause = [], numberOfPartDownloaded = 0;

        if (ButtonSettings.STKR__Show_All_Contract__c) {
            whereClause = [];
            whereClause.push("STKR__Status__c = 'Active'");
        } else {
            whereClause = [];
            whereClause.push("STKR__Status__c = 'Active' AND STKR__Service_Owner__r.STKR__User__c = '" + creds.UserID + "'");
            whereClause.push("STKR__Status__c = 'Active' AND Id IN (SELECT STKR__Service__c FROM STKR__Visit__c WHERE STKR__Owned_By_Current_User__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS :46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS :7 AND STKR__STATUS__C = 'Complete'))) AND STKR__Service_Owner__r.STKR__User__c != '" + creds.UserID + "'");
        }

        var scheduleFieldsToDownload = [
            "Id",
            "Name",
            "CreatedDate",
            "STKR__Business_Type__c",
            "STKR__Last_Visit__c",
            "STKR__Contract_Ref_PO__c",
            "STKR__Number_of_Visit_Per_Year__c",
            "STKR__Current_Visit_Number__c",
            "STKR__Frequency__c",
            "STKR__Contract_Type__c",
            "STKR__Fix_all_Visits__c",
            "STKR__Service_Type__c",
            "STKR__Schedule_Summary__c",
            "STKR__Account__c",
            "STKR__Account__r.Id",
            "STKR__Account__r.Name",
            "STKR__Account__r.ShippingPostalCode",
            "STKR__Account__r.STKR__Territory__r.Id",
            "STKR__Account__r.STKR__Territory__r.Name",
            "STKR__Account__r.STKR__Territory__r.STKR__Territory_Description__c",
            "STKR__Contact_Name__r.Name",
            "STKR__Product__r.Name",
            "STKR__Service_Owner__c",
            "STKR__Service_Contract__r.STKR__Start_Date__c",
            "STKR__Response_SLA__r.Name"
        ];
        var scheduleQueryFields = "";
        
        if (ButtonSettings != undefined && ButtonSettings.STKR__Exclude_Schedules__c != undefined && !ButtonSettings.STKR__Exclude_Schedules__c) {
            jsconn.apex.get("/../../services/data/v43.0/search/layout/?q=STKR__Service__c", function (err, resColumn) {
                if (err) { return console.error(err); }
                if (resColumn.errorMsg) {
                    alert(resColumn.errorMsg);
                    return;
                }

                window.localStorage.setItem('STKR__Service__c_SearchLayout', JSON.stringify(resColumn));

                for (var i = 0; i < resColumn[0]['searchColumns'].length; i++) {
                    var fieldName = resColumn[0]['searchColumns'][i]['name'];

                    if (fieldName.indexOf("toLabel(") > -1) {
                        fieldName = fieldName.split("toLabel(")[1].split(")")[0];
                    }

                    if (scheduleFieldsToDownload.indexOf(fieldName) == -1) {
                        scheduleFieldsToDownload.push(fieldName);
                    }
                }

                scheduleQueryFields = "";
                for (var i = 0; i < scheduleFieldsToDownload.length; i++) {
                    scheduleQueryFields += scheduleFieldsToDownload[i] + ",";
                }
                scheduleQueryFields = scheduleQueryFields.substring(0, scheduleQueryFields.length - 1);

                app.deleteAllData('Schedule');
                ScheduleData = [];

                for (let whereNumber = 0; whereNumber < whereClause.length; whereNumber++) {
                    jsconn.sobject("STKR__Service__c")
                        //.select('*, STKR__Service_Contract__r.*, STKR__Contact_Name__r.Name, STKR__Product__r.Name, STKR__Response_SLA__r.Name, STKR__Service_Owner__r.*, STKR__Account__r.*, STKR__Account__r.STKR__Territory__r.*')
                        .select(scheduleQueryFields)
                        .where(whereClause[whereNumber])
                        .run({ autoFetch: true }, function (err, records) {
                            if (err) {
                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading schedule', count: 0, iserror: true }]);
                                app.pane.loader.hide();
                                $("button").attr('disabled', false);
                                $('#ReloadButton').show();
                                err = err.toString();
                                if (err.indexOf("Access Declined") > -1) {
                                    AppIsOnline = false;
                                    navigator.splashscreen.hide();
                                    if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                                        app.navigate('view/LoadAllDataOffline.html');
                                    }
                                }
                                return console.error(err);
                            }
                            // if (numberOfPartDownloaded == 0) {
                            //     app.deleteAllData('Schedule');
                            //     ScheduleData = [];
                            // }
                            ScheduleData = ScheduleData.concat(records);

                            if (records.length) {
                                function InsertSchedulesIntoTable(records) {
                                    app.db.transaction(function (tx) {
                                        var WaitForInsert = 0;
                                        for (var i = 0; i < records.length; i++) {
                                            var data = { JsonData: JSON.stringify(records[i]), Updated: 'false', UserId: creds.UserID, ScheduleID: records[i]['Id'] };
                                            tx.executeSql('INSERT OR REPLACE INTO ' +
                                                'Schedule' +
                                                '(id,jsondata,updated,userid,scheduleid) VALUES ((select id from ' +
                                                'Schedule' +
                                                ' where scheduleid = "' + data.ScheduleID + '"),?,?,?,?)',
                                                [data.JsonData, data.Updated, data.UserId, data.ScheduleID],
                                                function () {
                                                    WaitForInsert++;
                                                    if (WaitForInsert === records.length) {
                                                        numberOfPartDownloaded++;
                                                    }
                                                    if (numberOfPartDownloaded == whereClause.length) {
                                                        scrollToBottom();
                                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Schedules ', count: ScheduleData.length, iserror: false }]);
                                                        CountAllDownloadObjects++;
                                                        if (CountAllDownloadObjects === TotalObjectCount) {
                                                            AllDownloaded();
                                                        }
                                                    }
                                                },
                                                app.onError);
                                        }
                                    });
                                }
                                InsertSchedulesIntoTable(records);
                            } else {
                                numberOfPartDownloaded++
                                if (numberOfPartDownloaded == whereClause.length) {
                                    CountAllDownloadObjects++;
                                    if (CountAllDownloadObjects === TotalObjectCount) {
                                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Schedules ', count: ScheduleData.length, iserror: false }]);
                                        scrollToBottom();
                                        AllDownloaded();
                                    }
                                }
                            }
                        });
                }

            });

            //Downloading all price entries
            jsconn.sobject("PricebookEntry")
                .select("*,Product2.Name,Product2.Id,Pricebook2.Id,Pricebook2.Name")
                .where("IsActive = true ORDER BY Product2.Family, Product2.Name")
                .run(function (err, records) {
                    PricebookEntries = records;

                    app.deleteAllData('PriceEntries');

                    if (records.length) {
                        function InsertPriceEntiryIntoTable(records) {
                            app.db.transaction(function (tx) {
                                var WaitForInsert = 0;
                                for (var i = 0; i < records.length; i++) {
                                    var data = {
                                        JsonData: JSON.stringify(records[i]),
                                        Updated: 'false',
                                        UserId: creds.UserID,
                                        PriceBookId: records[i]['Pricebook2Id'],
                                        PriceEntryId: records[i]['Id']
                                    };
                                    tx.executeSql('INSERT OR REPLACE INTO ' +
                                        'PriceEntries' +
                                        '(id,jsondata,updated,userid,pricebookid,priceentryid) VALUES ((select id from ' +
                                        'PriceEntries' +
                                        ' where priceentryid = "' + data.PriceEntryId + '"),?,?,?,?,?)',
                                        [data.JsonData, data.Updated, data.UserId, data.PriceBookId, data.PriceEntryId],
                                        function () {
                                            WaitForInsert++;
                                            if (WaitForInsert === records.length) {
                                                scrollToBottom();
                                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Pricebook Entries ', count: records.length, iserror: false }]);
                                                CountAllDownloadObjects++;
                                                if (CountAllDownloadObjects === TotalObjectCount) {
                                                    AllDownloaded();
                                                }
                                            }
                                        },
                                        app.onError);
                                }
                            });
                        }
                        InsertPriceEntiryIntoTable(records);
                    } else {
                        CountAllDownloadObjects++;
                        if (CountAllDownloadObjects === TotalObjectCount) {
                            AllDownloaded();
                        }
                    }
                });

        }
        else {
            CountAllDownloadObjects = CountAllDownloadObjects + 2;
            if (CountAllDownloadObjects === TotalObjectCount) {
                AllDownloaded();
            }
        }
        // Get the URL and Download the service report template
        // LOG && console.log('STKR__Service_Report_Template__c', ButtonSettings);
        if (ButtonSettings.STKR__Service_Report_Template__c != undefined && ButtonSettings.STKR__Service_Report_Template__c) {
            jsconn.sobject("Document")
                .select('Id, FolderId, Name, DeveloperName, ContentType, Type, IsPublic, BodyLength, Body, Url')
                .where(`Name ='${ButtonSettings.STKR__Service_Report_Template__c}'`)
                .execute(function (err, records) {
                    if (err) {
                        return console.error(err);
                    }
                    $.ajax({
                        url: creds.instanceUrl + records[0]['Body'],
                        type: 'GET',
                        headers: { Authorization: 'Bearer ' + creds.accessToken },
                        success: function (data) {
                            window.localStorage.setItem('ServiceReportTemplate', data);
                        },
                        error: function (err) { console.error(err); }
                    });
                });
        } else {
            //Use locally stored file -- Create new file ... Don't overwrite it. 
        }

        //Download others visit
        try {
            if (ButtonSettings.STKR__Show_All_Contract__c != undefined && ButtonSettings.STKR__Show_All_Contract__c) {
                //Incrementing total number of objects needed to download
                TotalObjectCount++;

                jsconn.sobject("STKR__Visit__c")
                    .select("*,STKR__Account_lkp__r.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Parent.Id")
                    .where("STKR__Account_lkp__r.STKR__Status__c='Active' AND STKR__Not_Owned_by_Current_User_and_Active__c='TRUE' AND ((STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C != 'Complete') OR (STKR__COMPLETION_TIME__C >= LAST_N_DAYS:7 AND STKR__STATUS__C = 'Complete')) ORDER BY STKR__Due_Date__c ASC")
                    .run({ autoFetch: true }, function (err, records) {
                        if (err) {
                            $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Error while downloading others visits', count: 0, iserror: true }]);
                            app.pane.loader.hide();
                            $("button").attr('disabled', false);
                            $('#ReloadButton').show();
                            err = err.toString();
                            if (err.indexOf("Access Declined") > -1) {
                                AppIsOnline = false;
                                navigator.splashscreen.hide();
                                if (window.location.href.indexOf('HomePage.html') === -1 && window.location.href.indexOf('LoadAllDataOffline.html') === -1) {
                                    app.navigate('view/LoadAllDataOffline.html');
                                }
                            }
                            return console.error(err);
                        }
                        AllOthersVisits = records;

                        app.deleteAllData('OthersVisits');
                        if (records.length) {
                            function InsertVisitIntoTable(records) {
                                app.db.transaction(function (tx) {
                                    for (var i = 0; i < records.length; i++) {
                                        tx.executeSql('INSERT OR REPLACE INTO Visits(id,jsondata,updated,userid,visitid) VALUES ((select id from ' +
                                            'OthersVisits' +
                                            ' where visitid = "' + data.VisitID + '"),?,?,?,?)',
                                            [JSON.stringify(records[i]), 'false', records[i]['STKR__UserId__c'], records[i]['Id']],
                                            function (tr, res) {
                                            }, function (err) {
                                                console.error('error', err);
                                            });
                                    }
                                });
                            }
                            InsertVisitIntoTable(records);
                            CountAllDownloadObjects++;
                            if (CountAllDownloadObjects === TotalObjectCount) {
                                AllDownloaded();
                            }
                        } else {
                            CountAllDownloadObjects++;
                            if (CountAllDownloadObjects === TotalObjectCount) {
                                AllDownloaded();
                            }
                        }
                    });
            }
            else{
                CountAllDownloadObjects++;
                            if (CountAllDownloadObjects === TotalObjectCount) {
                                AllDownloaded();
                            }
            }
        } catch (err) { console.error(err); }
    });
}

// Variable to store whether found inspection item using barcode or not
var FoundBarcode = false;

function barcodeScan() {
    CountBarcode = 0;
    if (isZebraDevice) {
        //To open/close scanner from code 
        sendBroadcast('com.symbol.datawedge.api.SOFT_SCAN_TRIGGER', 'TOGGLE_SCANNING');
        return;
    }
    cordova.plugins.barcodeScanner.scan(function (result) {
        if (result.text) {
            for (var i = 0; i < InspectionItemData.length; i++) {
                if (InspectionItemData[i]['STKR__Bar_Code_Number__c'] === result.text) {
                    for (var j = 0; j < InspectionData.length; j++) {
                        if (InspectionData[j]['STKR__Visit__c'] === ParamVisitId && InspectionData[j]['STKR__Service_Item__c'] === InspectionItemData[i]['Id']) {
                            FoundBarcode = true;
                            app.navigate("view/InspectionDetailPage.html?inspectionid=" + InspectionData[j]['Id'] + "&inspectionitemid=" + InspectionItemData[i]['Id']);
                            break;
                        } else if (j === InspectionData.length - 1) {
                            app.toastMessage('Service Tracker Could not find inspection item for barcode:' + result.text, 'long');
                        }
                    }
                    break;
                }
            }
            if (!FoundBarcode) {
                app.toastMessage('Result is not match with the Inspection Item', 'long')
            }
        } else {
            app.toastMessage('This barcode is empty', 'long')
        }
    }, function (error) {
        StoreError(JSON.stringify(error));
        app.toastMessage("Scanning failed: " + error);
    }, {
        prompt: "Place a barcode inside the scan area", // Android 

    });
}

function openModalViewTask() {
    $("#modalview-task").kendoMobileModalView("open");
    $("#ModelViewDate").val('');
    $("#ModelViewSubject").val('');
    $("#ModelViewDescription").val('');
    $("#ModelViewPriority").val('');
    $("#ModelViewStatus").val('');
    $("#ModelViewStatus").val('Completed');
}

function closeModalViewTask() {
    $("#modalview-task").kendoMobileModalView("close");
    $("#ModelViewDate").val('');
    $("#ModelViewSubject").val('');
    $("#ModelViewDescription").val('');
    $("#ModelViewPriority").val('');
    $("#ModelViewStatus").val('');
}

function DownloadAllDataIndexPage() {
    // Check whether to obtain new access token or refresh token
    jsconn.query("SELECT Id FROM Account LIMIT 1", function (err, result) {
        if (err) {
            AppIsOnline = false;
            err = err.toString();
            if (err === "invalid_grant: expired access/refresh token") {
                Login();
            } else if (err.indexOf("Access Declined") > -1) {
                AppIsOnline = false;
                navigator.splashscreen.hide();
                //app.pane.loader.hide();
                app.navigate('view/LoadAllDataOffline.html');
            }
            app.toastMessage('Not able to download the data.\n Error: ' + err, 'long');
            return LOG && console.log(err);
        }
        AppIsOnline = true;
        navigator.splashscreen.hide();
        //app.pane.loader.hide();
        app.navigate('view/LoadAllData.html');
    });
}

function StoreError(err) {
    //var newerr = err + '\n' + navigator.connection.type + '\n\n' + navigator.userAgent;
    var Error = {
        Errordata: err,
        UserId: creds.UserID,
        date: new Date()
    }
    app.insertRecord('ErrorLog', Error);
    app.pane.loader.hide();
}

function UploadOfflineChanges(ShouldDownloadNewData) {
    AlreadyTookTheBackup = false;
    if (ShouldDownloadNewData === false) {
        DownloadNewData = false;
    } else {
        DownloadNewData = true;
    }

    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM DataToUpdate WHERE objectname!='STKR__Visit__c' AND userid=? AND length(jsondata) <=2000000", [creds.UserID], function (a, rs) {
            TotalBatchToComplete = 0, BatchCompleted = 0;
            var AllResult = rs.rows,
                DataToUpdateVisits = [], DataToInsertVisits = [],
                DataToUpdateInspections = [], DataToInsertInspections = [],
                DataToUpdateAnalysis = [], DataToInsertAnalysis = [],
                DataToUpdateInspectionItem = [], DataToInsertInspectionItem = [],
                DataToUpdateContacts = [], DataToInsertContacts = [],
                DataToUpdateActions = [], DataToInsertActions = [],
                DataToUpdateImage = [], DataToInsertImage = [],
                DataToUpdatePrep_Waste = [], DataToInsertPrep_Waste = [],
                DataToUpdatePrep_WasteManagement = [], DataToInsertPrep_WasteManagement = [],
                DataToUpdateSchedule = [], DataToInsertSchedule = [],
                DataToUpdateResource = [], DataToInsertResource = [],
                DataToUpdateScheduleItem = [], DataToInsertScheduleItem = [],
                DataToUpdateEvent = [], DataToInsertEvent = [],
                DataToUpdateAlerts = [], DataToInsertAlerts = [],
                DataToInsertGeolocationHistory = [], DeleteAttachments = [],
                DataToUpdateBilling = [], DataToInsertBilling = [],
                DataToUpdateBillingItem = [], DataToInsertBillingItem = [],
                DataToUpdateTask = [], DataToInsertTask = [],
                DataToUpdateAccount = [], DataToUpdateVehicle = [], DataToInsertVehicle= [];

            for (var j = 0; j < AllResult.length; j++) {
                if (AllResult.item(j)['updateorinsert'] === 'update' && AllResult.item(j)['updated'] !== 'newRecord') {
                    switch (AllResult.item(j)['objectname']) {
                        case 'STKR__Visit__c':
                            DataToUpdateVisits.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Inspection__c':
                            DataToUpdateInspections.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Actions__c':
                            DataToUpdateActions.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Service__c':
                            DataToUpdateSchedule.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Prep_Waste__c':
                            DataToUpdatePrep_Waste.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Prep_Waste_Management__c':
                            DataToUpdatePrep_WasteManagement.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Resource__c':
                            DataToUpdateResource.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Schedule_Items__c':
                            DataToUpdateScheduleItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Contact':
                            DataToUpdateContacts.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Chlorination_Results__c':
                            DataToUpdateAnalysis.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Service_Item__c':
                            DataToUpdateInspectionItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Attachment':
                            DataToUpdateImage.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Event':
                            DataToUpdateEvent.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Alerts__c':
                            DataToUpdateAlerts.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Billing__c':
                            DataToUpdateBilling.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Billing_Items__c':
                            DataToUpdateBillingItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Task':
                            DataToUpdateTask.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Account':
                            DataToUpdateAccount.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Vehicle_checks__c':
                            DataToUpdateVehicle.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                    }
                } else if (AllResult.item(j)['updateorinsert'] === 'insert' || AllResult.item(j)['updated'] === 'newRecord') {
                    switch (AllResult.item(j)['objectname']) {
                        case 'STKR__Visits__c':
                            DataToInsertVisits.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Inspection__c':
                            DataToInsertInspections.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Actions__c':
                            DataToInsertActions.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Service__c':
                            DataToInsertSchedule.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Prep_Waste__c':
                            DataToInsertPrep_Waste.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Prep_Waste_Management__c':
                            DataToInsertPrep_WasteManagement.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Resource__c':
                            DataToInsertResource.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Schedule_Items__c':
                            DataToInsertScheduleItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Contact':
                            DataToInsertContacts.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Chlorination_Results__c':
                            DataToInsertAnalysis.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Service_Item__c':
                            DataToInsertInspectionItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Attachment':
                            DataToInsertImage.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Event':
                            DataToInsertEvent.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Alerts__c':
                            DataToInsertAlerts.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Resource_Geolocation__c':
                            DataToInsertGeolocationHistory.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Billing__c':
                            DataToInsertBilling.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Billing_Items__c':
                            DataToInsertBillingItem.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'Task':
                            DataToInsertTask.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                        case 'STKR__Vehicle_checks__c':
                            DataToInsertVehicle.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                    }
                } else if (AllResult.item(j)['updateorinsert'] === 'delete') {
                    switch (AllResult.item(j)['objectname']) {
                        case 'Attachment':
                            DeleteAttachments.push(JSON.parse(AllResult.item(j)['jsondata']));
                            break;
                    }
                }
            }

            if (AllResult.length) {
                if (DeleteAttachments.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertGeolocationHistory.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateEvent.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertEvent.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateVisits.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertVisits.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateInspections.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertInspections.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateVehicle.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertVehicle.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateAnalysis.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertAnalysis.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateInspectionItem.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertInspectionItem.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateContacts.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertContacts.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateActions.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertActions.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdatePrep_Waste.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertPrep_Waste.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdatePrep_WasteManagement.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertPrep_WasteManagement.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateSchedule.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertSchedule.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateResource.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertResource.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateScheduleItem.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertScheduleItem.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateImage.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertImage.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertAlerts.length) {
                    TotalBatchToComplete++;
                }
                if (DataToUpdateAlerts.length) {
                    TotalBatchToComplete++;
                }
                //STKR__Billing__c
                if (DataToUpdateBilling.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertBilling.length) {
                    TotalBatchToComplete++;
                }
                //STKR__Billing_Items__c
                if (DataToUpdateBillingItem.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertBillingItem.length) {
                    TotalBatchToComplete++;
                }
             

                if (DataToUpdateTask.length) {
                    TotalBatchToComplete++;
                }
                if (DataToInsertTask.length) {
                    TotalBatchToComplete++;
                }
                if(DataToUpdateAccount.length){
                    TotalBatchToComplete++;
                }

                if (TotalBatchToComplete > 0) {
                    AlreadyTookTheBackup = true;
                    // Copy the database 
                    SqliteVersionHistory();
                    // Check and delete older files
                    SQLiteHistoryDelete();
                }
                if (DataToInsertGeolocationHistory.length) {
                    CreateBatch('STKR__Resource_Geolocation__c', DataToInsertGeolocationHistory, 'insert');
                }
                if (DataToUpdateVisits.length) {
                    CreateBatch('STKR__Visit__c', DataToUpdateVisits, 'update');
                }
                if (DataToInsertVisits.length) {
                    CreateBatch('STKR__Visit__c', DataToInsertVisits, 'insert');
                }
                if (DataToUpdateInspectionItem.length) {
                    CreateBatch('STKR__Service_Item__c', DataToUpdateInspectionItem, 'update');
                }
                if (DataToInsertInspectionItem.length) {
                    CreateBatch('STKR__Service_Item__c', DataToInsertInspectionItem, 'upsert');
                }
                if (DataToUpdateInspections.length) {
                    CreateBatch('STKR__Inspection__c', DataToUpdateInspections, 'update');
                }
                if (DataToInsertInspections.length) {
                    CreateBatch('STKR__Inspection__c', DataToInsertInspections, 'upsert');
                }
                if (DataToUpdateVehicle.length) {
                    CreateBatch('STKR__Vehicle_checks__c', DataToUpdateVehicle, 'update');
                }
                if (DataToInsertVehicle.length) {
                    CreateBatch('STKR__Vehicle_checks__c', DataToInsertVehicle, 'upsert');
                }
                if (DataToUpdateContacts.length) {
                    CreateBatch('Contact', DataToUpdateContacts, 'update');
                }
                if (DataToInsertContacts.length) {
                    CreateBatch('Contact', DataToInsertContacts, 'upsert');
                }
                if (DataToUpdateActions.length) {
                    CreateBatch('STKR__Actions__c', DataToUpdateActions, 'update');
                }
                if (DataToInsertActions.length) {
                    // CreateBatch('STKR__Actions__c', DataToInsertActions, 'insert');
                    CreateBatch('STKR__Actions__c', DataToInsertActions, 'upsert');
                }
                if (DataToUpdatePrep_Waste.length) {
                    CreateBatch('STKR__Prep_Waste__c', DataToUpdatePrep_Waste, 'update');
                }
                if (DataToInsertPrep_Waste.length) {
                    CreateBatch('STKR__Prep_Waste__c', DataToInsertPrep_Waste, 'insert');
                }
                if (DataToUpdatePrep_WasteManagement.length) {
                    CreateBatch('STKR__Prep_Waste_Management__c', DataToUpdatePrep_WasteManagement, 'update');
                }
                if (DataToInsertPrep_WasteManagement.length) {
                    CreateBatch('STKR__Prep_Waste_Management__c', DataToInsertPrep_WasteManagement, 'insert');
                }
                if (DataToUpdateSchedule.length) {
                    CreateBatch('STKR__Service__c', DataToUpdateSchedule, 'update');
                }
                if (DataToInsertSchedule.length) {
                    CreateBatch('STKR__Service__c', DataToInsertSchedule, 'insert');
                }
                if (DataToUpdateResource.length) {
                    CreateBatch('STKR__Resource__c', DataToUpdateResource, 'update');
                }
                if (DataToInsertResource.length) {
                    CreateBatch('STKR__Resource__c', DataToInsertResource, 'insert');
                }
                if (DataToUpdateScheduleItem.length) {
                    CreateBatch('STKR__Schedule_Items__c', DataToUpdateScheduleItem, 'update');
                }
                if (DataToInsertScheduleItem.length) {
                    CreateBatch('STKR__Schedule_Items__c', DataToInsertScheduleItem, 'insert');
                }
                if (DataToInsertEvent.length) {
                    CreateBatch('Event', DataToInsertEvent, 'insert');
                }
                if (DataToUpdateEvent.length) {
                    CreateBatch('Event', DataToUpdateEvent, 'update');
                }
                if (DataToUpdateImage.length) {
                    setTimeout(UploadOfflineImages, 10000, 'Attachment', DataToUpdateImage, 'update');
                }
                if (DataToInsertImage.length) {
                    setTimeout(UploadOfflineImages, 10000, 'Attachment', DataToInsertImage, 'insert');
                }
                if (DataToInsertAlerts.length) {
                    CreateBatch('STKR__Alerts__c', DataToInsertAlerts, 'upsert');
                }
                if (DataToUpdateAlerts.length) {
                    CreateBatch('STKR__Alerts__c', DataToUpdateAlerts, 'update');
                }
                if (DataToUpdateAnalysis.length) {
                    CreateBatch('STKR__Chlorination_Results__c', DataToUpdateAnalysis, 'update');
                }
                if (DeleteAttachments.length) {
                    CreateBatch('Attachment', DeleteAttachments, 'delete');
                }
                if(DataToUpdateAccount.length){
                    CreateBatch('Account',DataToUpdateAccount,'update');
                }

                if (DataToUpdateBilling.length) {
                    setTimeout(function (DataToUpdateBilling) {
                        CreateBatch('STKR__Billing__c', DataToUpdateBilling, 'update');
                    }, 500, DataToUpdateBilling);
                }
                if (DataToInsertBilling.length) {
                    setTimeout(function (DataToInsertBilling) {
                        CreateBatch('STKR__Billing__c', DataToInsertBilling, 'upsert');
                    }, 500, DataToInsertBilling);
                }
                if (DataToUpdateBillingItem.length) {
                    CreateBatch('STKR__Billing_Items__c', DataToUpdateBillingItem, 'update');
                }
                if (DataToInsertBillingItem.length) {
                    CreateBatch('STKR__Billing_Items__c', DataToInsertBillingItem, 'insert');
                }

                if (DataToInsertAnalysis.length) {
                    setTimeout(function (DataToInsertAnalysis) {
                        CreateBatch('STKR__Chlorination_Results__c', DataToInsertAnalysis, 'insert');
                    }, 500, DataToInsertAnalysis);
                }

                if (DataToUpdateTask.length) {
                    CreateBatch('Task', DataToUpdateTask, 'update');
                }
                if (DataToInsertTask.length) {
                    CreateBatch('Task', DataToInsertTask, 'insert');
                }
            } else {
                // Nothing to upload ..
                UploadVisitData();
            }
        }, function (err) {
        });
    });
}

/**@todo : delete this function after flow change implementation*/
function UploadVisitData() {
    try {
        app.db.transaction(function (tx) {
            // Check if there is any pending items accepts attachments and Visits
            tx.executeSql("SELECT * FROM DataToUpdate WHERE objectname !='STKR__Visit__c' AND userid=?", [creds.UserID], function (a, rs) {
                if (rs.rows.length) {
                    app.toastMessage('Some data are pending to upload, Please upload those before completing the visit.', 'long');
                    DownloadAllData();
                } else {
                    tx.executeSql("SELECT * FROM DataToUpdate WHERE objectname ='STKR__Visit__c'", [], function (a, vrs) {
                        var AllResult = vrs.rows;
                        var DataToInsertVisits = [], DataToUpdateVisits = [];
                        var TotalBatchToComplete = 0;
                        BatchCompleted = 0;
                        if (AllResult.length) {
                            for (var j = 0; j < AllResult.length; j++) {
                                if (AllResult.item(j)['updateorinsert'] === 'update' && AllResult.item(j)['updated'] !== 'newRecord') {
                                    switch (AllResult.item(j)['objectname']) {
                                        case 'STKR__Visit__c':
                                            DataToUpdateVisits.push(JSON.parse(AllResult.item(j)['jsondata']));
                                            break;
                                    }
                                } else if (AllResult.item(j)['updateorinsert'] === 'insert' || AllResult.item(j)['updated'] === 'newRecord') {
                                    switch (AllResult.item(j)['objectname']) {
                                        case 'STKR__Visit__c':
                                            DataToInsertVisits.push(JSON.parse(AllResult.item(j)['jsondata']));
                                            break;
                                    }
                                }
                            }

                            if (DataToUpdateVisits.length) {
                                TotalBatchToComplete++;
                            }
                            if (DataToInsertVisits.length) {
                                TotalBatchToComplete++;
                            }

                            if (TotalBatchToComplete > 0) {
                                if (!AlreadyTookTheBackup) {
                                    // Copy the database 
                                    SqliteVersionHistory();
                                }
                                // Check and delete older files
                                SQLiteHistoryDelete();
                            }
                            function CreateVisitBatch(ObjectName, DataToSend, OperationName) {
                                // OperationName , i.e. insert or update
                                var NotUpdateableFields = [];
                                var DataToSendOriginal = $.extend(true, {}, DataToSend);
                                var AllFieldsAPIName = [];

                                switch (ObjectName) {
                                    case 'STKR__Visit__c':
                                        try {
                                            for (var i = 0; i < VisitMetadata['fields'].length; i++) {
                                                if (!VisitMetadata['fields'][i]['updateable']) {
                                                    NotUpdateableFields.push(VisitMetadata['fields'][i]['name']);
                                                }
                                                AllFieldsAPIName.push(VisitMetadata['fields'][i]['name']);
                                            }
                                        } catch (err) {
                                            LOG && console.log(err);
                                            //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                                        }
                                        break;
                                }

                                var job = jsconn.bulk.createJob(ObjectName, OperationName);
                                var batch = job.createBatch();

                                for (var i = 0; i < DataToSend.length; i++) {
                                    for (var property in DataToSend[i]) {
                                        try {
                                            if (OperationName === 'insert' && ObjectName === 'STKR__Inspection__c' && (property === 'STKR__Visit__c' || property === 'STKR__Service_Item__c')) {
                                                if (DataToSend[i]['STKR__Service_Item__c'].length < 18) {
                                                    DataToSend[i]['STKR__Service_Item__c'] = null;
                                                }
                                                continue;
                                            }

                                            if (property !== 'Id' && NotUpdateableFields.indexOf(property) > -1) {
                                                if (OperationName === 'insert' && ObjectName === 'STKR__Prep_Waste_Management__c' && DataToSend[i][property] === 'STKR__Visit__c') {
                                                }
                                                if (OperationName === 'insert' && ObjectName === 'STKR__Inspection__c' && DataToSend[i][property] === 'STKR__Service_Item__c') {
                                                } else {
                                                    delete DataToSend[i][property];
                                                }
                                            }
                                        } catch (err) {
                                            LOG && console.log(err);
                                            break;
                                        }

                                        try {
                                            // Delete RecordType before sending to salesforce.. 
                                            if (ObjectName === 'STKR__Service_Item__c' && property === 'RecordType') {
                                                if (DataToSend[i]['RecordTypeId'])
                                                    delete DataToSend[i]['RecordType'];
                                            }
                                        } catch (eer) {
                                            LOG && console.log(eer);
                                            LOG && console.log('Error Inspection Item RecordType', eer);
                                        }
                                        // Remove fields that are not available on salesforce
                                        try {
                                            if (AllFieldsAPIName.indexOf(property) === -1) {
                                                delete DataToSend[i][property];
                                            }
                                        } catch (err) {
                                        }
                                        // Remove the isOverdue field...
                                        try {
                                            if (ObjectName === 'STKR__Visit__c')
                                                delete DataToSend[i]['isOverdue'];
                                        } catch (err) {
                                        }
                                    }
                                    try {
                                        if (OperationName === 'insert') {
                                            delete DataToSend[i]['Id'];
                                            /*if (ObjectName === 'STKR__Inspection__c') {
                                            delete DataToSend[i]['STKR__Service_Item__c'];
                                            }*/
                                        }
                                    } catch (a) {
                                        LOG && console.log(a);
                                    }
                                }
                                LOG && console.log('DataToSend', OperationName, ObjectName, DataToSend);
                                batch.execute(DataToSend);
                                batch.on("queue", function (batchInfo) {
                                    // fired when batch request is queued in server.
                                    batchId = batchInfo.id;
                                    jobId = batchInfo.jobId;

                                    var job = jsconn.bulk.job(jobId);
                                    var batch = job.batch(batchId);
                                    batch.poll(1000, 20020); // start polling
                                    batch.on("response", function (rets) {
                                        // fired when batch finished and result retrieved
                                        LOG && console.log('Batch Result', ObjectName, DataToSend, rets);
                                        //*** To Add in store errors
                                        if (rets) {
                                            for (var i = 0; i < rets.length; i++) {
                                                if (rets[i]['success']) {
                                                    //app.deleteRecord('DataToUpdate', rets[i]['id']);
                                                    /*app.db.transaction(function (tx) {
                                                    tx.executeSql("DELETE FROM DataToUpdate WHERE objectname = ?", [ObjectName],
                                                    app.onSuccess,
                                                    app.onError);
                                                    });*/
                                                    function DeleteSyncedData(data) {
                                                        app.db.transaction(function (tx) {
                                                            tx.executeSql("DELETE FROM DataToUpdate WHERE recordid = ?", [data['Id']],
                                                                app.onSuccess,
                                                                app.onError);
                                                        });
                                                    }

                                                    DeleteSyncedData(DataToSendOriginal[i]);
                                                } else {
                                                    app.toastMessage('Some records are not being uploaded, Please use View Offline Data page to upload', 'long');
                                                    try {
                                                        LogMoreErrorInfo(rets, new Error().stack + '\n' + ObjectName);
                                                    } catch (err) {
                                                        LOG && console.log(err);
                                                    }
                                                }
                                            }
                                        }

                                        BatchCompleted++;
                                        if (TotalBatchToComplete === BatchCompleted) {
                                            try {
                                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Offline data uploaded', count: 0, iserror: false }]);
                                            } catch (err) {
                                                LOG && console.log(err);
                                            }
                                            app.toastMessage('All Data is uploaded', 'long');
                                            CountNumberOfOflineItem();
                                            // This function is defined on loadalldata.html
                                            DownloadAllData();
                                        }
                                        job.close();
                                    });
                                });
                            }

                            if (DataToUpdateVisits.length) {
                                try {
                                    //LOG && console.log('Test 1',DataToUpdateVisits);
                                    CreateVisitBatch('STKR__Visit__c', DataToUpdateVisits, 'update');
                                } catch (error) {
                                    LOG && console.log(error);
                                }
                            }
                            if (DataToInsertVisits.length) {
                                CreateVisitBatch('STKR__Visit__c', DataToInsertVisits, 'insert');
                            }
                        } else {
                            try {
                                $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: 'Offline data uploaded', count: 0, iserror: false }]);
                            } catch (err) {
                                LOG && console.log(err);
                            }
                            DownloadAllData();
                        }
                    }, function (err) {
                        LOG && console.log(err);
                    });
                }
            }, function (err) {
                LOG && console.log(err);
            });
        });
    } catch (err) {
        LOG && console.log(err);
    }
}

function CreateBatch(ObjectName, DataToSend, OperationName) {
    // OperationName , i.e. insert or update
    var NotUpdateableFields = [];
    var DataToSendOriginal = $.extend(true, {}, DataToSend);
    var AllFieldsAPIName = [];

    //console.log('Original Data', OperationName, ObjectName, DataToSendOriginal);
    switch (ObjectName) {
        case 'STKR__Inspection__c':
            try {
                for (var i = 0; i < InspectionMetadata['fields'].length; i++) {
                    if (!InspectionMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(InspectionMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(InspectionMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
            }
            break;
            case 'STKR__Vehicle_checks__c':
                    try {
                        for (var i = 0; i < vehicleMetaData['fields'].length; i++) {
                            if (!vehicleMetaData['fields'][i]['updateable'] && vehicleMetaData['fields'][i]['name'] != "STKR__Vehicle__c") {
                                NotUpdateableFields.push(vehicleMetaData['fields'][i]['name']);
                            }
                            AllFieldsAPIName.push(vehicleMetaData['fields'][i]['name']);
                        }
                    } catch (err) {
                        console.log(err);
                        LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                    }
                    break;
        case 'STKR__Resource__c':
            try {
                for (var i = 0; i < ResourceMetadata['fields'].length; i++) {
                    if (!ResourceMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(ResourceMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(ResourceMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                for (var i = 0; i < ResourceMetadata[0]['fields'].length; i++) {
                    if (!ResourceMetadata[0]['fields'][i]['updateable']) {
                        NotUpdateableFields.push(ResourceMetadata[0]['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(ResourceMetadata[0]['fields'][i]['name']);
                }
            }
            break;
        case 'STKR__Visit__c':
            try {
                for (var i = 0; i < VisitMetadata['fields'].length; i++) {
                    if (!VisitMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(VisitMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(VisitMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
            }
            break;
        case 'STKR__Actions__c':
            // Need to create a ActionMetadata variable
            try {
                for (var i = 0; i < ActionMetadata['fields'].length; i++) {
                    if (!ActionMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(ActionMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(ActionMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                try {
                    for (var i = 0; i < ActionMetadata[0]['fields'].length; i++) {
                        if (!ActionMetadata[0]['fields'][i]['updateable']) {
                            NotUpdateableFields.push(ActionMetadata[0]['fields'][i]['name']);
                        }
                        AllFieldsAPIName.push(ActionMetadata[0]['fields'][i]['name']);
                    }
                } catch (err2) {
                    //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                }
            }
            break;
        case 'STKR__Chlorination_Results__c':
            try {
                // For Analysis;AnalysisMeta object
                for (var i = 0; i < AnalysisMetadata['fields'].length; i++) {
                    if (!AnalysisMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(AnalysisMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(AnalysisMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                try {
                    for (var i = 0; i < AnalysisMetadata[0]['fields'].length; i++) {
                        if (!AnalysisMetadata[0]['fields'][i]['updateable']) {
                            NotUpdateableFields.push(AnalysisMetadata[0]['fields'][i]['name']);
                        }
                        AllFieldsAPIName.push(AnalysisMetadata[0]['fields'][i]['name']);
                    }
                } catch (err2) {
                    //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                }
            }
            break;
        case 'STKR__Service_Item__c':
            try {
                // Inspection Item; Need to crate InspectionItemMetadata
                for (var i = 0; i < InspectionItemMetadata['fields'].length; i++) {
                    if (!InspectionItemMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(InspectionItemMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(InspectionItemMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                for (var i = 0; i < InspectionItemMetadata[0]['fields'].length; i++) {
                    if (!InspectionItemMetadata[0]['fields'][i]['updateable']) {
                        NotUpdateableFields.push(InspectionItemMetadata[0]['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(InspectionItemMetadata[0]['fields'][i]['name']);
                }
            }
            break;
        case 'STKR__Prep_Waste__c':
            try {
                for (var i = 0; i < PrepWasteMetadata['fields'].length; i++) {
                    if (!PrepWasteMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(PrepWasteMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(PrepWasteMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
            }
            break;
        case 'STKR__Prep_Waste_Management__c':
            try {
                for (var i = 0; i < PrepWasteManagementMetadata['fields'].length; i++) {
                    // if (!PrepWasteManagementMetadata['fields'][i]['updateable'] && (OperationName === 'update' || PrepWasteManagementMetadata['fields'][i]['nillable'])) {
                    if (!PrepWasteManagementMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(PrepWasteManagementMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(PrepWasteManagementMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                try {
                    for (var i = 0; i < PrepWasteManagementMetadata[0]['fields'].length; i++) {
                        // if (!PrepWasteManagementMetadata[0]['fields'][i]['updateable'] && (OperationName === 'update' || PrepWasteManagementMetadata[0]['fields'][i]['nillable'])) {
                        if (!PrepWasteManagementMetadata['fields'][i]['updateable']) {
                            NotUpdateableFields.push(PrepWasteManagementMetadata[0]['fields'][i]['name']);
                        }
                        AllFieldsAPIName.push(PrepWasteManagementMetadata[0]['fields'][i]['name']);
                    }
                } catch (err2) {
                    //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
                }
            }
            break;
        case 'STKR__Service__c':
            try {
                // Schedule
                for (var i = 0; i < ScheduleMetadata['fields'].length; i++) {
                    if (!ScheduleMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(ScheduleMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(ScheduleMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
            }
            break;
        case 'STKR__Schedule_Items__c':
            try {
                // Schedule Item 
                for (var i = 0; i < ScheduleItemMetadata['fields'].length; i++) {
                    if (!ScheduleItemMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(ScheduleItemMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(ScheduleItemMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                //LogMoreErrorInfo(err, new Error().stack + '\n' + ObjectName);
            }
            break;
        case 'Event':
            try {
                // Event 
                for (var i = 0; i < EventsMetadata['fields'].length; i++) {
                    if (!EventsMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(EventsMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(EventsMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                for (var i = 0; i < EventsMetadata[0]['fields'].length; i++) {
                    if (!EventsMetadata[0]['fields'][i]['updateable']) {
                        NotUpdateableFields.push(EventsMetadata[0]['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(EventsMetadata[0]['fields'][i]['name']);
                }
            }
            break;
        case 'Contact':
            AllFieldsAPIName.push("Salutation");
            AllFieldsAPIName.push("FirstName");
            AllFieldsAPIName.push("LastName");
            AllFieldsAPIName.push("Title");
            AllFieldsAPIName.push("Email");
            AllFieldsAPIName.push("Phone");
            AllFieldsAPIName.push("MobilePhone");
            AllFieldsAPIName.push("AccountId");
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("STKR__Reference_Id__c");
            break;
        case 'STKR__Alerts__c':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("STKR__Contact__c");
            AllFieldsAPIName.push("STKR__Service_Contract__c");
            AllFieldsAPIName.push("STKR__Reference_Id__c");
            AllFieldsAPIName.push("STKR__Visits__c");
            AllFieldsAPIName.push("STKR__Account__c");
            AllFieldsAPIName.push("STKR__Service__c");
            break;
        case 'STKR__Resource_Geolocation__c':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("STKR__Resource__c");
            AllFieldsAPIName.push("STKR__Time__c");
            AllFieldsAPIName.push("STKR__Visit__c");
            AllFieldsAPIName.push("STKR__Visit_Status__c");
            AllFieldsAPIName.push("STKR__Location__Latitude__s");
            AllFieldsAPIName.push("STKR__Location__Longitude__s");
            break;
        case 'Attachment':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("ParentId");
            AllFieldsAPIName.push("Name");
            AllFieldsAPIName.push("Body");
            AllFieldsAPIName.push("ContentType");
            AllFieldsAPIName.push("Description");
            break;
        case 'Task':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("ActivityDate");
            AllFieldsAPIName.push("Subject");
            AllFieldsAPIName.push("WhatId");
            break;
        case 'Account':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("STKR__Location__Latitude__s");
            AllFieldsAPIName.push("STKR__Location__Longitude__s");
            break;
        case 'STKR__Billing__c':
            try {
                for (var i = 0; i < BillingMetadata['fields'].length; i++) {
                    if (!BillingMetadata['fields'][i]['updateable']) {
                        NotUpdateableFields.push(BillingMetadata['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(BillingMetadata['fields'][i]['name']);
                }
            } catch (err) {
                console.log(err);
                for (var i = 0; i < BillingMetadata[0]['fields'].length; i++) {
                    if (!BillingMetadata[0]['fields'][i]['updateable']) {
                        NotUpdateableFields.push(BillingMetadata[0]['fields'][i]['name']);
                    }
                    AllFieldsAPIName.push(BillingMetadata[0]['fields'][i]['name']);
                }
            }
            break;
        case 'STKR__Billing_Items__c':
            AllFieldsAPIName.push("Id");
            AllFieldsAPIName.push("STKR__Billing_Number__c");
            AllFieldsAPIName.push("STKR__Product__c");
            AllFieldsAPIName.push("STKR__Quantity__c");
            AllFieldsAPIName.push("STKR__Sales_Price__c");
            AllFieldsAPIName.push("STKR__Location__c");
            AllFieldsAPIName.push("STKR__Line_Description_Long__c");
            AllFieldsAPIName.push("STKR__Mobile_Unique_BillingId__c");
            break;
    }

    var job;
    // Updated this to do synchronous call 
    if (ObjectName === 'STKR__Service_Item__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__Mobile_Unique_Id__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'STKR__Inspection__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__UniqueId__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'STKR__Alerts__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__Reference_Id__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'Contact' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__Reference_Id__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'STKR__Billing__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__Mobile_Unique__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'STKR__Actions__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__Mobile_Unique_Id__c', concurrencyMode: 'Serial' });
    } else if (ObjectName === 'STKR__Vehicle_checks__c' && OperationName === 'upsert') {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { extIdField: 'STKR__MobileUniqueId__c', concurrencyMode: 'Serial' });
    } else {
        job = jsconn.bulk.createJob(ObjectName, OperationName, { concurrencyMode: 'Serial' });
    }

    var batch = job.createBatch();
    // Add fields which is not avilable in the DataToSend object with null value
    // this is added so that batch includes all the fields, not only the first record fields.

    // Important don't execute below code for object which don't have page on the app..
    //@todo: when new record inserts on app while online download the record immediately
    if (OperationName != "update") {
        var CustomObjectStandardFields = ["OwnerId", "Name"]
        try {
            for (var i = 0; i < DataToSend.length; i++) {
                for (var j = 0; j < AllFieldsAPIName.length; j++) {
                    var ObjectKeys = Object.keys(DataToSend[i]);
                    if (ObjectKeys.indexOf(AllFieldsAPIName[j]) == -1 && ObjectKeys.indexOf(AllFieldsAPIName[j].toLowerCase()) == -1) {
                        DataToSend[i][AllFieldsAPIName[j]] = null;

                        console.log("DefaultValues[ObjectName][AllFieldsAPIName[j]]", DefaultValues[ObjectName][AllFieldsAPIName[j]]);
                        if (DefaultValues[ObjectName] && DefaultValues[ObjectName][AllFieldsAPIName[j]] != null && DefaultValues[ObjectName][AllFieldsAPIName[j]].toString()) {
                            DataToSend[i][AllFieldsAPIName[j]] = DefaultValues[ObjectName][AllFieldsAPIName[j]];
                        }
                    }
                }

                //Don't allow user to update standard fields
                if (DataToSend[i].hasOwnProperty("OwnerId") && DataToSend[i]["OwnerId"] == null) {
                    delete DataToSend[i]["OwnerId"];
                }

                //Don't allow blank RecordTypeId field
                if (DataToSend[i].hasOwnProperty("RecordTypeId") && !DataToSend[i].RecordTypeId) {
                    delete DataToSend[i].RecordTypeId;
                }

                if (DataToSend[i].hasOwnProperty("CurrencyIsoCode") && !DataToSend[i].CurrencyIsoCode) {
                    delete DataToSend[i].CurrencyIsoCode;
                }

            }
        } catch (error) {
        }
    }
    console.log("DataToSend", DataToSend);
    //End

    for (var i = 0; i < DataToSend.length; i++) {
        for (var property in DataToSend[i]) {
            try {
                if (OperationName === 'insert' && ObjectName === 'STKR__Inspection__c' && (property === 'STKR__Visit__c' || property === 'STKR__Service_Item__c')) {
                    if (DataToSend[i]['STKR__Service_Item__c'] && DataToSend[i]['STKR__Service_Item__c'].length < 18) {
                        DataToSend[i]['STKR__Service_Item__c'] = null;
                    }
                    continue;
                }

                if (property !== 'Id' && NotUpdateableFields.indexOf(property) > -1) {
                    if (OperationName === 'insert' && ObjectName === 'STKR__Prep_Waste_Management__c' && property === 'STKR__Visit__c') {
                    } else if (OperationName === 'insert' && ObjectName === 'STKR__Inspection__c' && property === 'STKR__Service_Item__c') {
                    } else if (OperationName === 'insert' && ObjectName === 'STKR__Actions__c' && property === 'STKR__Account__c') {
                    } else {
                        delete DataToSend[i][property];
                    }
                }
            } catch (err) {
                console.error(err, OperationName, ObjectName, DataToSend[i], property);
                break;
            }
            try {
                if (ObjectName === 'STKR__Alerts__c' && property === 'STKR__Contact__c') {
                    if (DataToSend[i]['STKR__Contact__c'] && DataToSend[i]['STKR__Contact__c'].length < 18) {
                        DataToSend[i]['STKR__Contact__c'] = null;
                    }
                }
            } catch (err) { }

            try {
                if ((OperationName === 'insert' || OperationName === 'upsert') && ObjectName === 'Contact' && property === 'Id') {
                    delete DataToSend[i]['Id']
                }
            } catch (err) { }

            try {
                if ((OperationName === 'insert' || OperationName === 'upsert') && ObjectName === 'STKR__Vehicle_checks__c' && property === 'Id') {
                    delete DataToSend[i]['Id']
                }
            } catch (err) { }

            try {
                if ((OperationName === 'insert' || OperationName === 'upsert') && ObjectName === 'STKR__Actions__c' && property === 'Id') {
                    delete DataToSend[i]['Id']
                }
            } catch (err) { }
            try {
                if (ObjectName === 'STKR__Billing_Items__c' && property === 'STKR__Billing_Number__c' && DataToSend[i][property] && DataToSend[i][property].length < 18) {
                    delete DataToSend[i][property];
                }
            } catch (a) {
            }
            try {
                if ((OperationName === 'insert' || OperationName === 'upsert') && ObjectName === 'STKR__Billing__c' && property === 'Id') {
                    delete DataToSend[i]['Id']
                }
            } catch (err) { }
            try {
                if ((OperationName === 'insert' || OperationName === 'upsert') && ObjectName === 'STKR__Chlorination_Results__c' && property === 'STKR__Inspection__c') {
                    if (DataToSend[i]['STKR__Inspection__c'] && DataToSend[i]['STKR__Inspection__c'].length < 18) {
                        DataToSend[i]['STKR__Inspection__c'] = null;
                    }
                }
            } catch (err) {
            }

            try {
                // Delete RecordType before sending to salesforce.. 
                if (ObjectName === 'STKR__Service_Item__c' && property === 'RecordType') {
                    if (DataToSend[i]['RecordTypeId'])
                        delete DataToSend[i]['RecordType'];
                }
            } catch (eer) {
                console.log('Error Inspection Item RecordType', eer);
            }

            try {
                if (ObjectName === 'STKR__Actions__c' && property === 'STKR__Service_Item__c' && DataToSend[i][property] && DataToSend[i][property].length < 18) {
                    delete DataToSend[i][property];
                }
            } catch (a) {
            }

            try {
                if (ObjectName === 'STKR__Inspection__c' && property === 'STKR__Service_Item__c' && DataToSend[i][property] && DataToSend[i][property].length < 18) {
                    delete DataToSend[i][property];
                }
            } catch (a) {
            }

            try {
                if (ObjectName == 'STKR__Prep_Waste_Management__c' && property == 'STKR__Inspection__c') {
                    if (DataToSend[i]['STKR__Inspection__c'] && DataToSend[i]['STKR__Inspection__c'].toString().length < 18) {
                        DataToSend[i]['STKR__Inspection__c'] = null;
                    }
                }
            } catch (err) { }

            if (OperationName == 'delete' && property != 'Id') {
                delete DataToSend[i][property];
            }

        }
        try {
            if (OperationName === 'insert') {
                delete DataToSend[i]['Id'];
                /*if (ObjectName === 'STKR__Inspection__c') {
                delete DataToSend[i]['STKR__Service_Item__c'];
                }*/
            }
            if (OperationName === 'upsert' && (ObjectName === 'STKR__Service_Item__c' ||
                ObjectName === 'STKR__Alerts__c' ||
                ObjectName === 'STKR__Chlorination_Results__c' ||
                ObjectName === 'STKR__Inspection__c' ||
                ObjectName === 'STKR__Actions__c' ||
                ObjectName === 'Contact')) {
                if (DataToSend[i]['Id'].toString().length < 18)
                    delete DataToSend[i]['Id'];
            }
        } catch (a) {
            console.log(a);
        }
        try {
            if (OperationName === 'update' && ObjectName === 'STKR__Actions__c') {
                delete DataToSend[i]['stkr__account__c'];
            }
        } catch (a) {
        }
    }

    // Check if any field deleted/changed on salesforce
    try {
        for (var i = 0; i < DataToSend.length; i++) {
            for (property in DataToSend[i]) {
                var canDelete = true;
                for (var j = 0; j < AllFieldsAPIName.length; j++) {
                    if (AllFieldsAPIName[j].toLowerCase() === property.toLowerCase()) {
                        canDelete = false;
                    }
                }
                if (canDelete) {
                    delete DataToSend[i][property];
                }
                /* if (AllFieldsAPIName.indexOf(property) === -1) {
                delete DataToSend[i][property];
                }*/
            }
        }
    } catch (error) {
    }

    console.log('DataToSend', OperationName, ObjectName, DataToSend);
    try {
        batch.execute(DataToSend);
    } catch (err) {
        console.log('DataToSend Error', err);
    }

    batch.on("queue", function (batchInfo) {
        // fired when batch request is queued in server.
        batchId = batchInfo.id;
        jobId = batchInfo.jobId;

        var job = jsconn.bulk.job(jobId);
        var batch = job.batch(batchId);
        batch.poll(1000, 20000); // start polling
        batch.on("response", function (rets) {
            // fired when batch finished and result retrieved
            console.log('Batch Result', rets);
            //*** To Add in store errors
            if (rets) {
                for (var i = 0; i < rets.length; i++) {
                    if (rets[i]['success']) {
                        //app.deleteRecord('DataToUpdate', rets[i]['id']);
                        /*app.db.transaction(function (tx) {
                        tx.executeSql("DELETE FROM DataToUpdate WHERE objectname = ?", [ObjectName],
                        app.onSuccess,
                        app.onError);
                        });*/
                        function DeleteSyncedData(data) {
                            app.db.transaction(function (tx) {
                                tx.executeSql("DELETE FROM DataToUpdate WHERE recordid = ?", [data['Id']],
                                    app.onSuccess,
                                    app.onError);
                            });
                        }
                        try {
                            // For Event start work / end work
                            if (DataToSendOriginal[i]['Subject'] === 'Start Work') {
                                window.localStorage.setItem("Eventid", rets[i]['id']);
                            }
                        } catch (er) {
                        }

                        DeleteSyncedData(DataToSendOriginal[i]);
                    } else {
                        app.toastMessage('Some records are not being uploaded, Please use View Offline Data page to upload', 'long');
                        try {
                            LogMoreErrorInfo(rets, new Error().stack + '\n' + ObjectName);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
            }

            BatchCompleted++;
            if (TotalBatchToComplete === BatchCompleted) {
                UploadVisitData();
            }
            job.close();
        });
    });
}

function UploadOfflineImages(ObjectName, DataToSend, OperationName) {
    // console.log('DataToSend images', DataToSend);
    var UploadedImages = 0;
    var OfflineImageToUpload = DataToSend.length;
    var ImageListMessage = 'Offline data uploaded';
    function UploadIndividualImage(ImageData) {
        var Offlinedata = {
            ParentId: ImageData.ParentId,
            Name: ImageData.Name,
            Body: ImageData.Body,
            ContentType: ImageData.ContentType
        }
        if (ImageData.Description) {
            Offlinedata['Description'] = ImageData.Description;
        }
        //console.log('Offline Attachment', Offlinedata);
        fetchBase64(Offlinedata['Body'], function (iData) {
            var originalOfflineData = Object.assign({}, Offlinedata)
            Offlinedata['Body'] = iData;
            //console.log('iData', Offlinedata, iData);
            jsconn.sobject(ObjectName).create(Offlinedata, function (err, ret) {
                if (err || !ret.success) {
                    UploadedImages++;
                    if (UploadedImages === OfflineImageToUpload) {
                        BatchCompleted++;
                    }
                    app.toastMessage('Error while uploading attachment:\n' + JSON.stringify(err), 'long');
                    try {
                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: ImageListMessage, count: 0, iserror: false }]);
                    } catch (er) {
                    }

                    if (TotalBatchToComplete === BatchCompleted) {
                        UploadVisitData();
                    }
                    return console.error(err, ret);
                }
                //Delete image from storage
                try {
                    window.resolveLocalFileSystemURL(originalOfflineData.Body, function (cachedFile) {
                        cachedFile.remove(function (dSuccess) {
                            console.log('Delete successfully!!', dSuccess);
                        }, function (error) {
                            console.error('Error while deleting the cached file!!', error)
                        });
                    });
                } catch (err) {
                    console.error(err);
                }

                //console.log('Uploaded Images : ' + UploadedImages +'\nOfflineImageToUpload : '+ OfflineImageToUpload +'\nBatch Completed : '+ BatchCompleted);

                app.db.transaction(function (tx) {
                    //console.log('deleting the record ',JSON.stringify(Offlinedata));
                    tx.executeSql("DELETE FROM DataToUpdate WHERE jsondata = ?", [JSON.stringify(originalOfflineData)],
                        app.onSuccess,
                        app.onError);
                });
                UploadedImages++;
                if (UploadedImages === OfflineImageToUpload) {
                    BatchCompleted++;
                }
                if (TotalBatchToComplete === BatchCompleted) {
                    // Download New Data
                    try {
                        $("#ListViewForDownloadingData").data("kendoMobileListView").append([{ message: ImageListMessage, count: 0, iserror: false }]);
                    } catch (er) {
                    }
                    UploadVisitData();
                }
                //console.log('Uploaded Images : ' + UploadedImages +'\nOfflineImageToUpload : '+ OfflineImageToUpload +'\nBatch Completed : '+ BatchCompleted);
            });
        }, ImageData.ContentType);
    }
    for (var i = 0; i < DataToSend.length; i++) {
        UploadIndividualImage(DataToSend[i]);
    }
}

function changeVisitColor() {
    $('ul li:has(div.followupvisitcolor)').addClass('followupvisitcolor');
    $('ul li:has(div.calloutvisitcolor)').addClass('calloutvisitcolor');
    $('ul li:has(div.jobvisitcolor)').addClass('jobvisitcolor');
    $('ul li:has(div.routinevisitcolor)').addClass('routinevisitcolor');
    $('ul li:has(div.contractvisitcolor)').addClass('contractvisitcolor');
    $('ul li:has(div.fixedvisitcolor)').addClass('fixedvisitcolor');
    $('ul li:has(div.eventcolor)').css('background', bgcolor);
    $('ul li:has(div.neweventcolor)').css('background', 'white');
    $('div.neweventcolor').css('background', 'white');
    ColChange();
    $('li.followupvisitcolor').css('border-bottom-width', '1px');
    $('li.calloutvisitcolor').css('border-bottom-width', '1px');
    $('li.jobvisitcolor').css('border-bottom-width', '1px');
    $('li.routinevisitcolor').css('border-bottom-width', '1px');
    $('li.contractvisitcolor').css('border-bottom-width', '1px');
    $('li.fixedvisitcolor').css('border-bottom-width', '1px');
    $('li.eventcolor').css('border-bottom-width', '1px');
    $('li.neweventcolor').css('border-bottom-width', '1px');

    $('li.followupvisitcolor').css('border-bottom-color', 'black');
    $('li.calloutvisitcolor').css('border-bottom-color', 'black');
    $('li.jobvisitcolor').css('border-bottom-color', 'black');
    $('li.routinevisitcolor').css('border-bottom-color', 'black');
    $('li.contractvisitcolor').css('border-bottom-color', 'black');
    $('li.fixedvisitcolor').css('border-bottom-color', 'black');
    $('li.eventcolor').css('border-bottom-color', 'black');
    $('li.neweventcolor').css('border-bottom-color', 'black');
}

function showFilterVisitModalView() {
    $("#modalview-filter").kendoMobileModalView("open");
}

function GotoShowVisitsmap() {
    if (!currentTab) {
        currentTab = 'Overdue';
    }
    if (navigator.onLine) {
        app.navigate('view/ShowVisitsMap.html')
    } else {
        app.toastMessage("Device is offline. Please turn on Internet to see the map", 'long');
    }
}
function GotoMyVisitsPage(){
    if (!UserCurrentLocation_WatchId) {
        app.toastMessage('GPS is off, please enable it to move forward', 'long');
        return;
    }else{
        app.navigate('view/myvisits.html');
    }
   
}

function GotoSearchVisitPage(){
    if (!UserCurrentLocation_WatchId) {
        app.toastMessage('GPS is off, please enable it to move forward', 'long');
        return;
    }else{
        app.navigate('view/Searchvisits.html');
    } 
}

function FilterVisits() {
    newVisitData = [];
    var countnewvisit = 0;
    var filtername = $('Input[name="filter"]:checked').val();
    var teritorryData = [];
    var filternameInput = $('Input[id="ModelViewTextserviceterritory"]').val();
    for (var j = 0; j < ScheduleData.length; j++) {
        if (ScheduleData[j]['STKR__Account__r']['STKR__Territory__r'] != null) {
            if ((ScheduleData[j]['STKR__Account__r']['STKR__Territory__r']['Name'].toLowerCase()).match(filternameInput.toLowerCase())) {
                LOG && console.log('matched');
                teritorryData.push(ScheduleData[j]['STKR__Account__r']['STKR__Territory__r']['Id'].substring(0, 15));
            }
        }
    }
    if (currentTab === 'Overdue') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'Service Territory') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                for (var pq = 0; pq < teritorryData.length; pq++) {
                    if ((teritorryData[pq].indexOf(VisitOverdue[i]['STKR__Territory__c']) > -1)) {
                        newVisitData[countnewvisit++] = VisitOverdue[i]
                        //LOG && console.log(teritorryData[i])
                    }
                }
            }
        } else {
            newVisitData = VisitOverdue;
        }
        try {
            $("#ListViewForVisitOverdue_oldestsort").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Overdue_NewestSort') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitOverdue.length; i++) {
                if (VisitOverdue[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitOverdue[i];
                }
            }
        } else {
            newVisitData = VisitOverdue;
        }
        try {
            $("#ListViewForVisitOverdue_newestsort").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Today') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitToday.length; i++) {
                if (VisitToday[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitToday[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitToday.length; i++) {
                if (VisitToday[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitToday[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitToday.length; i++) {
                if (VisitToday[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitToday[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitToday.length; i++) {
                if (VisitToday[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitToday[i];
                }
            }
        } else if (filtername === 'Events') {
            newVisitData = EventsToday;
        } else {
            //newVisitData = VisitToday;
            manuallySortTheTodayList(null, null, true);

            changeVisitColor();
            $("#modalview-filter").kendoMobileModalView("close");
            return;
        }
        try {
            $("#ListViewForVisitToday").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'This Week') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitThisWeek.length; i++) {
                if (VisitThisWeek[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitThisWeek[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitThisWeek.length; i++) {
                if (VisitThisWeek[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitThisWeek[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitThisWeek.length; i++) {
                if (VisitThisWeek[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitThisWeek[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitThisWeek.length; i++) {
                if (VisitThisWeek[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitThisWeek[i];
                }
            }
        } else if (filtername === 'Events') {
            newVisitData = EventsThisWeek;
        } else {
            newVisitData = VisitThisWeek;
        }
        try {
            //1234
            tempWeekDaysSeq = returnWeekDays();
            $("#ListViewForVisitThisWeek").kendoMobileListView({
                dataSource: {
                    data: newVisitData,
                    schema: {
                        parse: function (data) {
                            if (device.platform === "Android") {
                                for (var i = 0; i < data.length; i++) {
                                    // Make today dayNumber = 0 , tomorrow = 1 and so on
                                    var curDay = new Date(data[i]['STKR__Due_Date__c']).getDay();
                                    curDay = curDay - new Date().getDay();
                                    if (curDay < 0) {
                                        data[i].dayNumber = curDay + 7;
                                    } else {
                                        data[i].dayNumber = curDay;
                                    }
                                }
                            } else if (device.platform === "iOS") {
                                for (var i = 0; i < data.length; i++) {
                                    var curDay_ios = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]).getDay();
                                    curDay_ios = curDay_ios - new Date().getDay();
                                    if (curDay_ios < 0) {
                                        data[i].dayNumber = curDay_ios + 7;
                                    } else {
                                        data[i].dayNumber = curDay_ios;
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    group: { field: "dayNumber" }
                },
                template: $('#ListViewForVisitTemplate').text(),
                headerTemplate: "#:tempWeekDaysSeq[value]#",
                fixedHeaders: true
            });
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Within 45') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitWithin45.length; i++) {
                if (VisitWithin45[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitWithin45[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitWithin45.length; i++) {
                if (VisitWithin45[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitWithin45[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitWithin45.length; i++) {
                if (VisitWithin45[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitWithin45[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitWithin45.length; i++) {
                if (VisitWithin45[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitWithin45[i];
                }
            }
        } else if (filtername === 'Events') {
            newVisitData = EventsWithin45;
        } else {
            newVisitData = combineVisitandEvent(VisitWithin45, EventsWithin45)
        }
        try {
            WCMondays = [];
            $("#ListViewForVisitWithin45Days").kendoMobileListView({
                dataSource: {
                    data: newVisitData,
                    sort: { field: "STKR__Due_Date__c", dir: "asc" },
                    schema: {
                        parse: function (data) {
                            // Group by week not day
                            if (device.platform === "Android") {
                                for (var i = 0; i < data.length; i++) {
                                    var tempdate = new Date(data[i]['STKR__Due_Date__c']);
                                    var WeekNumber = tempdate.getWeek();
                                    data[i].date = WeekNumber;

                                    var MondayDate = getMonday(tempdate);
                                    WCMondays[WeekNumber] = MondayDate.getDate() + '/' +
                                        (MondayDate.getMonth() + 1) + '/' +
                                        MondayDate.getFullYear();
                                }
                            } else if (device.platform === "iOS") {
                                for (var i = 0; i < data.length; i++) {
                                    var tempdate;
                                    if (typeof (data[i]['STKR__Due_Date__c']) == "object") {
                                        tempdate = data[i]['STKR__Due_Date__c'];
                                    } else {
                                        tempdate = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]);
                                    }
                                    var WeekNumber = tempdate.getWeek();
                                    data[i].date = WeekNumber;
                                    var MondayDate = getMonday(tempdate);
                                    WCMondays[WeekNumber] = MondayDate.getDate() + '/' +
                                        (MondayDate.getMonth() + 1) + '/' +
                                        MondayDate.getFullYear();
                                }
                            }
                            return data;
                        }
                    },
                    group: { field: "date" }
                },
                template: $('#ListViewForVisitTemplate').text(),
                headerTemplate: "W/C Monday #:WCMondays[value]#",
                fixedHeaders: true
            });
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Complete') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitCompleted.length; i++) {
                if (VisitCompleted[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitCompleted[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitCompleted.length; i++) {
                if (VisitCompleted[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitCompleted[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitCompleted.length; i++) {
                if (VisitCompleted[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitCompleted[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitCompleted.length; i++) {
                if (VisitCompleted[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitCompleted[i];
                }
            }
        } else {
            newVisitData = VisitCompleted;
        }
        try {
            $("#ListViewForVisitComplete").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Nearby') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < VisitNearby.length; i++) {
                if (VisitNearby[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = VisitNearby[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < VisitNearby.length; i++) {
                if (VisitNearby[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = VisitNearby[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < VisitNearby.length; i++) {
                if (VisitNearby[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = VisitNearby[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < VisitNearby.length; i++) {
                if (VisitNearby[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = VisitNearby[i];
                }
            }
        } else {
            newVisitData = VisitNearby;
        }
        try {
            $("#ListViewForVisitNearby").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    } else if (currentTab === 'Nearby_OtherUsers') {
        if (filtername === 'Job Visit' ||
            filtername === 'Call Out' ||
            filtername === 'Follow-Up') {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                if (NearbyVisitDataNotOwned[i]['STKR__Visit_Type__c'] === filtername) {
                    newVisitData[countnewvisit++] = NearbyVisitDataNotOwned[i];
                }
            }
        } else if (filtername === 'In Progress') {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                if (NearbyVisitDataNotOwned[i]['STKR__Status__c'] === 'In Progress') {
                    newVisitData[countnewvisit++] = NearbyVisitDataNotOwned[i];
                }
            }
        } else if (filtername === 'Routines') {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                if (NearbyVisitDataNotOwned[i]['STKR__Visit_Type__c'] === 'Contract Visit') {
                    newVisitData[countnewvisit++] = NearbyVisitDataNotOwned[i];
                }
            }
        } else if (filtername === 'Fixed Visit') {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                if (NearbyVisitDataNotOwned[i]['STKR__Fixed_Visit__c']) {
                    newVisitData[countnewvisit++] = NearbyVisitDataNotOwned[i];
                }
            }
        } else {
            newVisitData = NearbyVisitDataNotOwned;
        }
        try {
            $("#ListViewForVisitNearby_otherusers").data("kendoMobileListView").replace(newVisitData);
        } catch (err) {
            LOG && console.log(err);
        }
    }
    changeVisitColor();
    $("#modalview-filter").kendoMobileModalView("close");
}

/* function ShowSortVisitModalView() {
    $("#modalview-sort").kendoMobileModalView("open");
}*/

function closeModalViewFilter() {
    $("#modalview-filter").kendoMobileModalView("close");
}

/*function SortVisits(sortby) {
    function ByDate(sortedvisitdata) {
        if (device.platform === "Android") {
            // Oldest date first
            for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
                for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                    if (new Date(sortedvisitdata[Index2]['STKR__Due_Date__c']).getTime() < new Date(sortedvisitdata[Index2 + 1]['STKR__Due_Date__c']).getTime()) {
                        var tempvisit = sortedvisitdata[Index2];
                        sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                        sortedvisitdata[Index2 + 1] = tempvisit;
                    }
                }
            }
        }
        if (device.platform === "iOS") {
            for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
                for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                    if (((new Date((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0]).split('-')[0], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0].split('-')[1]), (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0]).split('-')[2], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[0], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[1], ((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[2]).split('.')[0], ((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split('.')[1]).split('+')[0])).getTime()) < ((new Date((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0]).split('-')[0], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0].split('-')[1]), (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0]).split('-')[2], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[0], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[1], ((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[2]).split('.')[0], ((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split('.')[1]).split('+')[0])).getTime())) {
                        //(new Date(sortedvisitdata[Index2]['STKR__Due_Date__c']).getTime() < new Date(sortedvisitdata[Index2 + 1]['STKR__Due_Date__c']).getTime()) {
                        var tempvisit = sortedvisitdata[Index2];
                        sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                        sortedvisitdata[Index2 + 1] = tempvisit;
                    }
                }
            }
        }
        return sortedvisitdata;
    }
    function ByDatedesc(sortedvisitdata) {
        // newest data first
        if (device.platform === "Android") {
            for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
                for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                    if (new Date(sortedvisitdata[Index2]['STKR__Due_Date__c']).getTime() > new Date(sortedvisitdata[Index2 + 1]['STKR__Due_Date__c']).getTime()) {
                        var tempvisit = sortedvisitdata[Index2];
                        sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                        sortedvisitdata[Index2 + 1] = tempvisit;
                    }
                }
            }
        }
        if (device.platform === "iOS") {
            for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
                for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                    if (((new Date((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0]).split('-')[0], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0].split('-')[1]), (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[0]).split('-')[2], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[0], (sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[1], ((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split(':')[2]).split('.')[0], ((sortedvisitdata[Index2]['STKR__Due_Date__c'].split('T')[1]).split('.')[1]).split('+')[0])).getTime()) > ((new Date((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0]).split('-')[0], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0].split('-')[1]), (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[0]).split('-')[2], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[0], (sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[1], ((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split(':')[2]).split('.')[0], ((sortedvisitdata[Index2 + 1]['STKR__Due_Date__c'].split('T')[1]).split('.')[1]).split('+')[0])).getTime())) {
                        //(new Date(sortedvisitdata[Index2]['STKR__Due_Date__c']).getTime() < new Date(sortedvisitdata[Index2 + 1]['STKR__Due_Date__c']).getTime()) {
                        var tempvisit = sortedvisitdata[Index2];
                        sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                        sortedvisitdata[Index2 + 1] = tempvisit;
                    }
                }
            }
        }
        return sortedvisitdata;
    }
    function SortByNameAsc(sortedvisitdata) {
        for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
            for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                if (sortedvisitdata[Index2]['Name'] > sortedvisitdata[Index2 + 1]['Name']) {
                    var tempvisit = sortedvisitdata[Index2];
                    sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                    sortedvisitdata[Index2 + 1] = tempvisit;
                }
            }
        }
        return sortedvisitdata;
    }
    function SortByNameDesc(sortedvisitdata) {
        for (var Index1 = 0; Index1 < sortedvisitdata.length; Index1++) {
            for (var Index2 = 0; Index2 < sortedvisitdata.length - Index1 - 1; Index2++) {
                if (sortedvisitdata[Index2]['Name'] < sortedvisitdata[Index2 + 1]['Name']) {
                    var tempvisit = sortedvisitdata[Index2];
                    sortedvisitdata[Index2] = sortedvisitdata[Index2 + 1];
                    sortedvisitdata[Index2 + 1] = tempvisit;
                }
            }
        }
        return sortedvisitdata;
    }
    var sortedvisitdata = null;
    if (currentTab === 'Overdue') {
        sortedvisitdata = VisitOverdue;
        if (sortby === 'NewestDueDate') {
            sortedvisitdata = ByDatedesc(sortedvisitdata);
        } else if (sortby === 'OldestDueDate') {
            sortedvisitdata = ByDate(sortedvisitdata);
        } else if (sortby === 'VisitNumberDes') {
            sortedvisitdata = SortByNameDesc(sortedvisitdata);
        } else if (sortby === 'VisitNumberAsc') {
            sortedvisitdata = SortByNameAsc(sortedvisitdata);
        }
        try {
            $("#ListViewForVisitOverdue").data("kendoMobileListView").replace(sortedvisitdata);
        } catch (err) {
            LOG && console.log(err);
        }
        $("#modalview-sort").kendoMobileModalView("close");
    } else if (currentTab === 'Today') {
        sortedvisitdata = VisitToday;
        if (sortby === 'NewestDueDate') {
            sortedvisitdata = ByDatedesc(sortedvisitdata);
        } else if (sortby === 'OldestDueDate') {
            sortedvisitdata = ByDate(sortedvisitdata);
        } else if (sortby === 'VisitNumberDes') {
            sortedvisitdata = SortByNameDesc(sortedvisitdata);
        } else if (sortby === 'VisitNumberAsc') {
            sortedvisitdata = SortByNameAsc(sortedvisitdata);
        }
        try {
            $("#ListViewForVisitToday").data("kendoMobileListView").replace(sortedvisitdata);
        } catch (err) {
            LOG && console.log(err);
        }
        $("#modalview-sort").kendoMobileModalView("close");
    } else if (currentTab === 'This Week') {
        sortedvisitdata = VisitThisWeek;
        if (sortby === 'NewestDueDate') {
            //sortedvisitdata = ByDatedesc(sortedvisitdata);
            VisitThisWeek.sort(function (a, b) {
                return new Date(a.STKR__Due_Date__c) - new Date(b.STKR__Due_Date__c);
            });
        } else if (sortby === 'OldestDueDate') {
            //sortedvisitdata = ByDate(sortedvisitdata);
            VisitThisWeek.sort(function (a, b) {
                return new Date(b.STKR__Due_Date__c) - new Date(a.STKR__Due_Date__c);
            });
        } else if (sortby === 'VisitNumberDes') {
            // New Requirement don't call it
            //sortedvisitdata = SortByNameDesc(sortedvisitdata);
        } else if (sortby === 'VisitNumberAsc') {
            //// New Requirement don't call it
            //sortedvisitdata = SortByNameAsc(sortedvisitdata);
        }

        try {
            tempWeekDaysSeq = returnWeekDays();
            $("#ListViewForVisitThisWeek").kendoMobileListView({
                dataSource: {
                    data: VisitThisWeek,
                    schema: {
                        parse: function (data) {
                            if (device.platform === "Android") {
                                for (var i = 0; i < data.length; i++) {
                                    // Make today dayNumber = 0 , tomorrow = 1 and so on
                                    var curDay = new Date(data[i]['STKR__Due_Date__c']).getDay();
                                    curDay = curDay - new Date().getDay();
                                    if (curDay < 0) {
                                        data[i].dayNumber = curDay + 7;
                                    } else {
                                        data[i].dayNumber = curDay;
                                    }
                                }
                            } else if (device.platform === "iOS") {
                                for (var i = 0; i < data.length; i++) {
                                    var curDay_ios = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]).getDay();
                                    curDay_ios = curDay_ios - new Date().getDay();
                                    if (curDay_ios < 0) {
                                        data[i].dayNumber = curDay_ios + 7;
                                    } else {
                                        data[i].dayNumber = curDay_ios;
                                    }
                                }
                            }
                            return data;
                        }
                    },
                    group: { field: "dayNumber" }
                },
                template: $('#ListViewForVisitTemplate').text(),
                headerTemplate: "#:tempWeekDaysSeq[value]#",
                fixedHeaders: true
            });
            //$("#ListViewForVisitThisWeek").data("kendoMobileListView").replace(sortedvisitdata);
        } catch (err) {
            LOG && console.log(err);
        }
        $("#modalview-sort").kendoMobileModalView("close");
    } else if (currentTab === 'Within 45') {
        sortedvisitdata = VisitWithin45;
        var SortingFieldAndOrder = {};

        if (sortby === 'NewestDueDate') {
            //sortedvisitdata = ByDatedesc(sortedvisitdata);
            SortingFieldAndOrder = { field: "STKR__Due_Date__c", dir: "desc" };
        } else if (sortby === 'OldestDueDate') {
            //sortedvisitdata = ByDate(sortedvisitdata);
            SortingFieldAndOrder = { field: "STKR__Due_Date__c", dir: "asc" };
        } else if (sortby === 'VisitNumberDes') {
            //sortedvisitdata = SortByNameDesc(sortedvisitdata);
            SortingFieldAndOrder = { field: "Name", dir: "desc" };
        } else if (sortby === 'VisitNumberAsc') {
            //sortedvisitdata = SortByNameAsc(sortedvisitdata);
            SortingFieldAndOrder = { field: "Name", dir: "asc" };
        }
        try {
            WCMondays = {};
            $("#ListViewForVisitWithin45Days").kendoMobileListView({
                dataSource: {
                    data: VisitWithin45,
                    sort: SortingFieldAndOrder,
                    schema: {
                        parse: function (data) {
                            // Group by week not day
                            if (device.platform === "Android") {
                                for (var i = 0; i < data.length; i++) {
                                    var tempdate = new Date(data[i]['STKR__Due_Date__c']);
                                    var WeekNumber = tempdate.getWeek();
                                    data[i].date = WeekNumber;
                                    var MondayDate = getMonday(tempdate);
                                    WCMondays[WeekNumber] = MondayDate.getDate() + '/' +
                                        (MondayDate.getMonth() + 1) + '/' +
                                        MondayDate.getFullYear();
                                }
                            } else if (device.platform === "iOS") {
                                for (var i = 0; i < data.length; i++) {
                                    var tempdate;
                                    if (typeof (data[i]['STKR__Due_Date__c']) == "object") {
                                        tempdate = data[i]['STKR__Due_Date__c'];
                                    } else {
                                        tempdate = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]);
                                    }
                                    var WeekNumber = tempdate.getWeek();
                                    data[i].date = WeekNumber;
                                    var MondayDate = getMonday(tempdate);
                                    WCMondays[WeekNumber] = MondayDate.getDate() + '/' +
                                        (MondayDate.getMonth() + 1) + '/' +
                                        MondayDate.getFullYear();
                                }
                            }
                            return data;
                        }
                    },
                    group: { field: "date" }
                },
                template: $('#ListViewForVisitTemplate').text(),
                headerTemplate: "W/C Monday #:WCMondays[value]#",
                fixedHeaders: true
            });
        } catch (err) {
            LOG && console.log(err);
        }

        $("#modalview-sort").kendoMobileModalView("close");
    } else if (currentTab === 'Complete') {
        sortedvisitdata = VisitCompleted;
        if (sortby === 'NewestDueDate') {
            sortedvisitdata = ByDatedesc(sortedvisitdata);
        } else if (sortby === 'OldestDueDate') {
            sortedvisitdata = ByDate(sortedvisitdata);
        } else if (sortby === 'VisitNumberDes') {
            sortedvisitdata = SortByNameDesc(sortedvisitdata);
        } else if (sortby === 'VisitNumberAsc') {
            sortedvisitdata = SortByNameAsc(sortedvisitdata);
        }
        try {
            $("#ListViewForVisitComplete").data("kendoMobileListView").replace(sortedvisitdata);
        } catch (err) {
            LOG && console.log(err);
        }
        $("#modalview-sort").kendoMobileModalView("close");
    }
    changeVisitColor();
}*/


function showPosition(position) {
    var MapAccountIdToAccountDetail = {};
    if (currentTab === 'Nearby') {
        $('#MessageOfVisitNearby').empty();
    } else {
        $('#MessageOfVisitNearby_otherusers').empty();
    }
    for (var i = 0; i < AllVisits.length; i++) {
        if (!(AllVisits[i]['STKR__Status__c'] === 'Complete')) {
            if (!MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']]) {
                for (var j = 0; j < AllAccounts.length; j++) {
                    if (AllAccounts[j]['Id'] === AllVisits[i]['STKR__Account_lkp__c']) {
                        MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']] = AllAccounts[j];
                        if (AllAccounts[j]['STKR__location__Latitude__s'] && AllAccounts[j]['STKR__location__Longitude__s']) {
                            var frm = {
                                lat1: { value: position.coords.latitude },
                                lon1: { value: position.coords.longitude },
                                lat2: { value: AllAccounts[j]['STKR__location__Latitude__s'] },
                                lon2: { value: AllAccounts[j]['STKR__location__Longitude__s'] },
                                km: { value: null },
                                mi: { value: null }
                            };

                            findDistance(frm, AllVisits[i], 'nearby');
                        }
                    }
                }
            } else {
                if (MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']]['STKR__location__Latitude__s'] && MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']]['STKR__location__Longitude__s']) {
                    var frm = {
                        lat1: { value: position.coords.latitude },
                        lon1: { value: position.coords.longitude },
                        lat2: { value: MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']]['STKR__location__Latitude__s'] },
                        lon2: { value: MapAccountIdToAccountDetail[AllVisits[i]['STKR__Account_lkp__c']]['STKR__location__Longitude__s'] },
                        km: { value: null },
                        mi: { value: null }

                    };

                    findDistance(frm, AllVisits[i], 'nearby');
                }
            }
        }
    }
    if (VisitNearby.length) {
        // Sort VisitNearby Array
        VisitNearby.sort(function (a, b) {
            return a.RadiusInKM - b.RadiusInKM;
        });
        //VisitNearby.sort(compare);
        // Delete the extra field
        for (var objProp in VisitNearby) {
            if (objProp == 'RadiusInKM') {
                delete VisitNearby['RadiusInKM'];
            }
        }
        try {
            $("#ListViewForVisitNearby").data("kendoMobileListView").replace(VisitNearby);
        } catch (err) {
            LOG && console.log(err);
        }
    } else {
        var ShowPlaceholder = $('<p>').text("This list is empty. Please use the 'Refresh All Data' option on the main menu")
        ShowPlaceholder.css('color', 'grey');
        ShowPlaceholder.css('position', 'absolute');
        ShowPlaceholder.css('top', '50%');
        $('#MessageOfVisitNearby').html(ShowPlaceholder)
    }
    app.pane.loader.hide();
    changeVisitColor();

    //STKR__UserId__c !=null AND 
    // Download all nearby visits
    if (navigator.onLine && ShowAllVisitsSettings.STKR__Visibility__c) {
        jsconn.sobject("STKR__Visit__c")
            .select("*,STKR__Account_lkp__r.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Id, STKR__Account_lkp__r.Parent.Parent.Parent.Id")
            .where("STKR__Account_lkp__r.STKR__Status__c='Active' AND STKR__Not_Owned_by_Current_User_and_Active__c='TRUE' AND STKR__DUE_DATE__C <= NEXT_N_DAYS:46 AND STKR__STATUS__C = 'OPEN' AND DISTANCE(STKR__Account_lkp__r.STKR__location__c, GEOLOCATION(" + position.coords.latitude + "," + position.coords.longitude + "), 'km') < " + getRadius + " ORDER BY DISTANCE(STKR__Account_lkp__r.STKR__location__c, GEOLOCATION(" + position.coords.latitude + "," + position.coords.longitude + "), 'km') ASC")
            .run({ autoFetch: true }, function (err, records) {
                if (err) {
                    app.pane.loader.hide();
                    err = err.toString();
                    if (err.indexOf("Access Declined") > -1) {
                        AppIsOnline = false;
                    }
                    return console.error(err);
                }
                NearbyVisitDataNotOwned = records;
                //NearbyVisitDataNotOwned.sort(compare);
                // $("#ListViewForVisitNearby").data("kendoMobileListView").append(records);
                $("#ListViewForVisitNearby_otherusers").data("kendoMobileListView").replace(NearbyVisitDataNotOwned);
                changeVisitColor();
                app.toastMessage("Other nearby visit is downloaded", "short");
            });
    }
}

function showNearestOverdueVisits(position) {
    VisitOverdue_Nearest = [];
    var MapAccountIdToAccountDetail = {};
    $('#MessageOfVisitOverdue_newestsort').empty();
    for (var i = 0; i < VisitOverdue.length; i++) {
        if (!(VisitOverdue[i]['STKR__Status__c'] === 'Complete')) {
            if (!MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']]) {
                for (var j = 0; j < AllAccounts.length; j++) {
                    if (AllAccounts[j]['Id'] === VisitOverdue[i]['STKR__Account_lkp__c']) {
                        MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']] = AllAccounts[j];
                        if (AllAccounts[j]['STKR__location__Latitude__s'] && AllAccounts[j]['STKR__location__Longitude__s']) {
                            var frm = {
                                lat1: { value: position.coords.latitude },
                                lon1: { value: position.coords.longitude },
                                lat2: { value: AllAccounts[j]['STKR__location__Latitude__s'] },
                                lon2: { value: AllAccounts[j]['STKR__location__Longitude__s'] },
                                km: { value: null },
                                mi: { value: null }
                            };
                            findDistance(frm, VisitOverdue[i], 'overdue');
                        }
                    }
                }
            } else {
                if (MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']]['STKR__location__Latitude__s'] && MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']]['STKR__location__Longitude__s']) {
                    var frm = {
                        lat1: { value: position.coords.latitude },
                        lon1: { value: position.coords.longitude },
                        lat2: { value: MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']]['STKR__location__Latitude__s'] },
                        lon2: { value: MapAccountIdToAccountDetail[VisitOverdue[i]['STKR__Account_lkp__c']]['STKR__location__Longitude__s'] },
                        km: { value: null },
                        mi: { value: null }
                    };
                    findDistance(frm, VisitOverdue[i], 'overdue');
                }
            }
        }
    }

    if (VisitOverdue_Nearest.length) {
        // Sort VisitOverdue_Nearest Array
        VisitOverdue_Nearest.sort(function (a, b) {
            return a.RadiusInKM - b.RadiusInKM;
        });
        //VisitOverdue_Nearest.sort(compare);
        // Delete the extra field
        for (var objProp in VisitOverdue_Nearest) {
            if (objProp == 'RadiusInKM') {
                delete VisitOverdue_Nearest['RadiusInKM'];
            }
        }
        try {
            $("#ListViewForVisitOverdue_newestsort").data("kendoMobileListView").replace(VisitOverdue_Nearest);
        } catch (err) {
            LOG && console.log(err);
        }
    } else {
        var ShowPlaceholder = $('<p>').text("This list is empty. Please use the 'Refresh All Data' option on the main menu.");
        ShowPlaceholder.css('color', 'grey');
        ShowPlaceholder.css('position', 'absolute');
        ShowPlaceholder.css('top', '50%');
        $('#MessageOfVisitOverdue_newestsort').html(ShowPlaceholder);
    }
    app.pane.loader.hide();
    changeVisitColor();
}

function Hideloader() {
    try {
        app.pane.loader.hide();
        document.removeEventListener("click", function () {
        });
    } catch (err) {
        LOG && console.log(err);
    }
}

var VisitStatusToupdate = '';

function ChangeVisitStatus(data, fromVisitDetailPage) {
    var VisitIndex = null;
    var ChangeDataTo = null;

    app.pane.loader.show();

    LOG && console.log('1', data);
    // New Code 
    // Don't check the current tab. Directly loop through the array

    // Check if this visit exist in the overdue tab
    var VisitIsFound = false;
    for (var i = 0; i < VisitOverdue.length; i++) {
        if (data.Id === VisitOverdue[i]['Id']) {
            ChangeDataTo = VisitOverdue[i];
            VisitIndex = i;
            VisitIsFound = true;
            currentTab = 'Overdue';
            break;
        }
    }

    // Check if this visit exist in the today tab
    if (!VisitIsFound) {
        for (var i = 0; i < VisitToday.length; i++) {
            if (data.Id === VisitToday[i]['Id']) {
                ChangeDataTo = VisitToday[i];
                VisitIndex = i;
                VisitIsFound = true;
                currentTab = 'Today';
                break;
            }
        }
    }

    // Check if this visit exist in the thisweek tab
    if (!VisitIsFound) {
        for (var i = 0; i < VisitThisWeek.length; i++) {
            if (data.Id === VisitThisWeek[i]['Id']) {
                ChangeDataTo = VisitThisWeek[i];
                VisitIndex = i;
                VisitIsFound = true;
                currentTab = 'This Week';
                break;
            }
        }
    }

    // Check if this visit exist in the within45 tab
    if (!VisitIsFound) {
        for (var i = 0; i < VisitWithin45.length; i++) {
            if (data.Id === VisitWithin45[i]['Id']) {
                ChangeDataTo = VisitWithin45[i];
                VisitIndex = i;
                VisitIsFound = true;
                currentTab = 'Within 45';
                break;
            }
        }
    }
    // Check if this visit exist in the complete tab
    if (!VisitIsFound) {
        for (var i = 0; i < VisitCompleted.length; i++) {
            if (data.Id === VisitCompleted[i]['Id']) {
                ChangeDataTo = VisitCompleted[i];
                VisitIndex = i;
                VisitIsFound = true;
                currentTab = 'Complete';
                break;
            }
        }
    }
    // End

    LOG && console.log('2 VisitIsFound', VisitIsFound, VisitIndex);
    if (VisitIsFound) {
        // Update Geolocation of Resource
        UpdateResourceGeolocation(data.STKR__Resource__c);

        VisitStatusToupdate = '';
        if (data.STKR__Status__c === 'Open') {
            VisitStatusToupdate = 'Accepted';
            data.STKR__Accepted__c = new Date().toJSON();
        } else if (data.STKR__Status__c === 'Accepted') {
            VisitStatusToupdate = 'Journey Started';
            data.STKR__Journey_Start__c = new Date().toJSON();
        } else if (data.STKR__Status__c === 'Journey Started') {
            VisitStatusToupdate = 'In Progress';
            data.STKR__Arrival_Time__c = new Date().toJSON();
        } else if (data.STKR__Status__c === 'In Progress') {
            //I143
            VisitStatusToupdate = 'In Progress';
        }
        else if (data.STKR__Status__c === "Paused") {
            VisitStatusToupdate = 'Paused'
        }
        // Return if status is something else
        if (!VisitStatusToupdate)
            return;

        data.STKR__Status__c = VisitStatusToupdate;
        if (data.STKR__Status__c === 'Journey Started' || data.STKR__Status__c === 'In Progress') {
            var newdata = jQuery.extend({}, data);
            var returnedGeolocation = UpdateGeolocation(newdata);
            data = returnedGeolocation;
        }

        LOG && console.log('5', data);
        // Update Visit Table
        app.insertRecord('Visits', {
            JsonData: JSON.stringify(data),
            Updated: 'false',
            UserId: creds.UserID,
            VisitID: data.Id
        });

        var dataforstatus ={};
        dataforstatus.STKR__Status__c = data.STKR__Status__c;
        dataforstatus.STKR__Accepted__c = data.STKR__Accepted__c;
        dataforstatus.STKR__Journey_Start__c = data.STKR__Journey_Start__c;
        dataforstatus.STKR__Arrival_Time__c = data.STKR__Arrival_Time__c;
        
        if(data.STKR__visitTimer__c)
        dataforstatus.STKR__visitTimer__c = data.STKR__visitTimer__c;

        if(data.STKR__startDate__c)
        dataforstatus.STKR__startDate__c = data.STKR__startDate__c;

        if(data.STKR__endDate__c)
        dataforstatus.STKR__endDate__c = data.STKR__endDate__c;

        if(data.STKR__Arival_GeoLocation__Latitude__s)
        dataforstatus.STKR__Arival_GeoLocation__Latitude__s = data.STKR__Arival_GeoLocation__Latitude__s;
        
        if(data.STKR__Arival_GeoLocation__Longitude__s)
        dataforstatus.STKR__Arival_GeoLocation__Longitude__s = data.STKR__Arival_GeoLocation__Longitude__s;

        if(data.STKR__Journey_Start_GeoLocation__Latitude__s)
        dataforstatus.STKR__Journey_Start_GeoLocation__Latitude__s = data.STKR__Journey_Start_GeoLocation__Latitude__s;

         if(data.STKR__Journey_Start_GeoLocation__Longitude__s)
        dataforstatus.STKR__Journey_Start_GeoLocation__Longitude__s = data.STKR__Journey_Start_GeoLocation__Longitude__s;
          console.log('dataforstatus',dataforstatus);
        // Check whether device is online or not
        if (AppIsOnline) {
            //... Check if device have actual internet connection or not ..
            // 16-02-2017 Ashutosh Added Timeout funcationality
            //Device is online
            $.ajax({
                url: creds.instanceUrl + '/services/data/v28.0/sobjects/STKR__Visit__c/' + data.Id,
                data: JSON.stringify(dataforstatus),
                type: 'PATCH',
                headers: { 'Authorization': 'Bearer ' + creds.accessToken },
                contentType: 'application/json',
                success: function (a, b) {
                    app.deleteRecord('DataToUpdate', data.Id);
                    RefreshListviewStatus(VisitStatusToupdate);
                    app.pane.loader.hide();
                    LOG && console.log('data', data);
                    app.toastMessage('Status of ' + data.Name + ' updated to ' + VisitStatusToupdate, 'long');
                    //For complete offline
                    if (data.STKR__Status__c == "In Progress") {
                        isCurrentVisitInProgress = true;
                    }
                },
                error: function (error) {
                    if (error.statusText === 'timeout') {
                        app.toastMessage('Timeout, Saving into offline database ...', 'long');
                        // Device is offline
                        // Store in DataToUpdate table
                        var datatosave = {
                            JsonData: JSON.stringify(data),
                            ObjectName: 'STKR__Visit__c',
                            Updated: 'false',
                            UpdateOrInsert: 'update',
                            UserId: creds.UserID,
                            RecordId: data.Id
                        }
                        app.insertRecord('DataToUpdate', datatosave);
                        RefreshListviewStatus(VisitStatusToupdate);
                        app.pane.loader.hide();
                        app.toastMessage('Status of ' + data.Name + 'updated to ' + VisitStatusToupdate, 'long');
                        //For complete offline
                        if (data.STKR__Status__c == "In Progress") {
                            isCurrentVisitInProgress = true;
                        }
                    }

                    StoreError(JSON.stringify(error));
                    app.toastMessage('An error occured please see the error log', 'long');
                },
                timeout: 5000
            });

        } else {
            // Device is offline
            // Store in DataToUpdate table
            var datatosave = {
                JsonData: JSON.stringify(data),
                ObjectName: 'STKR__Visit__c',
                Updated: 'false',
                UpdateOrInsert: 'update',
                UserId: creds.UserID,
                RecordId: data.Id
            }
            app.insertRecord('DataToUpdate', datatosave);
            RefreshListviewStatus(VisitStatusToupdate);
            app.pane.loader.hide();
            app.toastMessage('Status of ' + data.Name + 'updated to ' + VisitStatusToupdate, 'long');
            //For complete offline
            if (data.STKR__Status__c == "In Progress") {
                isCurrentVisitInProgress = true;
            }
        }
    } else {
        app.toastMessage("Not able to find the visit", "long");
        app.pane.loader.hide();
    }

    function RefreshListviewStatus(UpdateStatusTo) {
        //Refresh listview with new data
        try {
            if (currentTab === 'Overdue') {
                VisitOverdue[VisitIndex]['STKR__Status__c'] = UpdateStatusTo;
                VisitOverdue[VisitIndex]['STKR__Accepted__c'] = data.STKR__Accepted__c;
                VisitOverdue[VisitIndex]['STKR__Journey_Start__c'] = data.STKR__Journey_Start__c;
                VisitOverdue[VisitIndex]['STKR__Arrival_Time__c'] = data.STKR__Arrival_Time__c;
                try {
                    $("#ListViewForVisitOverdue_oldestsort").data("kendoMobileListView").replace(VisitOverdue);
                } catch (err) {
                    LOG && console.log(err);
                }
            } else if (currentTab === 'Today') {
                VisitToday[VisitIndex]['STKR__Status__c'] = UpdateStatusTo;
                VisitToday[VisitIndex]['STKR__Accepted__c'] = data.STKR__Accepted__c;
                VisitToday[VisitIndex]['STKR__Journey_Start__c'] = data.STKR__Journey_Start__c;
                VisitToday[VisitIndex]['STKR__Arrival_Time__c'] = data.STKR__Arrival_Time__c;
                try {
                    $("#ListViewForVisitToday").data("kendoMobileListView").replace(VisitToday);
                } catch (err) {
                    LOG && console.log(err);
                }
            } else if (currentTab === 'This Week') {
                VisitThisWeek[VisitIndex]['STKR__Status__c'] = UpdateStatusTo;
                VisitThisWeek[VisitIndex]['STKR__Accepted__c'] = data.STKR__Accepted__c;
                VisitThisWeek[VisitIndex]['STKR__Journey_Start__c'] = data.STKR__Journey_Start__c;
                VisitThisWeek[VisitIndex]['STKR__Arrival_Time__c'] = data.STKR__Arrival_Time__c;
                try {
                    tempWeekDaysSeq = returnWeekDays();
                    $("#ListViewForVisitThisWeek").kendoMobileListView({
                        dataSource: {
                            data: VisitThisWeek,
                            schema: {
                                parse: function (data) {
                                    if (device.platform === "Android") {

                                        for (var i = 0; i < data.length; i++) {
                                            // Make today dayNumber = 0 , tomorrow = 1 and so on
                                            var curDay = new Date(data[i]['STKR__Due_Date__c']).getDay();
                                            curDay = curDay - new Date().getDay();
                                            if (curDay < 0) {
                                                data[i].dayNumber = curDay + 7;
                                            } else {
                                                data[i].dayNumber = curDay;
                                            }
                                        }
                                    } else if (device.platform === "iOS") {
                                        for (var i = 0; i < data.length; i++) {
                                            var curDay_ios = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]).getDay();
                                            curDay_ios = curDay_ios - new Date().getDay();
                                            if (curDay_ios < 0) {
                                                data[i].dayNumber = curDay_ios + 7;
                                            } else {
                                                data[i].dayNumber = curDay_ios;
                                            }
                                        }
                                    }
                                    return data;
                                }
                            },
                            group: { field: "dayNumber" }
                        },
                        template: $('#ListViewForVisitTemplate').text(),
                        headerTemplate: "#:tempWeekDaysSeq[value]#",
                        fixedHeaders: true
                    });
                    $("#ListViewForVisitThisWeek").data("kendoMobileListView").replace(VisitThisWeek);
                } catch (err) {
                    LOG && console.log(err);
                }
            } else if (currentTab === 'Within 45') {
                VisitWithin45[VisitIndex]['STKR__Status__c'] = UpdateStatusTo;
                VisitWithin45[VisitIndex]['STKR__Accepted__c'] = data.STKR__Accepted__c;
                VisitWithin45[VisitIndex]['STKR__Journey_Start__c'] = data.STKR__Journey_Start__c;
                VisitWithin45[VisitIndex]['STKR__Arrival_Time__c'] = data.STKR__Arrival_Time__c;
                try {
                    $("#ListViewForVisitWithin45Days").kendoMobileListView({
                        dataSource: {
                            data: VisitWithin45,
                            schema: {
                                parse: function (data) {
                                    if (device.platform === "Android") {
                                        for (var i = 0; i < data.length; i++) {
                                            var tempdate = new Date(data[i]['STKR__Due_Date__c']).toDateString();
                                            tempdate = tempdate.substr(0, tempdate.lastIndexOf(" ") + 1);
                                            data[i].date = "W/C" + " " + tempdate;
                                        }
                                    } else if (device.platform === "iOS") {
                                        for (var i = 0; i < data.length; i++) {
                                            var tempdate = new Date(data[i]['STKR__Due_Date__c'].split('+')[0]).toDateString();
                                            tempdate = tempdate.substr(0, tempdate.lastIndexOf(" ") + 1);
                                            data[i].date = "W/C" + " " + tempdate;
                                        }
                                    }
                                    return data;
                                }
                            },
                            group: { field: "date" }
                        },
                        template: $('#ListViewForVisitTemplate').text(),
                        fixedHeaders: true
                    });
                } catch (err) {
                    LOG && console.log(err);
                }
            } else if (currentTab === 'Complete') {
                VisitCompleted[VisitIndex]['STKR__Status__c'] = UpdateStatusTo;
                VisitCompleted[VisitIndex]['STKR__Accepted__c'] = data.STKR__Accepted__c;
                VisitCompleted[VisitIndex]['STKR__Journey_Start__c'] = data.STKR__Journey_Start__c;
                VisitCompleted[VisitIndex]['STKR__Arrival_Time__c'] = data.STKR__Arrival_Time__c;
                try {
                    $("#ListViewForVisitComplete").data("kendoMobileListView").replace(VisitCompleted);
                } catch (err) {
                    LOG && console.log(err);
                }
            } else if (currentTab === 'Search Visit' || currentTab === 'Nearby') {
            }
        } catch (e) {
            console.error('Line 260\n' + e);
        }
        changeVisitColor();
        if (fromVisitDetailPage === 'fromVisitDetailPage') {
            $("#MyVisitModalView").kendoMobileModalView("close");
            DataShowVisitDetails();
        }
    }
}

function UpdateResourceGeolocation(data) {
    var options = {
        enableHighAccuracy: true
    };
    navigator.geolocation.getCurrentPosition(function (position) {
        // Successfully retrieved the geolocation information. Display it all.
        // Check whether device is online or not
        //LOG && console.log('3', data);
        if (AppIsOnline) {
            //Device is online
            jsconn.sobject("STKR__Resource__c").update({
                Id: data,
                STKR__Location__Latitude__s: position.coords.latitude,
                STKR__Location__Longitude__s: position.coords.longitude
            }, function (err, ret) {
                if (err || !ret.success) {
                    StoreError(err);
                    return console.error(err, ret);
                }
                LOG && console.log('Updated');
            });
        } else {
            // Device is offline
            // Store in DataToUpdate table
            var DataToUpdate = {
                Id: data,
                STKR__Location__Latitude__s: position.coords.latitude,
                STKR__Location__Longitude__s: position.coords.longitude
            };
            var datatosave = {
                JsonData: JSON.stringify(DataToUpdate),
                ObjectName: 'STKR__Resource__c',
                Updated: 'false',
                UpdateOrInsert: 'update',
                UserId: creds.UserID,
                RecordId: data
            }
            app.insertRecord('DataToUpdate', datatosave);
        }
    }, function (error) {
        StoreError(error);
        console.error('code: ' + error.code + '<br/>' + 'message: ' + error.message + '<br/>');
    }, options);
}

function GotomapWithparam(name, Accountid) {
    VisitName = name;
    accountid = Accountid;
    SingleVisit = 1;
    if (navigator.onLine)
        app.navigate('view/ShowVisitsMap.html?VisitName=' + VisitName + '&accountid=' + accountid + '&SingleVisit=' + SingleVisit + '&From=Card');
    else
        app.toastMessage('Device is offline', 'long');
}

function myVisitDrawerClick() {
}

var AccName = '', tempVisitValues = {};

function gotovisitdetailPageFormMyvisit(visitid, accountid, VisitRecordTypeId, STKR__UserId__c) {
    // Show modal if visit doesn't belong to current user
    if (!STKR__UserId__c || (STKR__UserId__c != creds.UserID && STKR__UserId__c != creds.UserID.substring(0, 15))) {
        OpenVisitModelViewForAll('MyVisitModalView', visitid);
        return;
    }

    StoreVisitsAfterFilter = [];
    AccName = '';
    tempVisitValues = {};

    for (var i = 0; i < AllVisits.length; i++) {
        if (AllVisits[i]['STKR__Account_lkp__c'] === accountid) {
            AccName = AllVisits[i]['STKR__Account__c'];
        }

        if (AllVisits[i]['Id'] === visitid) {
            tempVisitValues = AllVisits[i];
        }
    }
    LOG && console.log('AccName', AccName);

    for (var j = 0; j < AllVisits.length; j++) {
        // if (AllVisits[j]['STKR__Account__c'] == AccName && AllVisits[j]["STKR__Status__c"] != "Complete" &&
        //     !(AllVisits[j].STKR__Visit_Type__c.includes("Contract Visit") &&
        //         AllVisits[j].STKR__Service__c === tempVisitValues.STKR__Service__c &&
        //         new Date(AllVisits[j].STKR__Due_Date__c).getTime() > new Date(tempVisitValues.STKR__Due_Date__c).getTime()
        //     )
        // ) {
        //     StoreVisitsAfterFilter.push(AllVisits[j]);
        // }

        if (AllVisits[j].STKR__Service__c == tempVisitValues.STKR__Service__c &&
            AllVisits[j].STKR__Visit_Type__c == tempVisitValues.STKR__Visit_Type__c &&
            new Date(AllVisits[j]['STKR__Due_Date__c']) > new Date()) {
            //Exclude visits on the same schedule with the exact same visit type where the due date is in the future. 
        } else {
            if (AllVisits[j]['STKR__Account__c'] == AccName && AllVisits[j]["STKR__Status__c"] != "Complete")
                StoreVisitsAfterFilter.push(AllVisits[j]);
        }
    }
    LOG && console.log(StoreVisitsAfterFilter);
    try {
        if (count_AssociatedVisit === 0) {
            if (StoreVisitsAfterFilter.length > 1) {
                count_AssociatedVisit = 1;
                app.toastMessage('There are other visits due on this site. Please consider completing these visits if appropriate.', 'long');
                app.navigate('view/visitdetail.html?visitid=' + visitid + '&accountid=' + accountid + '&currentTab=' + currentTab + '&VRecordTypeId=' + VisitRecordTypeId);
            } else {
                app.navigate('view/visitdetail.html?visitid=' + visitid + '&accountid=' + accountid + '&currentTab=' + currentTab + '&VRecordTypeId=' + VisitRecordTypeId);
            }
        }
        if (count_AssociatedVisit === 1) {
            app.navigate('view/visitdetail.html?visitid=' + visitid + '&accountid=' + accountid + '&currentTab=' + currentTab + '&VRecordTypeId=' + VisitRecordTypeId);
        }
    } catch (err) {
        LOG && console.log(err);
    }
    visitDataForBack = {
        VisitId: visitid,
        AccountId: accountid,
        VisitRecordTypeId: VisitRecordTypeId
    };
}

function OpenVisitModelViewForAll(id, visitid) {
    try {
        e.view.scroller.reset();
    } catch (err) {
    }
    var MyVisitModalViewTemplate = kendo.template($("#MyVisitModalViewTemplate").html());
    var result;
    var modalViewData = null;
    var ownvisitData = true;
    if (currentTab === 'Overdue') {
        for (var i = 0; i < VisitOverdue.length; i++) {
            if (VisitOverdue[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitOverdue[i]);
                modalViewData = VisitOverdue[i];
                break;
            }
        }
    } else if (currentTab === 'Overdue_NewestSort') {
        for (var i = 0; i < VisitOverdue.length; i++) {
            if (VisitOverdue[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitOverdue[i]);
                modalViewData = VisitOverdue[i];
                break;
            }
        }
    } else if (currentTab === 'Today') {
        for (var i = 0; i < VisitToday.length; i++) {
            if (VisitToday[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitToday[i]);
                modalViewData = VisitToday[i];
                break;
            }
        }
    } else if (currentTab === 'This Week') {
        for (var i = 0; i < VisitThisWeek.length; i++) {
            if (VisitThisWeek[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitThisWeek[i]);
                modalViewData = VisitThisWeek[i];
                break;
            }
        }
    } else if (currentTab === 'Within 45') {
        for (var i = 0; i < VisitWithin45.length; i++) {
            if (VisitWithin45[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitWithin45[i]);
                modalViewData = VisitWithin45[i];
                break;
            }
        }
    } else if (currentTab === 'Complete') {
        for (var i = 0; i < VisitCompleted.length; i++) {
            if (VisitCompleted[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(VisitCompleted[i]);
                modalViewData = VisitCompleted[i];
                break;
            }
        }
    } else if (currentTab === 'Search Visit') {
        for (var i = 0; i < AllVisits.length; i++) {
            if (AllVisits[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(AllVisits[i]);
                modalViewData = AllVisits[i];
                break;
            }
        }
    } else if (currentTab === 'Nearby') {
        for (var i = 0; i < AllVisits.length; i++) {
            if (AllVisits[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(AllVisits[i]);
                modalViewData = AllVisits[i];
                break;
            }
        }
    } else if (currentTab === 'Nearby_OtherUsers') {
        for (var i = 0; i < AllVisits.length; i++) {
            if (AllVisits[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(AllVisits[i]);
                modalViewData = AllVisits[i];
                break;
            }
        }
        if (!modalViewData) {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                //LOG && console.log(NearbyVisitDataNotOwned[i]['Id'], visitid);
                if (NearbyVisitDataNotOwned[i]['Id'] === visitid) {
                    result = MyVisitModalViewTemplate(NearbyVisitDataNotOwned[i]);
                    modalViewData = NearbyVisitDataNotOwned[i];
                    ownvisitData = false;
                    break;
                }
            }
        }
    } else if (currentTab === 'Others Visit') {
        for (var i = 0; i < AllOthersVisits.length; i++) {
            if (AllOthersVisits[i]['Id'] === visitid) {
                result = MyVisitModalViewTemplate(AllOthersVisits[i]);
                modalViewData = AllOthersVisits[i];
                break;
            }
        }
    }
    $("#innerVisitModalView").html(result);
    $("#" + id).kendoMobileModalView("open");
    if (ownvisitData) {

        app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM Account WHERE accountid=?", [modalViewData['STKR__Account_lkp__c']],
                function (a, b) {
                    var parsedScheduleValue = JSON.parse(b.rows.item(0)['jsondata']);
                    var AddressofAccount = '';
                    if (parsedScheduleValue['ShippingStreet'])
                        AddressofAccount += parsedScheduleValue['ShippingStreet'];
                    if (parsedScheduleValue['ShippingCity'])
                        AddressofAccount += ', ' + parsedScheduleValue['ShippingCity'];
                    if (parsedScheduleValue['ShippingPostalCode'])
                        AddressofAccount += ', ' + parsedScheduleValue['ShippingPostalCode'];
                    if (parsedScheduleValue['ShippingState'])
                        AddressofAccount += ', ' + parsedScheduleValue['ShippingState'];
                    if (AddressofAccount) {
                        $('#AddressOfAccount').html(AddressofAccount);
                    }
                    /* if (parsedScheduleValue['STKR__Open_Actions__c']) {
                    $('#OpenActionMyVisitModal').text(parsedScheduleValue['STKR__Open_Actions__c']+ ' Open Actions');
                    } else {
                    $('#OpenActionMyVisitModal').text('');
                    }*/
                },
                function (err) {
                    //StoreError(err);
                    LOG && console.log(err);
                });
        });
        app.db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM Schedule WHERE scheduleid=?", [modalViewData['STKR__Service__c']],
                function (a, b) {
                    var parsedScheduleValue = JSON.parse(b.rows.item(0)['jsondata']);
                    if (device.platform.toLowerCase() === 'ios') {
                        try {
                            var lastvisitdate = new Date(parsedScheduleValue['STKR__Last_Visit__c'].split('+')[0]);
                            var htmllastvisitdate = '';

                            htmllastvisitdate = lastvisitdate.getDate() + '/' + (lastvisitdate.getMonth() + 1) + '/' + lastvisitdate.getFullYear();

                            if (htmllastvisitdate) {
                                $('#LastVisit' + modalViewData['Id']).html("(" + htmllastvisitdate + ")");
                                $('#LastVisitCollapsible').html(htmllastvisitdate);
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    } else {
                        var lastvisitdate = new Date(parsedScheduleValue['STKR__Last_Visit__c']);
                        var htmllastvisitdate = '';
                        htmllastvisitdate = lastvisitdate.getDate() + '/' + (lastvisitdate.getMonth() + 1) + '/' + lastvisitdate.getFullYear();

                        if (htmllastvisitdate) {
                            $('#LastVisit' + modalViewData['Id']).html("(" + htmllastvisitdate + ")");
                            $('#LastVisitCollapsible').html(htmllastvisitdate);
                        }
                    }
                    if (parsedScheduleValue['STKR__Contract_Ref_PO__c']) {
                        $('#ref').html(parsedScheduleValue['STKR__Contract_Ref_PO__c']);
                    }
                    if (parsedScheduleValue['STKR__Number_of_Visit_Per_Year__c'] || parsedScheduleValue['STKR__Current_Visit_Number__c']) {
                        $('#CurrentVisitOfVisitPeryear').html('Visit ' + parsedScheduleValue['STKR__Current_Visit_Number__c'] + ' of ' + parsedScheduleValue['STKR__Number_of_Visit_Per_Year__c']);
                    }
                    if (parsedScheduleValue['STKR__Frequency__c']) {
                        $('#VisitFrequency').html(parsedScheduleValue['STKR__Frequency__c']);
                    }
                },
                function (err) {
                    //StoreError(err);
                    LOG && console.log(err);
                });
        });
    } else {
        $('#AddressOfAccount').html(modalViewData.STKR__Address__c);
    }
}

function CloseVisitModelViewForAll() {
    $("#MyVisitModalView").kendoMobileModalView("close");
}

function NetworkChangePopup() {

    // To Fix I177
    if (!CompleteVisit) {
        return;
    }
    //End

    // Consider app offline
    AppIsOnline = false;

    // Save all the work in offline table, TODO : Add all the pages
    try {
        // For Visit Detail
        if (window.location.hash.indexOf('visitdetail') > -1) {
            // Focus on some other element to fire the onchange ...
            $('[name="VisitLayoutName"]')[0].focus();
        }
    } catch (err) {
    }

    app.db.transaction(function (tx) {
        tx.executeSql("SELECT id FROM DataToUpdate", [], function (t, rs) {
            if (!CheckSecondTimeOnlineStatus) {
                return;
            }
            if (rs.rows.length) {
                if (!isNetworkPopShowing) {
                    // Checking network type 
                    LOG && console.log('Checking network type...');
                    var networkState = navigator.connection.type;
                    if (networkState === 'wifi' || networkState === '3g' || networkState === '4g' || networkState === 'cellular') {
                        LOG && console.log('Checking connection with salesforce .... ');
                        // Check if device can download record from salesforce
                        jsconn.query("SELECT Id FROM Account LIMIT 1", function (err, result) {
                            if (err) {
                                err = err.toString();
                                if (err === "invalid_grant: expired access/refresh token") {
                                    app.toastMessage("Session is expired, Please login", "long");
                                    Login();
                                } else if (err.toLowerCase().indexOf('request_limit_exceeded') > -1) {
                                    app.toastMessage('API Limit is exceeded. Please work in offline mode', 'long');
                                } else {
                                    app.toastMessage('App is unable to connect server', 'long');
                                    AppIsOnline = false;
                                    //isAppStartedInOfflineMode = true;
                                }
                                return LOG && console.log(err);
                            }
                            isNetworkPopShowing = true;
                            navigator.vibrate(500);
                            var options = {
                                androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
                                title: 'Network change is detected, Want to Refresh All Data ?',
                                buttonLabels: ['Yes', 'No'],
                                position: [20, 40] // Dialog position on iPad
                            };
                            // Device have internet and valid token
                            window.plugins.actionsheet.show(options, function (a) {
                                if (a == 1) {
                                    isNetworkPopShowing = false;
                                    window.plugins.actionsheet.hide();
                                    // Check if device can download record from salesforce
                                    AppIsOnline = true;
                                    //isAppStartedInOfflineMode = false;

                                    InternetStatusFooter = "Network is ONLINE- good data signal is assumed - <span style='color:green;font-size:125%;'>" + networkState.toUpperCase() + "</span>";
                                    $('#InternetStatusFooter').html(InternetStatusFooter);
                                    $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                                    $('#MyVisitsFooter').css("color", "#39B7CD");
                                    app.navigate('view/LoadAllData.html');
                                } else if (a == 2) {
                                    isNetworkPopShowing = false;
                                    window.plugins.actionsheet.hide();
                                    AppIsOnline = false;
                                    app.toastMessage("App is offline, Please continue working", "long");
                                    InternetStatusFooter = "ServiceTracker is offline. Data is stored for upload when online";
                                    $('#InternetStatusFooter').html(InternetStatusFooter);
                                    $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                                    $('#MyVisitsFooter').css("color", "#ff6666");
                                } else {
                                    isNetworkPopShowing = false;
                                    AppIsOnline = false;
                                }
                            });
                        });
                    } else {
                        AppIsOnline = false;
                        InternetStatusFooter = "ServiceTracker is offline. Slower internet connection detected";
                        $('#InternetStatusFooter').html(InternetStatusFooter);
                        $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                        $('#MyVisitsFooter').css("color", "#cc00cc");
                    }
                }
            } else {
                var networkState = navigator.connection.type;
                if (networkState === 'wifi' || networkState === '3g' || networkState === '4g' || networkState === 'cellular') {
                    LOG && console.log('Checking connection with salesforce .... ');
                    // Check if device can download record from salesforce
                    jsconn.query("SELECT Id FROM Account LIMIT 1", function (err, result) {
                        if (err) {
                            err = err.toString();
                            if (err === "invalid_grant: expired access/refresh token") {
                                app.toastMessage("Session is expired, Please login", "long");
                                Login();
                            } else if (err.toLowerCase().indexOf('request_limit_exceeded') > -1) {
                                app.toastMessage('API Limit is exceeded. Please work in offline mode', 'long');
                            } else {
                                app.toastMessage('App is unable to connect server', 'long');
                                AppIsOnline = false;
                                //isAppStartedInOfflineMode = true;
                            }
                            return LOG && console.log(err);
                        }
                        // Device have internet and valid token
                        AppIsOnline = true;
                        //isAppStartedInOfflineMode = false;

                        InternetStatusFooter = "Network is ONLINE- good data signal is assumed - <span style='color:green;font-size:125%;'>" + networkState.toUpperCase() + "</span>";
                        $('#InternetStatusFooter').html(InternetStatusFooter);
                        $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                        $('#MyVisitsFooter').css("color", "#39B7CD");
                    });
                } else {
                    AppIsOnline = false;
                    InternetStatusFooter = "ServiceTracker is offline. Slower internet connection detected";
                    $('#InternetStatusFooter').html(InternetStatusFooter);
                    $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                    $('#MyVisitsFooter').css("color", "#cc00cc");
                    app.toastMessage('Please only connect to 3G, 4G, WiFi', 'long');
                }
            }
        }, function (err) { LOG && console.log(err); });
    });
}

function OpenClearAllDataModalView() {
    /*  try {
    if (window.localStorage.getItem("EventType")==="" || window.localStorage.getItem("EventType")===null || window.localStorage.getItem("EventType") === 'End') {
    app.toastMessage('Please End Work before logging out', 'long');
    return;
    } else {
    }
    } catch (Error) {
    LOG && console.log(Error);
    }*/
    $('#ClearAllDataModalView').data('kendoMobileModalView').scroller.reset()
    $("#ClearAllDataModalView").kendoMobileModalView("open");
}

function SQLiteHistoryDelete() {
    // Get the list of Sqlite files then find 1 week old one and delete it.
    if (device.platform === 'Android') {
        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + '/SQLite/', function (dir) {
            // Get a directory reader
            var directoryReader = dir.createReader();
            // Get a list of all the entries in the directory
            directoryReader.readEntries(function (entries) {
                var i;
                for (i = 0; i < entries.length; i++) {
                    // LOG && console.log(entries[i].name);
                    if (entries[i].isFile) {
                        try {
                            var FileDate = new Date(parseInt(entries[i].name.split('ServiceTracker ')[1].split('.db')[0]));
                            // calculate date difference...
                            var diff = (new Date() - FileDate) / (1000 * 60 * 60 * 24);
                            if (Math.abs(diff) > 6) {
                                // Delete the file
                                dir.getFile(entries[i].name, { create: false }, function (fileEntry) {
                                    fileEntry.remove(function () {
                                    }, function (error) {
                                        // Error deleting the file
                                        console.error('Error file deleting sqlite file ' + error);
                                    }, function () {
                                        // The file doesn't exist
                                        console.error('file don\'t exists');
                                    });
                                });

                            }
                        } catch (err) { console.error(err); }
                    }
                }
            }, function (error) {
                console.error("Failed to list directory contents: " + error.code);
            });

        });
    } else if (device.platform === "iOS") {
        window.resolveLocalFileSystemURL(cordova.file.documentsDirectory + '/SQLite/', function (dir) {

            // Get a directory reader
            var directoryReader = dir.createReader();
            // Get a list of all the entries in the directory
            directoryReader.readEntries(function (entries) {
                var i;
                for (i = 0; i < entries.length; i++) {
                    // LOG && console.log(entries[i].name);
                    if (entries[i].isFile) {
                        try {
                            var FileDate = new Date(parseInt(entries[i].name.split('ServiceTracker ')[1].split('.db')[0]));
                            // calculate date difference...
                            var diff = (new Date() - FileDate) / (1000 * 60 * 60 * 24);
                            if (diff > 6) {
                                // Delete the file
                                dir.getFile(entries[i].name, { create: false }, function (fileEntry) {
                                    fileEntry.remove(function () {
                                    }, function (error) {
                                        // Error deleting the file
                                        console.error('Error file deleting sqlite file ' + error);
                                    }, function () {
                                        // The file doesn't exist
                                        console.error('file don\'t exists');
                                    });
                                });

                            }
                        } catch (err) { console.error(err); }
                    }
                }
            }, function (error) {
                console.error("Failed to list directory contents: " + error.code);
            });

        });
    }

}

function ColChange() {
    var HtmlOfFixedVisit = document.getElementsByClassName('fixedvisitcolor');
    var HtmlOfFollowUpVisit = document.getElementsByClassName('followupvisitcolor');
    var HtmlOfCallOutVisit = document.getElementsByClassName('calloutvisitcolor');
    var HtmlOfJobVisit = document.getElementsByClassName('jobvisitcolor');
    var HtmlOfRoutineVisit = document.getElementsByClassName('routinevisitcolor');
    var HtmlOfContractVisit = document.getElementsByClassName('contractvisitcolor');
    for (var i = 0; i < HtmlOfFixedVisit.length; i++) {
        if (HtmlOfFixedVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfFixedVisit[i].style.backgroundColor = HtmlOfFixedVisit[i + 1].style.backgroundColor
        i++;
    }
    for (var i = 0; i < HtmlOfFollowUpVisit.length; i++) {
        if (HtmlOfFollowUpVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfFollowUpVisit[i].style.backgroundColor = HtmlOfFollowUpVisit[i + 1].style.backgroundColor
        i++;
    }
    for (var i = 0; i < HtmlOfCallOutVisit.length; i++) {
        if (HtmlOfCallOutVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfCallOutVisit[i].style.backgroundColor = HtmlOfCallOutVisit[i + 1].style.backgroundColor
        i++;
    }
    for (var i = 0; i < HtmlOfJobVisit.length; i++) {
        if (HtmlOfJobVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfJobVisit[i].style.backgroundColor = HtmlOfJobVisit[i + 1].style.backgroundColor
        i++;
    }
    for (var i = 0; i < HtmlOfRoutineVisit.length; i++) {
        if (HtmlOfRoutineVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfRoutineVisit[i].style.backgroundColor = HtmlOfRoutineVisit[i + 1].style.backgroundColor
        i++;
    }
    for (var i = 0; i < HtmlOfContractVisit.length; i++) {
        if (HtmlOfContractVisit[i].className.indexOf('km-group-container') >= 0) {
            i++;
        }
        HtmlOfContractVisit[i].style.backgroundColor = HtmlOfContractVisit[i + 1].style.backgroundColor
        i++;
    }
}

//added by gaurav on 20 april 2017
function getcartdate(visitid, dateval) {
    if (currentTab === 'Overdue') {
        for (var i = 0; i < VisitOverdue.length; i++) {
            if (VisitOverdue[i]['Id'] === visitid) {
                VisitOverdue[i]['STKR__Due_Date__c'] = dateval;

                break;
            }
        }
    } else if (currentTab === 'Today') {
        for (var i = 0; i < VisitToday.length; i++) {
            if (VisitToday[i]['Id'] === visitid) {
                VisitToday[i]['STKR__Due_Date__c'] = dateval;
                break;
            }
        }
    } else if (currentTab === 'This Week') {
        for (var i = 0; i < VisitThisWeek.length; i++) {
            if (VisitThisWeek[i]['Id'] === visitid) {
                VisitThisWeek[i]['STKR__Due_Date__c'] = dateval;
                break;
            }
        }
    } else if (currentTab === 'Within 45') {
        for (var i = 0; i < VisitWithin45.length; i++) {
            if (VisitWithin45[i]['Id'] === visitid) {
                VisitWithin45[i]['STKR__Due_Date__c'] = dateval;
                break;
            }
        }
    } else if (currentTab === 'Complete') {
        for (var i = 0; i < VisitCompleted.length; i++) {
            if (VisitCompleted[i]['Id'] === visitid) {
                VisitCompleted[i]['STKR__Due_Date__c'] = dateval;
                break;
            }
        }
    } else if (currentTab === 'Nearby') {
        for (var i = 0; i < VisitNearby.length; i++) {
            if (VisitNearby[i]['Id'] === visitid) {
                VisitNearby[i]['STKR__Due_Date__c'] = dateval;
                break;
            }
        }
    }
}

function SqliteVersionHistory() {
    if (device.platform === 'Android') {
        window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (dir) {
            dir.getFile("databases/ServiceTracker.db", {}, function (file) {
                try {
                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (mdir) {
                        mdir.getDirectory('SQLite/', { create: true, exclusive: false }, function (dirEntry1) {
                            file.copyTo(dirEntry1, "ServiceTracker " + new Date().getTime() + ".db", function (suc) {
                            });
                        });
                    });
                } catch (e) {
                    console.error("pdf error" + e);
                }
            }, function (err) {
                console.error(JSON.stringify(err));
            });
        });
    } else if (device.platform === 'iOS') {
        window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, function (dir) {
            dir.getDirectory('SQLite/', { create: true, exclusive: false }, function (dirEntry1) {
                dir.getFile("ServiceTracker.db", {}, function (file) {
                    file.copyTo(dirEntry1, "ServiceTracker " + new Date().getTime() + ".db", function (suc) {

                    });
                }, function (err) {
                    console.error(JSON.stringify(err));
                });
            });
        });
    }

}

var ClearData_Count = 0;

function ClearAllDataShow() {
    ClearData_Count = 0;
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name!='android_metadata' order by name", [],
            function (tx, res) {
                for (var i = 0; i < res.rows.length; i++) {
                    if (!(res.rows.item(i).name === '__WebKitDatabaseInfoTable__')) {
                        app.deleteAllData(res.rows.item(i).name, function () {
                            ClearData_Count++;
                            if (ClearData_Count === res.rows.length) {
                                onDeviceReady();
                            }
                        });
                    }
                }
            },
            function (tx, res) {
                console.error('error: ' + res.message);
            });
    });
}

function CloseInnervisitDetailModalView() {
    console.log('id', visitDescrptionInformation);
    if (visitDescrptionInformation && (visitDescrptionInformation === creds.UserID || visitDescrptionInformation === creds.UserID.substring(0, 15))) {
        //  OpenVisitModelViewForAll('MyVisitModalView', visitid);
        console.log('you can update user');
        updateVisit(null, true);

    } else {

        app.toastMessage("Different user can not update it", "long");

    }

    $('#VisitDescriptionModalView').kendoMobileModalView('close');
}
function CloseInnerInternalModalView() {
    InternalNotesinfo = $("#STKR__Internal_Notes__c").val();

    updateVisit(null, true);
    $('#InternalNotesModalView').kendoMobileModalView('close');
}

function CheckforAbortedVisit(e) {
    var flag = e.checked;
    var options = {
        'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
        'title': 'Are you sure you want to abort this visit ' + newDetailValue[0]['Name'] + ' ?',
        'buttonLabels': ['Yes', 'No']
    };
    if (flag) {
        if ($("#STKR__Aborted_Visit__c[name='VisitLayoutName']").is(':checked')) {
            window.plugins.actionsheet.show(options, function (buttonIndex) {
                if (buttonIndex === 1) {
                    $('#STKR__Aborted_Visit__c[name="VisitLayoutName"]').prop('checked', true);
                    updateVisit();
                } else {
                    $('#STKR__Aborted_Visit__c[name="VisitLayoutName"]').prop('checked', false);
                    updateVisit();
                }
            });
        } else {
            $('#STKR__Aborted_Visit__c[name="VisitLayoutName"]').prop('checked', true);
            updateVisit();
        }
    } else {
        app.toastMessage('You unmarked Aborted Visit ' + newDetailValue[0]['Name'], 'long');
        updateVisit();
    }
}

function getcartdescription(visitid) {
    if (!$("#STKR__Notes_Long__c[name='VisitLayoutName']").length) {
        return;
    }
    if (currentTab === 'Overdue') {
        for (var i = 0; i < VisitOverdue.length; i++) {
            if (VisitOverdue[i]['Id'] === visitid) {
                VisitOverdue[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    } else if (currentTab === 'Today') {
        for (var i = 0; i < VisitToday.length; i++) {
            if (VisitToday[i]['Id'] === visitid) {
                VisitToday[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    } else if (currentTab === 'This Week') {
        for (var i = 0; i < VisitThisWeek.length; i++) {
            if (VisitThisWeek[i]['Id'] === visitid) {
                VisitThisWeek[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    } else if (currentTab === 'Within 45') {
        for (var i = 0; i < VisitWithin45.length; i++) {
            if (VisitWithin45[i]['Id'] === visitid) {
                VisitWithin45[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    } else if (currentTab === 'Complete') {
        for (var i = 0; i < VisitCompleted.length; i++) {
            if (VisitCompleted[i]['Id'] === visitid) {
                VisitCompleted[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    } else if (currentTab === 'Nearby') {
        for (var i = 0; i < VisitNearby.length; i++) {
            if (VisitNearby[i]['Id'] === visitid) {
                VisitNearby[i]['STKR__Notes_Long__c'] = $("#STKR__Notes_Long__c").val();
                break;
            }
        }
    }
}

var innervisitdetailmodalviewId = '';
var visitDescrptionInformation = '';
function ShowVisitDescriptionModal(data, Id) {
    visitDescrptionInformation = '';
    console.log('mydescriptiondata', data, visitDescrptionInformation);
    if (typeof data === 'object') {
        console.log(typeof data);
        visitDescrptionInformation = data.STKR__UserId__c;
    }
    else {
        console.log(typeof data);
        visitDescrptionInformation = data;
    }

    try {
        $('#VisitDescriptionModalView').data('kendoMobileModalView').scroller.reset();
    } catch (err) {
    }
    if (!visitDescrptionInformation && !(visitDescrptionInformation === creds.UserID || visitDescrptionInformation === creds.UserID.substring(0, 15))) {
        //  OpenVisitModelViewForAll('MyVisitModalView', visitid);
        app.toastMessage("Different user can not update it", "long");
        return;

    } 
    //  $('#STKR__Notes_Long__c').val('');
    innervisitdetailmodalviewId = Id;
    longNotesInfo = '';
    try {
        if (location.href.split('#')[1] == "nearbyvisit_otherusers") {
            for (var i = 0; i < NearbyVisitDataNotOwned.length; i++) {
                if (NearbyVisitDataNotOwned[i]['Id'] === Id) {
                    console.log("jvdfu", i)
                    longNotesInfo = NearbyVisitDataNotOwned[i]['STKR__Notes_Long__c'];
                    $('#STKR__Notes_Long__c').val(longNotesInfo);
                    break;
                }
            }
        } else {
            for (var i = 0; i < AllVisits.length; i++) {
                if (AllVisits[i]['Id'] === Id) {
                    longNotesInfo = AllVisits[i]['STKR__Notes_Long__c'];
                    $('#STKR__Notes_Long__c').val(longNotesInfo);
                    break;
                }
            }
        }
    } catch (err) {
    }
    // $('#STKR__Notes_Long__c').val($.parseHTML(VisitDescription)[0].data);
    $("#VisitDescriptionModalView").kendoMobileModalView("open");
    if (device.platform == "Android") {
        componentHandler.upgradeElements(document.getElementsByClassName('VisitDetailMDLClass'));
    }
}
function ShowInternalNotesDescriptionModal(Id) {
    try {
        $('#InternalNotesModalView').data('kendoMobileModalView').scroller.reset();
    } catch (err) {
    }
    // $('#InnerInternalNotesModalView').val('');
    // innerInternalNotesmodalviewId = Id;
    InternalNotesinfo = '';
    try {
        for (var i = 0; i < AllVisits.length; i++) {
            if (AllVisits[i]['Id'] === Id) {
                InternalNotesinfo = AllVisits[i]['STKR__Internal_Notes__c'];
                break;
            }
        }
    } catch (err) {
    }
    //  $('#InnerInternalNotesModalView').val($.parseHTML(InternalNotesDescription)[0].data);
    $("#InternalNotesModalView").kendoMobileModalView("open");
    if (device.platform == "Android") {
        componentHandler.upgradeElements(document.getElementsByClassName('VisitDetailMDLClass'));
    }
}

var MyVisitscallback = function (buttonIndex) {
    if (buttonIndex === 1) {
        $("#modalview-filter").kendoMobileModalView("open");
    }
    if (buttonIndex === 2) {
        $("#modalview-sort").kendoMobileModalView("open");
    }
};

/*function testShareSheet() {
    // if (CountNumberOfVisitOfAccount > 0) {
    var options = {
        'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
        'title': 'Choose Any one',
        'buttonLabels': ['Filter', 'Sort'],
        'addCancelButtonWithLabel': 'Cancel',
        'androidEnableCancelButton': true
    };
    window.plugins.actionsheet.show(options, MyVisitscallback);
    // }
}*/

function ConfirmationDialogVisitStatusChange(data, id) {
    try {
        // If Start work is enabled ...
        if (window.localStorage.getItem("EventType") === "" || window.localStorage.getItem("EventType") === null || window.localStorage.getItem("EventType") === 'Start') {
            app.toastMessage('Please click on Start Work first', 'long');
            return;
        }
    } catch (Error) {
        LOG && console.log(Error);
    }
    LOG && console.log(data.STKR__UserId__c, creds.UserID);

    var compareUsers = true;

    if (!data.STKR__UserId__c) {
        compareUsers = false;
    } else if (data.STKR__UserId__c.length != creds.UserID.length) {
        compareUsers = data.STKR__UserId__c == creds.UserID.substring(0, 15) ? true : false;
    } else {
        compareUsers = data.STKR__UserId__c == creds.UserID ? true : false;
    }

    if (!compareUsers) {
        if(!AppIsOnline){
            app.toastMessage("You can not transfer this visit in offline mode, please try again when online", "long");
           return;
        }
        if (data.STKR__Status__c === "Open") {
            var options = {
                'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
                'title': 'Are you sure you want to assign ' + data.Name + ' to yourself?',
                'buttonLabels': ['Yes', 'Cancel']
            };
            window.plugins.actionsheet.show(options, function (buttonIndex) {
                if (buttonIndex === 1) {
                    //test123
                    var currentResource = null;

                    for (var i = 0; i < ResourceData.length; i++) {
                        if (ResourceData[i].STKR__User__c == creds.UserID) {
                            currentResource = ResourceData[i].Id
                        }
                    }
                    if (!currentResource) {
                        app.toastMessage("Can't find the resource", "long");
                        return;
                    }
                    $.ajax({
                        url: creds.instanceUrl + '/services/data/v28.0/sobjects/STKR__Visit__c/' + data.Id,
                        data: JSON.stringify({
                            STKR__Status__c: 'Accepted',
                            STKR__Accepted__c: new Date().toJSON(),
                            STKR__Resource__c: currentResource
                        }),
                        type: 'PATCH',
                        headers: { 'Authorization': 'Bearer ' + creds.accessToken },
                        contentType: 'application/json',
                        success: function (a, b) {
                            app.pane.loader.hide();
                            //LOG && console.log('data', a, b);

                            window.plugins.toast.showWithOptions({
                                message: 'The resource has been changed please refresh',
                                duration: "long", // 2000 ms
                                position: "center",
                                styling: {
                                    opacity: 1, // 0.0 (transparent) to 1.0 (opaque). Default 0.8
                                    backgroundColor: '#FF0000', // make sure you use #RRGGBB. Default #333333
                                    textColor: '#FFFFFF', // Ditto. Default #FFFFFF
                                    textSize: 20.5, // Default is approx. 13.
                                }
                            });

                            $("#MyVisitModalView").kendoMobileModalView("close");
                            DataShowNearbyVisit();
                            $("#tabstripnearby_otherusers").addClass("km-state-active");
                            $("#tabstripnearby_myvisits").removeClass("km-button km-state-active");
                            window.location.replace("#nearbyvisit_otherusers");
                        },
                        error: function (error) {
                            if (error.statusText === 'timeout') {
                                app.toastMessage('Timeout...', 'long');
                            }
                            app.toastMessage('An error occured please see the error log', 'long');
                        },
                        timeout: 5000
                    });
                } else {
                    return;
                }
            });
        }
        return;
    }

    if (data.STKR__Status__c === "Open") {
        //'Accept visit '+data.Name;
        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
            'title': 'Are you sure you want to accept visit ' + data.Name + ' ?',
            'buttonLabels': ['Accept', 'Cancel']
        };
        window.plugins.actionsheet.show(options, function (buttonIndex) {
            if (buttonIndex === 1) {
                ChangeVisitStatus(data, 'MyVisitsStatus' + data.Id);
            } else if (buttonIndex === 2) {
            }
        });
    }
    if (data.STKR__Status__c === "Accepted") {
        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
            'title': 'Are you sure you want to start the journey to Visit ' + data.Name + ' ?',
            'buttonLabels': ['Start', 'Cancel']
        };
        window.plugins.actionsheet.show(options, function (buttonIndex) {
            if (buttonIndex === 1) {
                ChangeVisitStatus(data, 'MyVisitsStatus' + data.Id);
            } else if (buttonIndex === 2) {
            }
        });
    }
    if (data.STKR__Status__c === "Journey Started") {
        var options = {
            'androidTheme': window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_DARK,
            'title': 'Are you sure you want to Arrive at the Visit ' + data.Name + ' ?',
            'buttonLabels': ['Arrive', 'Cancel']
        };
        window.plugins.actionsheet.show(options, function (buttonIndex) {
            if (buttonIndex === 1) {
                ChangeVisitStatus(data, 'MyVisitsStatus' + data.Id);
            } else if (buttonIndex === 2) {
            }
        });
    }
    /*
    //Change with some native Ui .. It is not working ... 
    // Also close the modal view in the end... 
    var ConfirmationDialogModalViewTemplate = kendo.template($("#ChangeStatusOfVisitConfirmation").html());
    $('#ChangeDynamicStatusOfVisits_List').html(ConfirmationDialogModalViewTemplate(data));
    $('#ChangeStatusOfVisits_List').kendoMobileModalView("open");
    $('#ChangeStatusOfVisits_List').css('z-index', '1');
    */
}

function OpenAboutPage() {
    if (device.platform === "Android") {
        navigator.app.loadUrl('http://www.servicetrackersystems.com/Mobile.html', { openExternal: true });
    }
    if (device.platform === "iOS") {
        window.open("http://www.servicetrackersystems.com/Mobile.html", '_system');
    }
}

// function NavigateToClientAttachment(AccountId, VisitId, FromWhere) {
//     accountid = AccountId;
//     visitid = VisitId;
//     fromwhere = FromWhere;
//     app.navigate('view/AttachmentFolder.html?accountid=' + accountid + '&visitid=' + visitid + '&From=' + fromwhere);
// }

function NavigateToClientAttachment(AccountId, VisitId, FromWhere, scheduleid) {
    accountid = AccountId;
    visitid = VisitId;
    fromwhere = FromWhere;
    app.navigate('view/AttachmentFolder.html?accountid=' + accountid + '&visitid=' + visitid + '&From=' + fromwhere + '&scheduleid=' + scheduleid);
}

function movetoLoadAllData(OnlyUpload) {
    app.pane.loader.show();

    // Check the connection
    try {
        // Check whether to obtain new access token or refresh token
        jsconn.query("SELECT Id FROM Account LIMIT 1", function (err, result) {
            if (err) {
                app.pane.loader.hide();
                err = err.toString();
                if (err.indexOf("ERROR_HTTP_400") > -1) {
                    AppIsOnline = false;
                    app.toastMessage("Internet is not working ... ", "long");
                    InternetStatusFooter = "ServiceTracker is offline. Data is stored for upload when online";
                    $('#InternetStatusFooter').html(InternetStatusFooter);
                    $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
                    $('#MyVisitsFooter').css("color", "#ff6666");
                    $(".OfflineOnlineMessage").text(InternetStatusFooter);
                }
                if (err === "invalid_grant: expired access/refresh token") {
                    Login();
                }
                if (err.toLowerCase().indexOf('request_limit_exceeded') > -1) {
                    app.toastMessage('API request Limit is excceded, Please work offline till then', 'long');
                }
                return LOG && console.log(err);
            }
            app.pane.loader.hide();
            AppIsOnline = true;

            InternetStatusFooter = "Network is ONLINE- good data signal is assumed";
            $('#InternetStatusFooter').html(InternetStatusFooter);
            $('#InternetStatusInspectionFooter').html(InternetStatusFooter);
            $('#MyVisitsFooter').css("color", "#39B7CD");
            $('.OfflineOnlineMessage').text(InternetStatusFooter);
             if (OnlyUpload) {
                 UploadOfflineChanges(false);
             } else {
            app.navigate('view/LoadAllData.html');
             }
        });
    } catch (err) {
        AppIsOnline = false;
        app.pane.loader.hide();
        app.toastMessage('Problem while connecting to internet', 'long');
    }
}

//For push notification delayed notification
function attchInterval() {
    ClickedOnButton = true;
    app.navigate('view/LoadAllData.html');
}

function LogMoreErrorInfo(errInfo, LineInfo) {
    var connectionType = navigator.connection.type; // e.g. 4g, 3g, wifi
    var userAgentString = navigator.userAgent; // e.g. OS, Vendor, Model
    var allInfo = LineInfo + '\n' + connectionType + '\n' + JSON.stringify(errInfo) + '\n\n' + userAgentString;
    StoreError(allInfo);
}

function downloaddocx(PathToDownload, FileName, type) {
    LOG && console.log('*********dowloaddocx00', PathToDownload, FileName, type);
    var filepath = encodeURI(PathToDownload);
    if (device.platform === 'Android') {
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
            dir.getFile(FileName, { create: true }, function (file) {
                var fileTransfer = new FileTransfer();
                LOG && console.log('******dowloaddocx1', filepath, file.nativeURL);
                fileTransfer.download(filepath, file.nativeURL, function (newFileEntry) {
                    // Open file

                    var contentType = '';

                    switch (type.toLowerCase()) {
                        case 'png':
                            contentType = 'image/png';
                            break;
                        case 'jpg':
                            contentType = 'image/jpeg';
                            break;
                        case 'gif':
                            contentType = 'image/fig';
                            break;
                        case 'pdf':
                            contentType = 'application/pdf';
                            break;
                        case 'doc':
                            contentType = 'application/msword';
                            break;
                        case 'docx':
                            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                            break;
                        case 'xlsx':
                            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                            break;
                        case 'txt':
                            contentType = 'text/plain';
                            break;
                        default:
                            app.toastMessage('Unknown file format ' + type, 'long');
                            break;
                    }
                    LOG && console.log('******dowloaddocx2', contentType, newFileEntry.nativeURL);
                    cordova.plugins.fileOpener2.open(decodeURIComponent(newFileEntry.nativeURL),
                        contentType, {
                        error: function (e) {
                            app.pane.loader.hide();
                            app.toastMessage('No app support this file on your device\n' + e, 'long');
                        },
                        success: function () {
                        }
                    });
                }, function (error) {
                    if (error.code === 1) {
                        app.toastMessage('File is not available', 'long');
                    } else if (error.exception === "Too many follow-up requests: 21") {
                        try {
                            var test = PathToDownload.split('/');
                            test[2] = OrgInfo.photos.picture.split('/')[2];
                            var url = test.join('/');
                            downloaddocx(url, FileName, type);
                        } catch (er) {
                        }
                    } else {
                        console.error('Error with #download method.' + JSON.stringify(error));
                        LOG && console.log(error);
                    }
                }, false, {
                    headers: { "Authorization": "Bearer " + creds.accessToken }
                });
            });
        });
    } else if (device.platform === 'iOS') {
        window.resolveLocalFileSystemURL(cordova.file.syncedDataDirectory, function (dir) {
            dir.getFile(FileName, { create: true }, function (file) {
                var fileTransfer = new FileTransfer();

                fileTransfer.download(filepath, file.nativeURL, function (newFileEntry) {

                    var contentType = '';
                    switch (type) {
                        case 'png':
                            contentType = 'image/png';
                            break;
                        case 'jpg':
                            contentType = 'image/jpeg';
                            break;
                        case 'gif':
                            contentType = 'image/fig';
                            break;
                        case 'pdf':
                            contentType = 'application/pdf';
                            break;
                        case 'doc':
                            contentType = 'application/msword';
                            break;
                        case 'docx':
                            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                            break;
                        case 'xlsx':
                            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                            break;
                        case 'txt':
                            contentType = 'text/plain';
                            break;
                        default:
                            app.toastMessage('Unknown file format ' + type, 'long');
                            break;
                    }
                    // Open file

                    cordova.plugins.fileOpener2.open(decodeURI(newFileEntry.nativeURL),
                        contentType, {
                        error: function (e) {
                            app.pane.loader.hide();
                            app.toastMessage('No app support this file on your device.', 'long');
                            LOG && console.log(e);
                        },
                        success: function () {
                        }
                    });
                }, function (error) {
                    if (error.code === 1) {
                        app.toastMessage('File is not available', 'long');
                    } else if (error.code === 3) {
                        app.toastMessage('File is not available', 'long');
                    } else if (error.exception === "Too many follow-up requests: 21") {
                        try {
                            var test = PathToDownload.split('/');
                            test[2] = OrgInfo.photos.picture.split('/')[2];
                            var url = test.join('/');
                            downloaddocx(url, FileName, type);
                        } catch (er) {
                        }
                    } else {
                    }
                }
                    , false, {
                    headers: { "Authorization": "Bearer " + creds.accessToken }
                }
                );
            });
        });
    }
}

function Logout() {
    // // Store data in local storage
    // var LogoutState = {};

    // LogoutState['UserID'] = creds.UserID;
    // LogoutState['EventType'] 

    // window.localStorage.setItem("LogoutState",json.stringify(LogoutState));
    if (AppIsOnline) {
        try {
            if (window.localStorage.getItem("EventType") === "" || window.localStorage.getItem("EventType") === null || window.localStorage.getItem("EventType") === 'End') {
                app.toastMessage('Please End Work before logging out', 'long');
                return;
            } else {
            }
        } catch (Error) {
            LOG && console.log(Error);
        }
        app.db.transaction(function (tx) {
            tx.executeSql("Select * from DataToUpdate", [],
                function (tx, rs) {
                    if (rs.rows.length === 0) {
                        // tx.executeSql("SELECT SFId FROM PushNotificationDetail WHERE userid=?", [creds.UserID], function (m, n) {
                        // var datatodelete = [];
                        // for (var i = 0; i < n.rows.length; i++) {
                        //     datatodelete.push(n.rows.item(i)['SFId']);
                        // }

                        // Delete the records from the salesforce .. 
                        // if (datatodelete.length)
                        //     jsconn.sobject("MobilePushServiceDevice").del(datatodelete,
                        //         function (err, ret2) {
                        //             if (err) {
                        //                 return console.error(err);
                        //             }
                        //             app.db.transaction(function (tx) {
                        //                 tx.executeSql("DELETE FROM PushNotificationDetail WHERE userid=?", [creds.UserID], function (a, b) {
                        //                 }, function (e) {
                        //                 });
                        //             });
                        //         });
                        // });

                        try {
                            window.plugins.spinnerDialog.show(
                                null, // title
                                "Logging out", // <me>    </me>ssage
                                true // non-dismissable
                            );
                            // hide after 5000 milliseconds
                            setTimeout(function () {
                                app.deleteAllData('Credential', function (a, b) {
                                    // app.navigate('#');
                                    window.plugins.spinnerDialog.hide();
                                    onDeviceReady();
                                });
                            }, 5000);
                        } catch (e) {
                            LOG && console.log(e);
                        }
                    } else {
                        app.toastMessage("You have some record in local database", 'long');
                    }
                },
                function (err) {
                    console.error('' + err);
                });
        });
    } else {
        app.toastMessage("Device is offline.", 'long');
    }
}

function getDependentOptions(objName, ctrlFieldName, depFieldName) {
    // Isolate the Describe info for the relevant fields
    var objDesc;
    switch (objName) {
        case 'STKR__Service_Item__c':
            objDesc = InspectionItemMetadata;
            break;
        case 'STKR__Inspection__c':
            objDesc = InspectionMetadata;
            break;
    }
    var ctrlFieldDesc, depFieldDesc;
    var found = 0;
    for (var i = 0; i < objDesc.fields.length; i++) {
        var f = objDesc.fields[i];
        if (f.name == ctrlFieldName) {
            ctrlFieldDesc = f;
            found++;
        } else if (f.name == depFieldName) {
            depFieldDesc = f;
            found++;
        }
        if (found == 2)
            break;
    }

    // Set up return object
    var dependentOptions = {};
    var ctrlValues = ctrlFieldDesc.picklistValues;
    for (var i = 0; i < ctrlValues.length; i++) {
        dependentOptions[ctrlValues[i].label] = [];
    }

    //var base64 = new sforce.Base64Binary("");
    function testBit(validFor, pos) {
        var byteToCheck = Math.floor(pos / 8);
        var bit = 7 - (pos % 8);
        return ((Math.pow(2, bit) & validFor.charCodeAt(byteToCheck)) >> bit) == 1;
    }

    // For each dependent value, check whether it is valid for each controlling value
    var depValues = depFieldDesc.picklistValues;
    for (var i = 0; i < depValues.length; i++) {
        var thisOption = depValues[i];
        var validForDec = atob(thisOption.validFor);
        for (var ctrlValue = 0; ctrlValue < ctrlValues.length; ctrlValue++) {
            if (testBit(validForDec, ctrlValue)) {
                dependentOptions[ctrlValues[ctrlValue].label].push(thisOption.label);
            }
        }
    }
    return dependentOptions;
}

function UpdateWithOfflineRecords() {
    // Get list of records with 
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * From DataToUpdate", [], function (err, success) {
            //id,jsondata,objectname,updated, updateorinsert, userid, recordid  
            var allData = success.rows;
            for (var i = 0; i < allData.length; i++) {
                var singleRecord = allData.item(i);
                var recordData = JSON.parse(singleRecord['jsondata']);
                //LOG && console.log('3', singleRecord, recordData);
                switch (singleRecord['objectname']) {
                    case 'STKR__Visit__c':
                        // Search Visit in AllVisit record
                        for (var j = 0; j < AllVisits.length; j++) {
                            if (AllVisits[j]['Id'] === recordData['Id']) {
                                // Find where is the current record
                                var currentArray = '', currentId = AllVisits[j]['Id'];
                                var determineOfflineArray = '';

                                if (AllVisits[j]['STKR__Status__c'] === 'Complete') {
                                    //Replace the Visit Completed record
                                    currentArray = 'Complete';
                                } else {
                                    var visitdueDate;
                                    var currentDateTime = new Date();
                                    var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

                                    if (device.platform === 'Win32NT') {
                                        // Added by Ashutosh on 15-09-2016
                                        var dates = (AllVisits[j]['STKR__Due_Date__c']).split('T')[0];
                                        var times = (AllVisits[j]['STKR__Due_Date__c']).split('T')[1];

                                        var day = dates.split('-')[2];
                                        var month = dates.split('-')[1];
                                        var year = dates.split('-')[0];

                                        var hour = times.split(':')[0];
                                        var minute = times.split(':')[1];
                                        var seconds = (times.split(':')[2]).split('.')[0];
                                        var milliseconds = times.split('.')[1].split('+')[0];

                                        visitdueDate = new Date(year, month - 1, day);
                                    } else if (device.platform === 'iOS') {
                                        // Added by Ashutosh on 15-09-2016
                                        var dates = (AllVisits[j]['STKR__Due_Date__c']).split('T')[0];
                                        var times = (AllVisits[j]['STKR__Due_Date__c']).split('T')[1];

                                        var day = dates.split('-')[2];
                                        var month = dates.split('-')[1];
                                        var year = dates.split('-')[0];

                                        var hour = times.split(':')[0];
                                        var minute = times.split(':')[1];
                                        var seconds = (times.split(':')[2]).split('.')[0];
                                        var milliseconds = times.split('.')[1].split('+')[0];
                                        visitdueDate = new Date(year, month - 1, day);
                                    } else {
                                        var visitdueDateTime = new Date(AllVisits[j]['STKR__Due_Date__c']);
                                        visitdueDate = new Date(visitdueDateTime.getFullYear(), visitdueDateTime.getMonth(), visitdueDateTime.getDate());
                                    }
                                    var diff = 0;
                                    diff = (visitdueDate).getTime() - (CurrentDate).getTime();
                                    diff = diff / (1000 * 60 * 60 * 24);

                                    if (diff < 0) {
                                        currentArray = 'Overdue';
                                    } else if (diff >= 0 && diff < 1) {
                                        currentArray = 'Today';
                                    } else if (diff >= 1 && diff < 7) {
                                        currentArray = 'This Week';
                                    } else if (diff >= 7 && diff <= 46) {
                                        currentArray = 'Within 45';
                                    }
                                }

                                // Determine the offline record array
                                if (recordData['STKR__Status__c'] === 'Complete') {
                                    //Replace the Visit Completed record
                                    determineOfflineArray = 'Complete';
                                } else {
                                    var visitdueDate;
                                    var currentDateTime = new Date();
                                    var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

                                    if (device.platform === 'Win32NT') {
                                        // Added by Ashutosh on 15-09-2016
                                        var dates = (recordData['STKR__Due_Date__c']).split('T')[0];
                                        var times = (recordData['STKR__Due_Date__c']).split('T')[1];

                                        var day = dates.split('-')[2];
                                        var month = dates.split('-')[1];
                                        var year = dates.split('-')[0];

                                        var hour = times.split(':')[0];
                                        var minute = times.split(':')[1];
                                        var seconds = (times.split(':')[2]).split('.')[0];
                                        var milliseconds = times.split('.')[1].split('+')[0];

                                        visitdueDate = new Date(year, month - 1, day);
                                    } else if (device.platform === 'iOS') {
                                        // Added by Ashutosh on 15-09-2016
                                        var dates = (recordData['STKR__Due_Date__c']).split('T')[0];
                                        var times = (recordData['STKR__Due_Date__c']).split('T')[1];

                                        var day = dates.split('-')[2];
                                        var month = dates.split('-')[1];
                                        var year = dates.split('-')[0];

                                        var hour = times.split(':')[0];
                                        var minute = times.split(':')[1];
                                        var seconds = (times.split(':')[2]).split('.')[0];
                                        var milliseconds = times.split('.')[1].split('+')[0];
                                        visitdueDate = new Date(year, month - 1, day);
                                    } else {
                                        var visitdueDateTime = new Date(recordData['STKR__Due_Date__c']);
                                        visitdueDate = new Date(visitdueDateTime.getFullYear(), visitdueDateTime.getMonth(), visitdueDateTime.getDate());
                                    }
                                    var diff = 0;
                                    diff = (visitdueDate).getTime() - (CurrentDate).getTime();
                                    diff = diff / (1000 * 60 * 60 * 24);

                                    if (diff < 0) {
                                        determineOfflineArray = 'Overdue';
                                    } else if (diff >= 0 && diff < 1) {
                                        determineOfflineArray = 'Today';
                                    } else if (diff >= 1 && diff < 7) {
                                        determineOfflineArray = 'This Week';
                                    } else if (diff >= 7 && diff <= 46) {
                                        determineOfflineArray = 'Within 45';
                                    }
                                }

                                //LOG && console.log('4', currentArray, determineOfflineArray);

                                // Delete the record from current array
                                switch (currentArray) {
                                    case 'Complete':
                                        for (var k = 0; k < VisitCompleted.length; k++) {
                                            if (VisitCompleted[k]['Id'] === recordData['Id']) {
                                                VisitCompleted.splice(k, 1);
                                                //LOG && console.log('5 Deleted');
                                            }
                                        }
                                        break;
                                    case 'Overdue':
                                        for (var k = 0; k < VisitOverdue.length; k++) {
                                            if (VisitOverdue[k]['Id'] === recordData['Id']) {
                                                VisitOverdue.splice(k, 1);
                                                LOG && console.log('5 Deleted');
                                            }
                                        }
                                        break;
                                    case 'Today':
                                        for (var k = 0; k < VisitToday.length; k++) {
                                            if (VisitToday[k]['Id'] === recordData['Id']) {
                                                VisitToday.splice(k, 1);
                                                //LOG && console.log('5 Deleted');
                                            }
                                        }
                                        break;
                                    case 'This Week':
                                        for (var k = 0; k < VisitThisWeek.length; k++) {
                                            if (VisitThisWeek[k]['Id'] === recordData['Id']) {
                                                VisitThisWeek.splice(k, 1);
                                                LOG && console.log('5 Deleted');
                                            }
                                        }
                                        break;
                                    case 'Within 45':
                                        for (var k = 0; k < VisitWithin45.length; k++) {
                                            if (VisitWithin45[k]['Id'] === recordData['Id']) {
                                                VisitWithin45.splice(k, 1);
                                                LOG && console.log('5 Deleted');
                                            }
                                        }
                                        break;
                                    case '':
                                        app.toastMessage('Not able to find the visit', 'long');
                                        break;
                                }
                                LOG && console.log('6 Determined Array', determineOfflineArray, recordData);

                                // Assign the offline data to determined array
                                switch (determineOfflineArray) {
                                    case 'Complete':
                                        VisitCompleted.push(recordData);
                                        break;
                                    case 'Overdue':
                                        VisitOverdue.push(recordData);
                                        break;
                                    case 'Today':
                                        VisitToday.push(recordData);
                                        break;
                                    case 'This Week':
                                        VisitThisWeek.push(recordData);
                                        break;
                                    case 'Within 45':
                                        VisitWithin45.push(recordData);
                                        break;
                                    case '':
                                        app.toastMessage('Not able to find the visit', 'long');
                                        break;
                                }
                                break;
                            }
                        }
                        function StoreInVisitsTable(recordata) {
                            app.db.transaction(function (tx) {
                                //LOG && console.log('From Updating info',recordata);                             
                                tx.executeSql("UPDATE Visits SET jsondata = ? WHERE visitid = ?", [recordata['jsondata'], recordata['recordid']],
                                    function (a, b) {
                                    },
                                    function (a, b) {
                                    });
                            });
                        }
                        StoreInVisitsTable(singleRecord);
                        break;
                    case 'STKR__Inspection__c':
                        for (var j = 0; j < InspectionData.length; j++) {
                            if (InspectionData[j]['STKR__UniqueId__c'] == recordData['STKR__UniqueId__c']) {
                                for (property in InspectionData[j]) {
                                    if (property !== 'Id') {
                                        InspectionData[j][property] = recordData[property];
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    case 'STKR__Service_Item__c':
                        for (var j = 0; j < InspectionItemData.length; j++) {
                            if (InspectionItemData[j]['STKR__Mobile_Unique_Id__c'] == recordData['STKR__Mobile_Unique_Id__c']) {
                                for (property in InspectionItemData[j]) {
                                    if (property !== 'Id') {
                                        InspectionItemData[j][property] = recordData[property];
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    case 'STKR__Chlorination_Results__c':
                        for (var j = 0; j < AnalysisData.length; j++) {
                            if (AnalysisData[j]['STKR__Mobile_Unique_Id2__c'] == recordData['STKR__Mobile_Unique_Id2__c']) {
                                for (property in AnalysisData[j]) {
                                    if (property !== 'Id') {
                                        AnalysisData[j][property] = recordData[property];
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    case 'STKR__Actions__c':
                        break;
                    case 'STKR__Prep_Waste_Management__c':
                        break;
                    case 'STKR__Resource__c':
                        break;
                    case 'Contact':
                        break;
                    case 'Event':
                        break;
                }
            }
        }
            , function (err) {
            }
        );
    });
}

function UpdateGeolocation(dataForGeoLocation) {
    var options = {
        enableHighAccuracy: true
    };

    // if (!AppIsOnline) {
    //     options['enableHighAccuracy'] = false;
    //     options['timeout'] = 5000;
    // }
    if (UserCurrentLocation_WatchId) {
         
        console.log('data in side new code',data);
               if (dataForGeoLocation.STKR__Status__c === 'Journey Started') {
                   dataForGeoLocation['STKR__Journey_Start_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                   dataForGeoLocation['STKR__Journey_Start_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;

                   try {
                       if (dataForGeoLocation.Id === newDetailValue[0]['Id']) {
                           newDetailValue[0]['STKR__Journey_Start_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                           newDetailValue[0]['STKR__Journey_Start_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;
                       }
                   } catch (err) {
                   }

                   if (!dataForGeoLocation['STKR__Arival_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Arival_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Arival_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Arival_GeoLocation__Longitude__s'];

                   if (!dataForGeoLocation['STKR__Completion_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Completion_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Completion_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Completion_GeoLocation__Longitude__s'];
               } else if (dataForGeoLocation.STKR__Status__c === 'In Progress') {
                   dataForGeoLocation['STKR__Arival_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                   dataForGeoLocation['STKR__Arival_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;
                   try {
                       if (dataForGeoLocation.Id === newDetailValue[0]['Id']) {
                           newDetailValue[0]['STKR__Arival_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                           newDetailValue[0]['STKR__Arival_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;
                       }
                   } catch (err) {
                   }

                   if (!dataForGeoLocation['STKR__Journey_Start_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Journey_Start_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Journey_Start_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Journey_Start_GeoLocation__Longitude__s'];

                   if (!dataForGeoLocation['STKR__Completion_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Completion_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Completion_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Completion_GeoLocation__Longitude__s'];
               } else if (dataForGeoLocation.STKR__Status__c === "Complete") {
                   LOG && console.log('completion');

                   dataForGeoLocation['STKR__Completion_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                   dataForGeoLocation['STKR__Completion_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;

                   try {
                       if (dataForGeoLocation.Id === newDetailValue[0]['Id']) {
                           newDetailValue[0]['STKR__Completion_GeoLocation__Latitude__s'] = UserCurrentLocation.coords.latitude;
                           newDetailValue[0]['STKR__Completion_GeoLocation__Longitude__s'] = UserCurrentLocation.coords.longitude;
                       }
                   } catch (err) {
                   }

                   if (!dataForGeoLocation['STKR__Journey_Start_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Journey_Start_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Journey_Start_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Journey_Start_GeoLocation__Longitude__s'];

                   if (!dataForGeoLocation['STKR__Arival_GeoLocation__Latitude__s'])
                       delete dataForGeoLocation['STKR__Arival_GeoLocation__Latitude__s'];

                   if (!dataForGeoLocation['STKR__Arival_GeoLocation__Longitude__s'])
                       delete dataForGeoLocation['STKR__Arival_GeoLocation__Longitude__s'];
               }
               console.log('console before return',JSON.stringify(newDetailValue[0]));
               return dataForGeoLocation;
    
       } else {
        checkGeolocationPermissions();
         /*  isDataStoreOffline++;
           if (isDataStoreOffline === 3) {
               if (CompleteVisit == 1) {
                   PushAllData();
               }
               // NetworkChangePopup();
           } */
       }

}

//To count the records on offline table
function CountNumberOfOflineItem() {
    app.selectAllRecords('DataToUpdate', function (tx, rs) {
        var elements = $(".OfflineDataItemCount");
        if (rs.rows.length) {
            elements.show();
            elements.html(rs.rows.length);
            //document.getElementById("OfflineCount").innerHTML = 11;
        } else {
            elements.hide();
        }
    }, function (tx, err) {
        LOG && console.log(tx, err);
    });

}

function returnWeekDays() {
    /* Get the week days according to today */
    var WeekDaysSeq = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var tempWeekDaysSeq = [];
    for (var i = new Date().getDay(); i < new Date().getDay() + 7; i++) {
        if (i <= 6) {
            tempWeekDaysSeq.push(WeekDaysSeq[i]);
        } else if (i > 6) {
            tempWeekDaysSeq.push(WeekDaysSeq[i % 7]);
        }
    }
    return tempWeekDaysSeq;
}

function returnWeekDays_45days() {
    var WeekDaysSeq_45days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var tempWeekDaysSeq_45days = [];
    for (var i = new Date().getDay() + 7; i < new Date().getDay() + 46; i++) {
        if (i <= 6) {
            tempWeekDaysSeq_45days.push(WeekDaysSeq_45days[i]);
        } else if (i > 6) {
            tempWeekDaysSeq_45days.push(WeekDaysSeq_45days[i % 7]);
        }
    }
    return tempWeekDaysSeq_45days;
}

function returnMonth() {
    var MonthSeq = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    tempMonthSeq = [];
    for (var i = new Date().getMonth(); i < new Date().getMonth() + 12; i++) {
        if (i <= 11) {
            tempMonthSeq.push(MonthSeq[i]);
        } else if (i > 11) {
            tempMonthSeq.push(MonthSeq[i % 12]);
        }
    }
    return tempMonthSeq;
}

function TerminateApp() {
    if (count_exit >= 2) {
        navigator.app.exitApp();
    }
    setTimeout(removeExit, 2000);
}

var removeExit = function () {
    count_exit = 0;
};

function UpdateVolume_Create(value) {
    UpdatedPrepWasteId = value;
    UpdatedVolume = '';
    for (var i = 0; i < Prep_WasteData.length; i++) {
        if (Prep_WasteData[i]['Id'] === UpdatedPrepWasteId) {
            UpdatedVolume = Prep_WasteData[i]['STKR__Volume__c'];
            $("#STKR__Volume__c_Create").val(UpdatedVolume);
        }
    }
}

function UpdateVolume_Detail(value) {
    UpdatedPrepWasteId = value;
    UpdatedVolume = '';
    for (var i = 0; i < Prep_WasteData.length; i++) {
        if (Prep_WasteData[i]['Id'] === UpdatedPrepWasteId) {
            UpdatedVolume = Prep_WasteData[i]['STKR__Volume__c'];
            $("#STKR__Volume__c_Detail").val(UpdatedVolume);
        }
    }
}

function clearAllVariables() {
    AllVisits = [];
    VisitOverdue = [];
    VisitToday = [];
    VisitThisWeek = [];
    VisitWithin45 = [];
    VisitCompleted = [];
    VisitNearby = [];

    VisitOverdueCount = 0;
    VisitTodayCount = 0;
    VisitThisWeekCount = 0;
    VisitWithin45Count = 0;
    VisitCompletedCount = 0;
    VisitNearbyCount = 0;

    ScheduleData = [];
    ScheduleMetadata = [];
    ScheduleItemMetadata = [];
    ActionData = [];
    ActionMetadata = [];
    ActionRecordTypes = [];
    ActionRecordTypeDetail = [];
    AlertsData = [];
    Prep_WasteData = [];
    PrepWasteMetadata = [];
    Prep_WasteManagementData = [];
    ContactData = [];
    ResourceData = [];
    ResourceMetadata = [];
    ResourceRecordtype = [];
    AnalysisData = [];
    InspectionData = [];
    InspectionItemData = [];
    Userdata = [];
    EventData = [];
    AllAccounts = [];
    ContactMetadata = [];
    TaskData = [];
    ContractData = [];
    vehicleData = [];
    //=========
    CountAccounts = 0;
    CountInspection = 0;
    CountInspectionItem = 0;
    CountSchedule = 0;
    CountPrep = 0;
    CountAnalysis = 0;
    CountContact = 0;
    CountAlert = 0;
    CountAction = 0;
    CountVisit = 0;
    CountResource = 0;
    CountPrep_WasteManagement = 0;
    CountInspectionRecordType = 0;
    CountInspectionItemRecordType = 0;
    CountVisitRecordType = 0;
    CountAnalysisRecordTypes = 0;
    CountResourceRecordtype = 0;
    CountUserdata = 0;

    PrepWasteManagementPageLayout = [];
    InspectionRecordType = [];
    InspectionItemRecordType = [];
    VisitRecordTypes = [];
    AllVisitPageLayout = [];
    AnalysisRecordTypes = [];
    InspectionMetadata = {};
    VisitMetadata = {};
    AnalysisMetadata = [];
    InspectionItemRecordTypeDetail = [];
    PrepWasteManagementMetadata = [];
    InspectionItemMetadata = [];
    AnalysisRecordTypeDetail = [];
    OrgInfo = {};
    PersonalEvents = [];
    EventsMetadata = [];
    EventsLayouts = [];
    EventRecordTypes = [];
    EventRecordTypeDetail = [];
}

function combineVisitandEvent(visits, events) {
   
    var combinedArray = [];
    var newVisits = [];
    var newEvents = [];
    for (var j = 0; j < visits.length; j++) {
      
        if(typeof visits[j]['STKR__Due_Date__c'] == "object"){
            console.log('object typeeeeeeee');

            visits[j]['ToSort'] = visits[j]['STKR__Due_Date__c'].getTime();
         }else{
            visits[j]['ToSort'] = new Date(visits[j]['STKR__Due_Date__c']).getTime();
         }
    
        newVisits.push(visits[j]);
    }
    for (var j = 0; j < events.length; j++) {
        events[j]['ToSort'] = new Date(events[j]['StartDateTime']).getTime();
        events[j]['STKR__Due_Date__c'] = events[j]['StartDateTime'];
        newEvents.push(events[j]);
    }
    combinedArray = combinedArray.concat(newVisits);
    combinedArray = combinedArray.concat(newEvents);
    combinedArray.sort(function (a, b) { return a.ToSort - b.ToSort });
    //combinedArray.sort(compare);
    for (var i = 0; i < combinedArray.length; i++) {
        delete combinedArray[i]['ToSort'];
    }
    return combinedArray;
}

function compare(a, b) {
    try {
        if (a.STKR__Account__c.toLowerCase() < b.STKR__Account__c.toLowerCase())
            return -1;
        if (a.STKR__Account__c.toLowerCase() > b.STKR__Account__c.toLowerCase())
            return 1;
    } catch (err) {
        console.error(err);
    }
    return 0;
}

function GetEventdataOffline() {

    EventsOverdueCount = 0;
    EventsTodayCount = 0;
    EventsThisWeekCount = 0;
    EventsWithin45Count = 0;
    EventsOverdue = [];
    EventsToday = [];
    EventsThisWeek = [];
    EventsWithin45 = [];

    var EventStartDate;
    var currentDateTime = new Date();
    var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());

    for (var i = 0; i < PersonalEvents.length; i++) {
        if (device.platform === 'Win32NT') {
            var dates = (PersonalEvents[i]['StartDateTime']).split('T')[0];
            var times = (PersonalEvents[i]['StartDateTime']).split('T')[1];

            var day = dates.split('-')[2];
            var month = dates.split('-')[1];
            var year = dates.split('-')[0];

            var hour = times.split(':')[0];
            var minute = times.split(':')[1];
            var seconds = (times.split(':')[2]).split('.')[0];
            var milliseconds = times.split('.')[1].split('+')[0];
            EventStartDate = new Date(year, month - 1, day);
        } else if (device.platform === 'iOS') {
            if (typeof (PersonalEvents[i]['StartDateTime']) == "object") {
                EventStartDate = new Date(PersonalEvents[i]['StartDateTime'].getFullYear(), PersonalEvents[i]['StartDateTime'].getMonth(), PersonalEvents[i]['StartDateTime'].getDate());
            } else {
                var dates = (PersonalEvents[i]['StartDateTime']).split('T')[0];
                var times = (PersonalEvents[i]['StartDateTime']).split('T')[1];

                var day = dates.split('-')[2];
                var month = dates.split('-')[1];
                var year = dates.split('-')[0];

                var hour = times.split(':')[0];
                var minute = times.split(':')[1];
                var seconds = (times.split(':')[2]).split('.')[0];
                var milliseconds = times.split('.')[1].split('+')[0];
                EventStartDate = new Date(year, month - 1, day);

            }
        } else {
            var EventStartDateTime = new Date(PersonalEvents[i]['StartDateTime']);
            EventStartDate = new Date(EventStartDateTime.getFullYear(), EventStartDateTime.getMonth(), EventStartDateTime.getDate());
        }
        var diff = 0;
        diff = (EventStartDate).getTime() - (CurrentDate).getTime();
        diff = diff / (1000 * 60 * 60 * 24);

        if (diff < 0) {
            EventsOverdue[EventsOverdueCount++] = PersonalEvents[i];
        } else if (diff >= 0 && diff < 1) {
            EventsToday[EventsTodayCount++] = PersonalEvents[i];
        } else if (diff >= 1 && diff < 7) {
            EventsThisWeek[EventsThisWeekCount++] = PersonalEvents[i];
        } else if (diff >= 7 && diff <= 46) {
            EventsWithin45[EventsWithin45Count++] = PersonalEvents[i];
        }
    }
}

function NavigateToRecentInspection() {
    window.history.forward();
    // var InspectionFound = false;
    // if (!StoreInspectionId) {
    //     try {
    //         StoreInspectionId = window.localStorage.getItem('StoreInspectionId');
    //     } catch (err) {
    //         app.toastMessage("No Recent Inspection found", "long");
    //     }
    // }
    // for (var i = 0; i < InspectionData.length; i++) {
    //     if (InspectionData[i]['Id'] === StoreInspectionId) {
    //         app.navigate("view/InspectionDetailPage.html?inspectionid=" + InspectionData[i]['Id'] + "&inspectionitemid=" + InspectionData[i]['STKR__Service_Item__c']);
    //         InspectionFound = true;
    //     }
    // }
    // if (!InspectionFound) {
    //     app.toastMessage("No Recent Inspection found", "long");
    // }
}

Date.prototype.getWeek = function () {
    var onejan = new Date(this.getFullYear(), 0, 1, this.getHours(), this.getMinutes(), this.getSeconds());
    return Math.ceil((((this.getTime() + (((-1 * this.getTimezoneOffset() + 1)) * 60000)) / 86400000) + onejan.getDay()) / 7)
}

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function getDefaultCurrency() {
    if (AppIsOnline) {
        jsconn.apex.get("/STKR/Mapp_GetUserCurrency/", function (err, data) {
            if (err) {
                console.error('Not able to download the default currency details.:\n' + JSON.stringify(err));
            }
            if (data) {
                userDefaultCurrency = data;
                window.localStorage.setItem('userDefaultCurrency', data);
            } else {
                userDefaultCurrency = "&pound;";
            }
        });
    } else {
        var fromLocalStorage = window.localStorage.getItem('userDefaultCurrency');
        if (fromLocalStorage) {
            userDefaultCurrency = fromLocalStorage;
        } else {
            userDefaultCurrency = "&pound;";
        }
    }

}

function PushAllData() {
    movetoLoadAllData(true);
}

function nativeScrollingIssueFix() {
    if (device.platform == "Android" && device.version == "9") {
        var css =
            `
            .km-content {
                overflow: scroll !important;
            }
            `,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }
}

function sep_fetchandCreate(Subject, calNotes, EventStartDate, EventEndDate) {
    var calOptions = window.plugins.calendar.getCalendarOptions();
    calOptions.calendarId = calDetails.id;
    calOptions.calendarName = calDetails.name;

    if (device.platform == 'iOS') {
        Subject = Subject && Subject.replace(/[^a-zA-Z ]/g, "");
        calNotes = calNotes && calNotes.replace(/[^a-zA-Z ]/g, "");

        if (!Subject) {
            Subject = " ";
        }
        if (!calNotes) {
            calNotes = " ";
        }
        if (!EventStartDate) {
            return;
        }
        if (!EventEndDate) {
            return;
        }
    }
    //LOG && console.log('Calendar : ', calDetails, Subject, calNotes, EventStartDate, EventEndDate);
    //debugger;

    // window.plugins.calendar.findEventWithOptions(Subject, null, calNotes, EventStartDate, EventEndDate, calOptions, function (d) {
    //     LOG && console.log('ddd', d);
    //     if (d.length) {
    //         // Do not create the event
    //     } else {
    //         LOG && console.log('me yaha hu');
    window.plugins.calendar.createEventWithOptions(Subject, null, calNotes, EventStartDate, EventEndDate, calOptions, function (message) {
        //LOG && console.log("Success: ", message);
    }, function (message) {
        LOG && console.log("Error: " + message);
    });
    //     }
    // }, function (er) { LOG && console.log(er); });
}

function compactLayout_dynamicTemplate(compactLayout, currentObject) {
    var template = kendo.template($("#CompactLayoutItemTemplate").text());
    var result = template(compactLayout);

    //Pass the data to the compiled template
    $('#parseHTMLforDynamic_InspectionItemList').html(result);

    for (var i = 0; i < $('span.changeToCode').length; i++) {
        $('span.changeToCode')[i].innerHTML = '#try{#${' + $('span.changeToCode')[i].innerText + '}#}catch(er){}#';
    }
    //Replace the currentObject api name
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    var mainTemplateContent = '';
    var cleanHTML = $("#parseHTMLforDynamic_InspectionItemList").html().replaceAll(currentObject + '.', '');
    cleanHTML = cleanHTML.replaceAll('toLabel', '');
    //cleanHTML = cleanHTML.replaceAll(')','');
    //onclick=\"PopupCreateInspection('${Id}','${RecordType.Name}','${RecordTypeId}')\">
    mainTemplateContent += "<div>"
        + cleanHTML +
        `</div>
        <div>
         <input class="ItemsOnSiteCheckbox" 
                type="checkbox" 
                style="width:20px;height:20px;top:30%;margin-left:98%;float:right;position:absolute;"
                id="ItemsOnSiteCheckbox\${Id}"/>
         </div>`;

    //LOG && console.log(mainTemplateContent);
    return mainTemplateContent;
}

function onchange_attUploadDoc(htmlFileId) {
    htmlFileId = htmlFileId || 'att_file';

    var file = document.querySelector('#' + htmlFileId + '[type=file]').files[0];
    var reader = new FileReader();
    if (!file) {
        app.toastMessage('No file selected', 'long');
        return;
    }
    if (file && (file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword" ||
        file.type === 'image/png' ||
        file.type === 'image/jpeg' ||
        file.type === 'text/plain')) {
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            if (!reader.result) {
                app.toastMessage("Can't upload the document", "long");
                return;
            }

            var DocsData = {
                ParentId: Attachment_Visitid,
                Name: file.name,
                Body: (reader.result).split(',')[1],
                ContentType: file.type,
                Description: ';--MobileCreateClientAttachment--;' + newDetailValue[0]['STKR__Account_lkp__c']
            };
            var AttachmentId_ClientAttachment = '';
            app.pane.loader.show();
            if (AppIsOnline) {
                jsconn.sobject("Attachment").create(DocsData,
                    function (err, ret) {
                        if (err || !ret.success) {
                            StoreError(err);
                            return console.error(err, ret);
                        }
                        LOG && console.log("Created record id : " + ret.id);
                        AttachmentId_ClientAttachment = ret.id;
                        app.pane.loader.hide();
                        app.toastMessage('Document Uploaded', 'long');
                        window.history.go(-1);
                        window.history.go(1);
                    });
            } else {
                //Store base64 data in file, then store path of the file in the database... 
                //then if file is uploaded to salesforce delete it from cache 
                var VisitName = newDetailValue[0]["Name"];

                if (device.platform === 'Android') {
                    window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (dir) {
                        dir.getDirectory('ServiceTracker/', { create: true, exclusive: false }, function (dirEntry1) {
                            dirEntry1.getDirectory(VisitName, { create: true, exclusive: false }, function (dirEntry2) {
                                dirEntry2.getFile(DocsData.Name, { create: true }, function (file) {
                                    file.createWriter(function (writer) {
                                        writer.onwrite = function (evt) {
                                            var datatoupload = {
                                                JsonData: JSON.stringify({ ...DocsData, Body: file.nativeURL }),
                                                ObjectName: 'Attachment',
                                                Updated: 'false',
                                                UpdateOrInsert: 'insert',
                                                UserId: creds.UserID,
                                                RecordId: null
                                            }
                                            app.insertRecord('DataToUpdate', datatoupload);
                                            app.pane.loader.hide();
                                            app.toastMessage('Document is Stored for later upload', 'long');
                                        };
                                        writer.write(b64toBlob(DocsData.Body, DocsData.ContentType));
                                    });
                                });
                            }, function (err) { console.error(err); });
                        }, function (err) { console.error(err); });

                    });
                } else if (device.platform === 'iOS') {
                    window.resolveLocalFileSystemURL(cordova.file.documentsDirectory, function (dir) {
                        dir.getFile(DocsData.Name, { create: true }, function (file) {
                            file.createWriter(function (writer) {
                                writer.onwrite = function (evt) {
                                    var datatoupload = {
                                        JsonData: JSON.stringify({ ...DocsData, Body: file.nativeURL }),
                                        ObjectName: 'Attachment',
                                        Updated: 'false',
                                        UpdateOrInsert: 'insert',
                                        UserId: creds.UserID,
                                        RecordId: null
                                    }
                                    app.insertRecord('DataToUpdate', datatoupload);
                                    app.pane.loader.hide();
                                    app.toastMessage('Document is Stored for later upload', 'long');
                                }
                                writer.write(b64toBlob(DocsData.Body, DocsData.ContentType));
                            });
                        });
                    });
                }
                //End
            }
        }
    } else {
        app.pane.loader.hide();
        app.toastMessage('Only Images, PDF, EXCEL and WORD documents are allowed', 'long');
    }
    /*if (file.size < 2048000) { } else {
        app.pane.loader.hide();
        app.toastMessage('File size is too large', 'long');
    }*/
}

function fetchBase64(url, callback, contentType) {
    //LOG && console.log('Fetch Base64', url, callback, contentType);
    if (contentType &&
        (contentType.toLowerCase() == "image/png;base64" ||
            contentType.toLowerCase() == "'image/jpeg;base64'" ||
            contentType.toLowerCase() == "data:image/jpg;base64")) {
        return callback(url);
    }


    let isFile = false;

    if (url.indexOf("file://") > -1) {
        isFile = true;
    } else {
        return callback(url);
    }

    LOG && console.log(isFile);

    //let FNs = url.split('/');
    //let fileName = FNs[FNs.length - 1];
    function fail(evt) {
        console.error(evt, url, contentType);
    }
    function readDataUrl(file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            //LOG && console.log(evt.target.result);
            return callback(evt.target.result.split(",")[1]);
        };
        reader.readAsDataURL(file);
    }

    window.resolveLocalFileSystemURL(url, function (fileEntry) {
        fileEntry.file(function (file) {
            readDataUrl(file);
        }, fail);
    }, fail);

    // window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (fileSystem) {
    //     fileSystem.root.getFile(fileName, null, function (fileEntry) {
    //         fileEntry.file(function (file) {
    //             readDataUrl(file);
    //         }, fail);
    //     }, fail);
    // }, fail);

    //ToDo : Test on iOS
}

function calculateRecordDate(dateinformation) {
    var returnFormatedDate;
    if (typeof (dateinformation) == "object") {
        return dateinformation;
    }
    if (device.platform === 'Win32NT') {
    } else if (device.platform === 'iOS') {

        // Added by Ashutosh on 15-09-2016
        var dates = (dateinformation).split('T')[0];
        var times = (dateinformation).split('T')[1];

        var day = dates.split('-')[2];
        var month = dates.split('-')[1];
        var year = dates.split('-')[0];

        var hour = times.split(':')[0];
        var minute = times.split(':')[1];
        var seconds = (times.split(':')[2]).split('.')[0];
        var milliseconds = times.split('.')[1].split('+')[0];


        returnFormatedDate = new Date(year, month - 1, day, hour, minute, seconds, milliseconds);


    } else {
        var recordDate = new Date(dateinformation);
        returnFormatedDate = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate(), recordDate.getHours(), recordDate.getMinutes(), recordDate.getSeconds(), recordDate.getMilliseconds());

    }
    return returnFormatedDate;
}

function openaccountcontactpage(htmlid){
  console.log(htmlid);
 // var AccountLookup = new CustomEvent('accountcontactlookupevent', { detail: htmlid });
  app.navigate('view/SelectLookupAccountContact.html?inputhtmlid='+htmlid +'&passedFromPage=ActionDetailPage_ActionData');
  UpdateActionValues(true);
  //href="view/SelectLookupAccountContact.html"
}

function openaccountcontactFromCreatepage(htmlid){
    var options = {
        androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT,
        title: 'Do you want to save this action and add email?',
        buttonLabels: ['Yes', 'No'],
        position: [20, 40]
    };
    // Device have internet and valid token
    window.plugins.actionsheet.show(options, function (buttonIndex) {
        if (buttonIndex == 1) {
            var retVal = CreateDynamicAction('addEmail',htmlid);
        } else {
            return;
        }
    });
   // app.navigate('view/SelectLookupAccountContact.html?inputhtmlid='+htmlid);
}

function updateAccountLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var t;
            for (i = 0; i < AllAccounts.length; i++) {
                if (AllAccounts[i]["Id"] == newDetailValue[0].STKR__Account_lkp__c) {
                    t = i;
                }
            }
            console.log(position)
           // AllAccounts[t]["STKR__location__c"] = position;

            var datatoupload = {
                STKR__location__Latitude__s: position.coords.latitude,
                STKR__location__Longitude__s: position.coords.longitude
            }

            for (var property in datatoupload) {
                AllAccounts[t][property] = datatoupload[property];
            }
            datatoupload['Id'] = AllAccounts[t]['Id'];
            app.insertRecord('Account', {
                JsonData: JSON.stringify(AllAccounts[t]),
                Updated: 'true',
                UserId: creds.UserID,
                // VisitID: AllAccounts[t]['Id']
            });
            //  app.insertRecord('DataToUpdate', datatoupload);
            if (AppIsOnline) {
                //Device is online
                jsconn.sobject("Account").update(datatoupload, function (err, ret) {
                    if (err || !ret.success) {
                        StoreError(err);
                        return console.error(err, ret);
                    }
                    app.toastMessage('Location is updated', 'long');
                    app.deleteRecord('DataToUpdate', ret.id);

                });
            } else {
                // Device is offline
                // Store in DataToUpdate table
                // Check if new offline record is being updated 

                var data = {
                    JsonData: JSON.stringify(AllAccounts[t]),
                    ObjectName: 'Account',
                    Updated: 'true',
                    UpdateOrInsert: 'update',
                    UserId: creds.UserID,
                    RecordId: AllAccounts[t]['Id']
                }
                app.insertRecord('DataToUpdate', data);
                app.toastMessage('Location is updated', 'long');


            }
        });
    }
}


module.exports=AllAccounts;