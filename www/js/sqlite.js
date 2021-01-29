app.db = null;

// Toast Message
app.toastMessage = function (msg, time) {
    // Time : 'short'/'long'
    try {
        window.plugins.toast.show(msg, time, 'bottom',
            function (a) {
                console.log('toast success: ' + a)
            }, function (b) {
                console.error('toast error: ' + b)
            });
    } catch (e) {
        alert(msg + ' ' + e);
    }
}

app.openDb = function () {
    if (window.sqlitePlugin !== undefined) {
        app.db = window.sqlitePlugin.openDatabase("ServiceTracker.db", "2.0");
        console.log("ServiceTracker Database is created");
    } else {
        app.db = window.openDatabase("ServiceTrackerOnSimulator", "1.0", "Cordova Demo", 200000);
        console.log("ServiceTracker Database Created on Simulator");
    }
}

// Create table, Parameter 1 : Array of table name
app.createTable = function (TableNameArray) {
    if (typeof (TableNameArray) === "string") {
        TableNameArray = [TableNameArray];
    }
    app.db.transaction(function (tx) {
        for (var tn = 0; tn < TableNameArray.length; tn++) {
            var TableName = TableNameArray[tn];
            var Query = '';
            if (TableName === 'Credential') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,accesstoken TEXT,instanceurl TEXT,orgtype TEXT,refreshtoken TEXT,userid TEXT)";
            } else if (TableName === 'Visits') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,visitid TEXT)";
            } else if (TableName === 'OthersVisits') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,visitid TEXT)";
            } else if (TableName === 'DataToUpdate') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,objectname TEXT,updated TEXT,updateorinsert TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'ImageData') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,imagedata TEXT,updated TEXT,userid TEXT,typeofdata TEXT)";
            } else if (TableName === 'Inspection') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,visitid TEXT,inspectionid TEXT)";
            } else if (TableName === 'InspectionItem') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT,inspectionitemid TEXT)";
            } else if (TableName === 'InspectionItemParameter') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,inspectionitemid TEXT,inspectionitemparameterid TEXT)";
            } else if (TableName === 'Action') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT,actionid TEXT)";
            } else if (TableName === 'Signature') {
                // Need to check later on.
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,imagedata TEXT,updated TEXT,userid TEXT,visitnumber TEXT)";
            } else if (TableName === 'Prep_Waste') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,Prep_WasteId TEXT)";
            }else if (TableName === 'Vehicle') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,vehicleId TEXT)";
            }else if (TableName === 'SkillRequirement') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,SkillId TEXT)";
            } else if (TableName === 'Analysis') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,analysisid TEXT)";
            } else if (TableName === 'Contact') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT,contactid TEXT)";
            } else if (TableName === 'Account') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT)";
            } else if (TableName === 'Schedule') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,scheduleid TEXT)";
            } else if (TableName === 'InspectionRecordType') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'InspectionItemRecordType') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'Resource') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,resourceid TEXT)";
            } else if (TableName === 'InspectionMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'AnalysisRecordType') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            }else if (TableName === 'vehicleRecordType') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            }else if (TableName === 'vehicleMetaData') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'AnalysisMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'Prep_WasteManagement') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,Prep_WasteMgmtId TEXT)";
            } else if (TableName === 'VisitMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'VisitRecordTypes') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'ResourceMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'ResourceRecordtype') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'Userdata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,UserObjectId TEXT)";
            } else if (TableName === 'ActionMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'ScheduleMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'PrepWasteMgmtMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'PrepWasteMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'InspectionItemMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'ScheduleItemMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'ErrorLog') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,  Errordata TEXT,userid TEXT, ErrorTime Date)";
            } else if (TableName === 'PushNotificationDetail') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC, pushnotificationdata TEXT,userid TEXT, SFId TEXT)";
            } else if (TableName === 'PrepWasteManagementRecordTypes') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'ActionRecordType') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'StoreSignature') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,VisitId TEXT)";
            } else if (TableName === 'OrgInfo') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT)";
            } else if (TableName === 'UserSignature') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,signature TEXT,userid TEXT)";
            } else if (TableName === 'Events') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'PersonalEvents') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'EventMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'EventLayout') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT,recordtypename TEXT)";
            } else if (TableName === 'Alerts') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT,alertid TEXT)";
            } else if (TableName === 'ContactMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'InspectionItemCompactLayout') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            }else if (TableName === 'InspectionCompactLayout') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            }else if (TableName === 'PrepWasteCompactLayout') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'AllVisitsData') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'TaskData') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'ContractData') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,recordid TEXT)";
            } else if (TableName === 'PriceEntries') {
                //(id,jsondata,updated,userid,pricebookid,priceentryid)
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT, userid TEXT,pricebookid TEXT,priceentryid TEXT)";
            } else if (TableName === 'Billing') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,visitid TEXT, billingid TEXT)";
            } else if (TableName === 'BillingMetadata') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            } else if (TableName === 'DefaultValues') {
                Query = "CREATE TABLE IF NOT EXISTS " +
                    TableName +
                    " (id INTEGER PRIMARY KEY ASC,jsondata TEXT,userid TEXT,objectid TEXT)";
            }

            if (Query) {
                tx.executeSql(Query, [], function (a, b) {
                    console.log(TableName + ' Table Created');
                }, function (error) {
                    console.log(error);
                });
            }
        }
    });
}

// End : app.createtable

//Insert Record
app.insertRecord = function (TableName, data, callback) {
    app.db.transaction(function (tx) {
        if (TableName === 'Credential') {
            tx.executeSql("INSERT INTO " + TableName + "(accesstoken,instanceurl,orgtype,refreshtoken,userid) VALUES (?,?,?,?,?)",
                [data.AccessToken, data.InstanceUrl, data.OrgType, data.RefreshToken, data.UserID],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'DataToUpdate') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,objectname,updated,updateorinsert,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?,?,?,?)',
                [data.JsonData, data.ObjectName, data.Updated, data.UpdateOrInsert, data.UserId, data.RecordId],
                callback,
                app.onError);
        }
        if (TableName === 'Schedule') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,scheduleid) VALUES ((select id from ' +
                TableName +
                ' where scheduleid = "' + data.ScheduleID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.ScheduleID],
                callback,
                app.onError);
        }
        if (TableName === 'ImageData') {
            tx.executeSql("INSERT INTO " + TableName + "(imagedata,updated,userid,typeofdata) VALUES (?,?,?,?)",
                [data.ImageData, data.Updated, data.UserId, data.TypeOfData],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'Inspection') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,visitid,inspectionid) VALUES ((select id from ' +
                TableName +
                ' where inspectionid = "' + data.InspectionID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.VisitID, data.InspectionID],
                callback,
                app.onError);
        }
        if (TableName === 'InspectionItem') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,accountid,inspectionitemid) VALUES ((select id from ' +
                TableName +
                ' where inspectionitemid = "' + data.InspectionItemID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AccountID, data.InspectionItemID],
                callback,
                app.onError);
        }
        if (TableName === 'InspectionItemParameter') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,inspectionitemid,inspectionitemparameterid) VALUES ((select id from ' +
                TableName +
                ' where inspectionitemparameterid = "' + data.InspectionItemParameterID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.InspectionItemId, data.InspectionItemParameterID],
                callback,
                app.onError);
        }
        if (TableName === 'Visits') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,visitid) VALUES ((select id from ' +
                TableName +
                ' where visitid = "' + data.VisitID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.VisitID],
                callback,
                app.onError);
        }
        if (TableName === 'OthersVisits') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,visitid) VALUES ((select id from ' +
                TableName +
                ' where visitid = "' + data.VisitID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.VisitID],
                callback,
                app.onError);
        }
        if (TableName === 'Account') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,accountid) VALUES ((select id from ' +
                TableName +
                ' where accountid = "' + data.AccountID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AccountID],
                callback,
                app.onError);
        }
        if (TableName === 'Action') {
            //id INTEGER PRIMARY KEY ASC,jsondata TEXT,updated TEXT,userid TEXT,accountid TEXT,actionid TEXT
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,accountid,actionid) VALUES ((select id from ' +
                TableName +
                ' where actionid = "' + data.ActionID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AccountID, data.ActionID],
                callback,
                app.onError);
        }
        if (TableName === 'Signature') {
            tx.executeSql("INSERT INTO " + TableName + "(imagedata,updated,userid,visitnumber) VALUES (?,?,?,?)",
                [data.ImageData, data.Updated, data.UserId, data.VisitNumber],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'Prep_Waste') {
            tx.executeSql('INSERT OR REPLACE INTO ' + TableName + '(id,jsondata,updated,userid,Prep_WasteId) VALUES ((select id from ' +
                TableName +
                ' where Prep_WasteId = "' + data.Prep_WasteID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.Prep_WasteID],
                callback,
                app.onError);
        }
        try {
            if (TableName === 'Vehicle') {
                tx.executeSql('INSERT OR REPLACE INTO ' + TableName + '(id,jsondata,updated,userid,vehicleId) VALUES ((select id from ' +
                    TableName +
                    ' where vehicleId = "' + data.vehicleId + '"),?,?,?,?)',
                     [data.JsonData, data.Updated, data.UserId, data.vehicleId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.log(err);
        }
        if (TableName === 'Analysis') {
            tx.executeSql('INSERT OR REPLACE INTO ' + TableName + '(id,jsondata,updated,userid,analysisid) VALUES ((select id from ' +
                TableName +
                ' where analysisid = "' + data.AnalysisID + '"),?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AnalysisID],
                callback,
                app.onError);
        }
        if (TableName === 'Contact') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,accountid,contactid) VALUES ((select id from ' +
                TableName +
                ' where contactid = "' + data.ContactID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AccountID, data.ContactID],
                callback,
                app.onError);
        }
        if (TableName === 'Alerts') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,accountid,alertid) VALUES ((select id from ' +
                TableName +
                ' where alertid = "' + data.AlertID + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.AccountID, data.AlertID],
                callback,
                app.onError);
        }
        if (TableName === 'InspectionRecordType') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'vehicleRecordType') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                 [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'InspectionItemRecordType') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'AnalysisRecordType') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'Resource') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,resourceid) VALUES ((select id from ' +
                TableName +
                ' where resourceid = "' + data.ResourceId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ResourceId],
                callback,
                app.onError);
        }
        if (TableName === 'InspectionMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'vehicleMetaData') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)', 
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'ContactMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'AnalysisMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'Prep_WasteManagement') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,Prep_WasteMgmtId) VALUES ((select id from ' +
                TableName +
                ' where Prep_WasteMgmtId = "' + data.Prep_WasteMgmtId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.Prep_WasteMgmtId],
                callback,
                app.onError);
        }
        if (TableName === 'VisitMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'VisitRecordTypes') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'PrepWasteManagementRecordTypes') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'ResourceMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'ResourceRecordtype') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'Userdata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,UserObjectId) VALUES ((select id from ' +
                TableName +
                ' where UserObjectId = "' + data.UserObjectId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.UserObjectId],
                callback,
                app.onError);
        }
        if (TableName === 'ActionMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'ScheduleMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'PrepWasteMgmtMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'PrepWasteMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'InspectionItemMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'ScheduleItemMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'ErrorLog') {
            tx.executeSql('INSERT INTO ' +
                TableName +
                '(Errordata,userid,ErrorTime) VALUES (?,?,?)',
                [data.Errordata, data.UserId, data.date],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'PushNotificationDetail') {
            tx.executeSql('INSERT INTO ' +
                TableName +
                '(pushnotificationdata,userid,SFId) VALUES (?,?,?)',
                [data.PushData, data.UserId, data.SFId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'ActionRecordType') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                TableName +
                ' where recordid = "' + data.RecordId + '"),?,?,?)',
                [data.JsonData, data.UserId, data.RecordId],
                app.onSuccess,
                app.onError);
        }
        if (TableName === 'OrgInfo') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid) VALUES ((select id from ' +
                TableName +
                ' where userid = "' + data.UserId + '"),?,?)',
                [data.JsonData, data.UserId],
                app.onSuccess,
                app.onError);
        }
        try {
            if (TableName === 'StoreSignature') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,VisitId) VALUES ((select id from ' +
                    TableName +
                    ' where userid = "' + data.UserId + '" AND VisitId="' + data.VisitId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.VisitId],
                    function () {
                    },
                    function (tx, err) {
                        console.error('Error' + err.Message);
                    });
            }
        } catch (err) {
            console.error(err);
        }

        try {
            if (TableName === 'UserSignature') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,signature,userid) VALUES ((select id from ' +
                    TableName +
                    ' where userid = "' + data.UserId + '"),?,?)',
                    [data.SignatureImage, data.UserId],
                    function () {
                    },
                    function () {
                        console.error('Error');
                    });
            }
        } catch (err) {
            console.error(err);
        }

        try {
            if (TableName === 'Events') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.log(err);
        }

        try {
            if (TableName === 'PersonalEvents') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.error('Personal Event: ', err);
        }

        try {
            if (TableName === 'EventMetadata') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                    TableName +
                    ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.ObjectName],
                    callback,
                    app.onError);
            }
        } catch (err) {
        }

        try {
            if (TableName === 'InspectionItemCompactLayout') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                    TableName +
                    ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.ObjectName],
                    callback,
                    app.onError);
            }
        } catch (err) {
        }
        try {
            if (TableName === 'InspectionCompactLayout') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                    TableName +
                    ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.ObjectName],
                    callback,
                    app.onError);
            }
        } catch (err) {
        }
        try {
            if (TableName === 'PrepWasteCompactLayout') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                    TableName +
                    ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.ObjectName],
                    callback,
                    app.onError);
            }
        } catch (err) {
        }
        try {
            if (TableName === 'SkillRequirement') {
                tx.executeSql('INSERT OR REPLACE INTO ' + TableName + '(id,jsondata,updated,userid,SkillId) VALUES ((select id from ' +
                    TableName +
                    ' where SkillId = "' + data.SkillId + '"),?,?,?,?)', [data.JsonData, data.Updated, data.UserId, data.SkillId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.log(err);
        }

        try {
            if (TableName === 'EventLayout') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid,recordtypename) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId, data.RecordTypeName],
                    app.onSuccess,
                    app.onError);
            }
        } catch (err) {
        }

        try {
            if (TableName === 'TaskData') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.error('Task Data: ', err);
        }

        try {
            if (TableName === 'ContractData') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.error('COntract Data: ', err);
        }

        try {
            if (TableName === 'AllVisitsData') {
                tx.executeSql('INSERT OR REPLACE INTO ' +
                    TableName +
                    '(id,jsondata,userid,recordid) VALUES ((select id from ' +
                    TableName +
                    ' where recordid = "' + data.RecordId + '"),?,?,?)',
                    [data.JsonData, data.UserId, data.RecordId],
                    callback,
                    app.onError);
            }
        } catch (err) {
            console.error('All Visit Data: ', err);
        }

        if (TableName === 'PriceEntries') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,pricebookid,priceentryid) VALUES ((select id from ' +
                TableName +
                ' where priceentryid = "' + data.PriceEntryId + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.PriceBookId, data.PriceEntryId],
                callback,
                app.onError);
        }

        if (TableName === 'Billing') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,updated,userid,visitid,billingid) VALUES ((select id from ' +
                TableName +
                ' where billingid = "' + data.BillingId + '"),?,?,?,?,?)',
                [data.JsonData, data.Updated, data.UserId, data.VisitId, data.BillingId],
                callback,
                app.onError);
        }

        if (TableName === 'BillingMetadata') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
        if (TableName === 'DefaultValues') {
            tx.executeSql('INSERT OR REPLACE INTO ' +
                TableName +
                '(id,jsondata,userid,objectid) VALUES ((select id from ' +
                TableName +
                ' where objectid = "' + data.ObjectName + '"),?,?,?)',
                [data.JsonData, data.UserId, data.ObjectName],
                callback,
                app.onError);
        }
    });
}
//END : InsertRecord

// Update Single record=
app.updateRecord = function (TableName, id, newData) {
    app.db.transaction(function (tx) {
        tx.executeSql("UPDATE " + TableName + " SET column1 = ?, column2 = ? WHERE id = ?", [newData, newData, id],
            app.onSuccess,
            app.onError);
    });
}

// Delete Single records
app.deleteRecord = function (TableName, id) {
    app.db.transaction(function (tx) {
        if (TableName == 'ImageData') {
            tx.executeSql("DELETE FROM ImageData WHERE id = ?", [id],
                app.onSuccess,
                app.onError);
            console.log("in the delete record");
        }
        if (TableName === 'DataToUpdate') {
            tx.executeSql("DELETE FROM DataToUpdate WHERE recordid = ?", [id],
                function (r, s) {
                    console.log('deleted the record');
                }, function (err) {
                    console.error('error :' + err);
                });
            console.log("in the delete record");
        }
    });
}

// Retrieve all data of table
app.selectAllRecords = function (TableName, fn, fn2) {
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM " + TableName + " ORDER BY id", [],
            fn,
            fn2);
    });
}

// Retrieve data for specific column value & Table
app.selectFromTable = function (TableName, ColumnName, ColumnValue, fn) {
    app.db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM " + TableName + " WHERE " + ColumnName + "=?", [ColumnValue],
            fn,
            app.onError);
    });
}

app.onSuccess = function (tx, r) {
}

app.onError = function (tx, e) {
    /* var Error = {
    Errordata:e,
    UserId:creds.UserId
    }
    app.insertRecord('ErrorLog', Error);*/
    console.error("SQLite Error: " + e.message);
}

// Delete Table data and schema
app.dropTable = function (TableName, fn) {
    app.db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS ' + TableName, [], fn,
            function (tx, res) {
                /* var Error = {
                Errordata:res,
                UserId:creds.UserId
                }*/
                // app.insertRecord('ErrorLog', Error);
                console.error('error: ' + res.message);
            });
    });
}

// Delete all data from table except schema
app.deleteAllData = function (TableName, fn) {
    app.db.transaction(function (tx) {
        tx.executeSql('delete from ' + TableName, [], fn,
            function (tx, res) {
                console.error('error: ' + res.message);
            });
    });
}