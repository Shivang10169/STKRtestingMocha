var LAYOUTDATA = '';

// For Detail Page
function VisitLayoutGenerator(Layoutdata) {
    // VisitReasonFOrNoSignature =[];
    LAYOUTDATA = Layoutdata;
    var VisitDetailPageHTML = '';
    var CountReadOnlyFields = 0;

    VisitDetailPageHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:4%;background-color:#fff; border-radius: 10px;margin-top:3px;">';
    VisitDetailPageHTML += '<center><h5>Additional Information</h5></center>';
    for (var i = 1; i < Layoutdata['detailLayoutSections'].length; i++) {
        var layoutRows = Layoutdata['detailLayoutSections'][i]['layoutRows'];
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var k = 0; k < layoutItems.length; k++) {
                var layoutComponent = layoutItems[k]['layoutComponents']
                for (var l = 0; l < layoutComponent.length; l++) {
                    try {
                        var NotImage = false;
                        if ((layoutComponent[l]['details']['calculatedFormula'])) {
                            if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('IMAGE') === -1)) {
                                NotImage = true;
                                if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('HYPERLINK') > -1) && layoutComponent[l]['details']['type'] === 'string') {
                                    console.log('findfind2', layoutComponent[l]);
                                    /*     if($.parseHTML(newDetailValue[0].STKR__FormulaURL__c)[0].nodeName == "A" ){

                                         } else{} */

                                    var stringtest = layoutComponent[l]['details']['calculatedFormula'];
                                    var stringtest1 = stringtest.split('"')[1]
                                    VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML += '<a style="color:#505050;" name1="RemoveThis"  name="VisitLayoutName" class="VisitDetailPageMDLName" id="' + layoutComponent[l]['details']['name'] + '" >' + stringtest1 + '</a>';

                                    VisitDetailPageHTML += '</div><br>';
                                }
                            }
                        } else {
                            NotImage = true;
                        }
                        if (!(layoutComponent[l]['details']['updateable']) && NotImage) {
                            try {
                                CountReadOnlyFields++;
                                var htmlid = layoutComponent[l]['details']['name'];
                                var label = layoutComponent[l]['details']['label'];
                                var dataType = layoutComponent[l]['details']['type'];
                                var precision = layoutComponent[l]['details']['precision'];
                                var scale = layoutComponent[l]['details']['scale'];
                                var max = Math.pow(10, (precision - scale)) - 1;
                                var step = Math.pow(10, -1 * scale);
                                if (dataType === 'string') {
                                    if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('HYPERLINK') > -1)) {

                                    } else {
                                        VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                        VisitDetailPageHTML += '<textarea type="text" style="color:#505050;" name1="RemoveThis"  name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                        VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                        VisitDetailPageHTML += '</div><br>';
                                    }

                                } else if (dataType === 'reference') {
                                    /*  VisitDetailPageHTML+='<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML+='<input name1="RemoveThis" type="text" name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" disabled>';
                                    VisitDetailPageHTML+='<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    VisitDetailPageHTML+='</div><br>';*/
                                } else if (dataType === 'double') {
                                    VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" type="number" name="VisitLayoutName" max="' + max + '" step="' + step + '" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" disabled>';
                                    VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else if (dataType === 'picklist') {
                                    VisitDetailPageHTML += '<label style="color:#505050;font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML += '<select style="color:#505050;" name1="RemoveThis" name="VisitLayoutName" id="' + htmlid + '" class="mdl-textfield__input" disabled>';
                                    // Check default value if any ...

                                    // New Code 
                                    VisitDetailPageHTML += '<option value="" selected>--None--</option>';

                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {
                                        if (layoutComponent['details']['picklistValues'][optionvalues]['defaultValue']) {
                                            VisitDetailPageHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        } else {
                                            VisitDetailPageHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        }
                                    }

                                    // END  
                                    VisitDetailPageHTML += '</select>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else if (dataType === 'date') {
                                    VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                                    VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" class="VisitDetailPageMDLName mdl-textfield__input" type="date" name="VisitLayoutName" id="' + htmlid + '" disabled>';
                                    VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else if (dataType === 'textarea') {
                                    if (htmlid === 'STKR__Internal_Notes__c') {

                                    } else {
                                        VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                        VisitDetailPageHTML += '<textarea style="color:#505050;" name1="RemoveThis" name="VisitLayoutName" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-textfield__input" type="text" rows="5" disabled></textarea>';
                                        VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                                        VisitDetailPageHTML += '</div><br>';
                                    }

                                } else if (dataType === 'datetime') {
                                    if (htmlid === 'STKR__Follow_Up__c') {
                                        VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                                        VisitDetailPageHTML += '<label style="color:#505050;font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                        VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" class="VisitDetailPageMDLName mdl-textfield__input" type="datetime-local" name="VisitLayoutName" onclick="edit_followup()" id="' + htmlid + '" disabled>';
                                        VisitDetailPageHTML += '</div><br>';
                                    } else {
                                        VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                                        VisitDetailPageHTML += '<label style="color:#505050;font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                        VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" class="VisitDetailPageMDLName mdl-textfield__input" type="datetime-local" name="VisitLayoutName" id="' + htmlid + '" disabled>';
                                        VisitDetailPageHTML += '</div><br>';
                                    }
                                } else if (dataType === 'email') {
                                    VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" type="email" name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" disabled>';
                                    VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else if (dataType === 'boolean') {
                                    if (device.platform === 'Android') {
                                        /*if (htmlid==='STKR__Fixed_Visit__c') {
                                        VisitDetailPageHTML+='<label class="VisitDetailPageMDLName mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">';
                                        VisitDetailPageHTML+='<input onclick="CheckforFixedVisit(this.id);"  name="VisitLayoutName" type="checkbox" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-checkbox__input">';
                                        VisitDetailPageHTML+='<span class="VisitDetailPageMDLName mdl-checkbox__label">' + label + '</span>';
                                        VisitDetailPageHTML+='</label><br>';
                                        }else{*/
                                        VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">';
                                        VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-checkbox__input" disabled>';
                                        VisitDetailPageHTML += '<span class="VisitDetailPageMDLName mdl-checkbox__label">' + label + '</span>';
                                        VisitDetailPageHTML += '</label><br>';
                                        // } 
                                    } else if (device.platform === 'iOS') {
                                        /*if (htmlid==='STKR__Fixed_Visit__c') {
                                        VisitDetailPageHTML+='<label  for="' + htmlid + '">';
                                        VisitDetailPageHTML+='<input onclick="CheckforFixedVisit(this.id);" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" >';
                                        VisitDetailPageHTML+='<span>' + label + '</span>';
                                        VisitDetailPageHTML+='</label><br>';
                                        }else{ */
                                        VisitDetailPageHTML += '<label  style="color:#505050;" for="' + htmlid + '">';
                                        VisitDetailPageHTML += '<input style="color:#505050;" name1="RemoveThis" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" disabled>';
                                        VisitDetailPageHTML += '<span>' + label + '</span>';
                                        VisitDetailPageHTML += '</label><br>';
                                        // }
                                    }
                                } else if (dataType === 'multipicklist') {
                                    VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';

                                    VisitDetailPageHTML += '<label style="color:#505050;font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                    VisitDetailPageHTML += '<select style="color:#505050;" name1="RemoveThis" class="mdl-textfield__input" name="VisitLayoutName" id="' + htmlid + '" multiple disabled>';
                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {
                                        VisitDetailPageHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                    }
                                    VisitDetailPageHTML += '</select>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else if (dataType === 'currency') {
                                    VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    VisitDetailPageHTML += '<textarea type="text" style="color:#505050;" name1="RemoveThis"  name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                    VisitDetailPageHTML += '<label style="color:#505050;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                                    VisitDetailPageHTML += '</div><br>';
                                } else {
                                    console.log('In else', dataType);
                                }
                            } catch (e) {
                                consle.log(e);
                            }
                        }
                    } catch (e) {
                        //console.log('VisitDetailpageGenerateLayout', e)
                    }
                }
            }
        }
    }
    VisitDetailPageHTML += '</div>';
    if (CountReadOnlyFields === 0) {
        VisitDetailPageHTML = '';
    }
    //x=1 to exclude information section; and loop to InspectionPageDetailData['editLayoutSections'].length-1 to exclude system information
    for (var x = 2; x < Layoutdata['editLayoutSections'].length - 1; x++) {
        var layoutRows = Layoutdata['editLayoutSections'][x]['layoutRows'];
        var layoutHeader = Layoutdata['editLayoutSections'][x]['heading'];

        VisitDetailPageHTML += '<div class="mdl-shadow--2dp" style="margin:2%;margin-top:3%;padding:4%;background-color:#fff; border-radius: 10px;">';
        VisitDetailPageHTML += '<center><h5>' + layoutHeader + '</h5></center>';
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var y = 0; y < layoutItems.length; y++) {
                if (layoutItems[y]['editableForUpdate']) {
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    try {
                        var label = layoutComponents['details']['label'];
                        var htmlid = layoutComponents['details']['name'];
                        var dataType = layoutComponents['details']['type'];
                        var nillable = layoutComponents['details']['nillable'];
                        var maxlength = layoutComponents['details']['length'];
                        var precision = layoutComponents['details']['precision'];
                        var scale = layoutComponents['details']['scale'];
                        var max = Math.pow(10, (precision - scale)) - 1;
                        var step = Math.pow(10, -1 * scale);
                        var htmlrequired = nillable ? '' : ' km-required';
                        if (dataType === 'string') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<input onBlur="updateVisit();" type="text" name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '">';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'reference') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<input type="text" name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '">';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'double') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<input onBlur="updateVisit();" type="number" name="VisitLayoutName" max="' + max + '" step="' + step + '" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '">';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'picklist') {
                            VisitDetailPageHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<select onBlur="updateVisit();" name="VisitLayoutName" id="' + htmlid + '" class="mdl-textfield__input">';
                            // New Code 
                            VisitDetailPageHTML += '<option value="" selected>--None--</option>';

                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                    VisitDetailPageHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                } else {
                                    VisitDetailPageHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                }
                            }

                            // if (htmlid === 'STKR__Reason_for_no_signature__c') {
                            //     for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                            //         if (layoutComponents['details']['picklistValues'][optionvalues]['value']) {
                            //             VisitReasonFOrNoSignature.push(layoutComponents['details']['picklistValues'][optionvalues]['value']) ;
                            //         }
                            //     }

                            // }

                            // END


                            VisitDetailPageHTML += '</select>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'date') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                            VisitDetailPageHTML += '<input onBlur="updateVisit();" class="VisitDetailPageMDLName mdl-textfield__input" type="date" name="VisitLayoutName" id="' + htmlid + '"/>';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'textarea') {

                            if (htmlid === 'STKR__Internal_Notes__c') {
                                console.log('hiiiiin internalnotes');
                            } else if (htmlid === 'STKR__Notes_Long__c') {

                            } else {
                                VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                VisitDetailPageHTML += '<textarea onBlur="updateVisit();" name="VisitLayoutName" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-textfield__input" type="text" rows="5" maxlength="' + maxlength + '"></textarea>';
                                VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                                VisitDetailPageHTML += '</div><br>';

                            }



                        } else if (dataType === 'datetime') {
                            if (htmlid === 'STKR__Follow_Up__c') {
                                VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                                VisitDetailPageHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                VisitDetailPageHTML += '<input onBlur="updateVisit();" class="VisitDetailPageMDLName mdl-textfield__input" type="datetime-local" name="VisitLayoutName"  id="' + htmlid + '">';
                                VisitDetailPageHTML += '</div><br>';
                            } else {
                                VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield">';
                                VisitDetailPageHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                VisitDetailPageHTML += '<input onBlur="updateVisit();" class="VisitDetailPageMDLName mdl-textfield__input" type="datetime-local" name="VisitLayoutName" id="' + htmlid + '"/>';
                                VisitDetailPageHTML += '</div><br>';
                            }
                        } else if (dataType === 'email') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<input onBlur="updateVisit();" type="email" name="VisitLayoutName" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '">';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'boolean') {
                            if (device.platform === 'Android') {
                                /*if (htmlid==='STKR__Fixed_Visit__c') {
                                VisitDetailPageHTML+='<label class="VisitDetailPageMDLName mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">';
                                VisitDetailPageHTML+='<input onclick="CheckforFixedVisit(this.id);"  name="VisitLayoutName" type="checkbox" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-checkbox__input">';
                                VisitDetailPageHTML+='<span class="VisitDetailPageMDLName mdl-checkbox__label">' + label + '</span>';
                                VisitDetailPageHTML+='</label><br>';
                                }else{*/
                                VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">';
                                VisitDetailPageHTML += '<input onBlur="updateVisit();" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" class="VisitDetailPageMDLName mdl-checkbox__input">';
                                VisitDetailPageHTML += '<span class="VisitDetailPageMDLName mdl-checkbox__label" style="vertical-align: super;">' + label + '</span>';
                                VisitDetailPageHTML += '</label><br>';
                                // } 
                            } else if (device.platform === 'iOS') {
                                /*if (htmlid==='STKR__Fixed_Visit__c') {
                                VisitDetailPageHTML+='<label  for="' + htmlid + '">';
                                VisitDetailPageHTML+='<input onclick="CheckforFixedVisit(this.id);" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" >';
                                VisitDetailPageHTML+='<span>' + label + '</span>';
                                VisitDetailPageHTML+='</label><br>';
                                }else{ */
                                VisitDetailPageHTML += '<label  for="' + htmlid + '">';
                                VisitDetailPageHTML += '<input onclick="updateVisit();" name="VisitLayoutName" type="checkbox" id="' + htmlid + '" style="width:25px;height:25px;">';
                                VisitDetailPageHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                VisitDetailPageHTML += '</label><br>';
                                // }
                            }
                        } else if (dataType === 'multipicklist') {
                            VisitDetailPageHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';

                            VisitDetailPageHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            VisitDetailPageHTML += '<select onBlur="updateVisit();" class="mdl-textfield__input" name="VisitLayoutName" id="' + htmlid + '" multiple>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                VisitDetailPageHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                            }
                            VisitDetailPageHTML += '</select>';
                            VisitDetailPageHTML += '</div><br>';
                        } else if (dataType === 'currency') {
                            console.log('currency type found');
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<input onBlur="updateVisit();" type="number" name="VisitLayoutName" max="' + max + '" step="' + step + '" class="VisitDetailPageMDLName mdl-textfield__input" id="' + htmlid + '">';
                            VisitDetailPageHTML += '<label class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                            VisitDetailPageHTML += '</div><br>';

                        } else if (dataType === 'url') {
                            VisitDetailPageHTML += '<div class="VisitDetailPageMDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            VisitDetailPageHTML += '<label style="color: rgb(0,188,212);font-size: 16px;text-decoration: underline;" class="VisitDetailPageMDLName mdl-textfield__label" for="' + htmlid + '"">URL</label></br>';
                            VisitDetailPageHTML += '<a style="color:#505050;"   name="VisitLayoutName" class="VisitDetailPageMDLName ST_Clickable_Link mdl-textfield__input" id="' + htmlid + '">' + label + '</a>';

                            VisitDetailPageHTML += '</div><br>';
                        } else {
                            console.log('In else', dataType);
                        }
                    } catch (e) {}
                } else {
                    //console.log('layoutitems1234', layoutItems[y])
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    console.log('layoutcomponentsabc', layoutComponents);

                    try {
                        if (layoutComponents) {
                            var spaceType = layoutComponents.type;
                            if (spaceType === 'EmptySpace') {
                                VisitDetailPageHTML += '<br>';
                            } else {
                                console.log('In else', dataType);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        VisitDetailPageHTML += '</div>';
    }
    /*
    SetValues();
    */
    return VisitDetailPageHTML;
}

// Detail Page
function ActionDetailLayoutGenerator(Layoutdata) {
    var ActionHTML = '';
    var CountReadOnlyFields = 0;
    ActionHTML += '<center><h5>Additional Information</h5></center>';
    ActionHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
    for (var i = 1; i < Layoutdata['detailLayoutSections'].length - 1; i++) {
        var layoutRows = Layoutdata['detailLayoutSections'][i]['layoutRows'];
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var k = 0; k < layoutItems.length; k++) {
                var layoutComponent = layoutItems[k]['layoutComponents']
                for (var l = 0; l < layoutComponent.length; l++) {
                    try {
                        var NotImage = false;
                        if ((layoutComponent[l]['details']['calculatedFormula'])) {
                            if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('IMAGE') === -1)) {
                                NotImage = true;
                                if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('HYPERLINK') > -1) && layoutComponent[l]['details']['type'] === 'string') {
                                    console.log('findfind2', layoutComponent[l]);
                                    /*     if($.parseHTML(newDetailValue[0].STKR__FormulaURL__c)[0].nodeName == "A" ){

                                         } else{} */

                                    var stringtest = layoutComponent[l]['details']['calculatedFormula'];
                                    var stringtest1 = stringtest.split('"')[1]
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<a style="color:#505050;" name1="RemoveThis"  name="ActionDetailLayoutName" class="ActionDetailPage2MDLName" id="' + layoutComponent[l]['details']['name'] + '" >' + stringtest1 + '</a>';

                                    ActionHTML += '</div><br>';
                                }
                            }
                        } else {
                            NotImage = true;
                        }
                        if (!(layoutComponent[l]['details']['updateable']) && NotImage) {
                            try {
                                var htmlid = layoutComponent[l]['details']['name'];
                                var label = layoutComponent[l]['details']['label'];
                                var dataType = layoutComponent[l]['details']['type'];
                                var precision = layoutComponent[l]['details']['precision'];
                                var scale = layoutComponent[l]['details']['scale'];
                                var max = Math.pow(10, (precision - scale)) - 1;
                                var step = Math.pow(10, -1 * scale);
                                CountReadOnlyFields++;
                                if (dataType === 'string') {
                                    if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('HYPERLINK') > -1)) {

                                    } else {
                                        ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                        ActionHTML += '<textarea name1="RemoveThis" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                        ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                        ActionHTML += '</div><br>';
                                    }

                                } else if (dataType === 'email') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<input name1="RemoveThis" type="email" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '" disabled>';
                                    ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'reference') {
                                    if (navigator.onLine) {
                                        if (htmlid === 'STKR__Assigned_To__c') {
                                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                            if (newhtmlrequired === 'required')
                                                ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                            else
                                                ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                            ActionHTML += '<select name1="RemoveThis" name="ActionDetailLayoutName" id="' + htmlid + '" class="ActionPageMDL mdl-textfield__input" disabled>';
                                            ActionHTML += '<option value="">--None--</option>';

                                            for (var optionvalues = 0; optionvalues < Userdata.length; optionvalues++) {
                                                var include = false;
                                                if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && Userdata[optionvalues]['IsPortalEnabled'] && Userdata[optionvalues]['Contact']) {

                                                    // 0 level
                                                    if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                        include = true;
                                                    }

                                                    // 1 level
                                                    if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                        Userdata[optionvalues]['Contact']['Account']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                        include = true;
                                                    }

                                                    //2 level
                                                    try {
                                                        if (Userdata[optionvalues]['Contact']['Account'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                            include = true;
                                                        }
                                                    } catch (error) { console.error(error); }

                                                    //3 level
                                                    try {
                                                        if (Userdata[optionvalues]['Contact']['Account'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                            include = true;
                                                        }
                                                    } catch (error) { console.error(error); }

                                                    //4 level
                                                    try {
                                                        if (Userdata[optionvalues]['Contact']['Account'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] &&
                                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                            include = true;
                                                        }
                                                    } catch (error) { console.error(error); }

                                                    if (newDetailValue[0]["STKR__ParentId__c"]) {
                                                        if (newDetailValue[0]["STKR__ParentId__c"].length == 15) {
                                                            try {
                                                                if (Userdata[optionvalues]['Contact']['AccountId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                                    include = true;
                                                                }
                                                                if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                                    include = true;
                                                                }
                                                            } catch (err) {}
                                                        } else {
                                                            if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                                include = true;
                                                            }
                                                            if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                                include = true;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && (include || Userdata[optionvalues]['UserType'] == 'Standard'))
                                                    ActionHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';
                                            }
                                            ActionHTML += '</select>';
                                            ActionHTML += '</div></br>';
                                        }
                                    }
                                } else if (dataType === 'double') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<input name1="RemoveThis" type="number" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '" disabled>';
                                    ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'picklist') {
                                    if (newhtmlrequired === 'required')
                                        ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    else
                                        ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<select name1="RemoveThis" name="ActionDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input" disabled>';
                                    ActionHTML += '<option value="">--None--</option>';
                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {

                                        if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                            ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        } else {
                                            ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        }
                                    }
                                    ActionHTML += '</select>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'date') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                    ActionHTML += '<input name1="RemoveThis" class="ActionDetailPage2MDLName mdl-textfield__input" type="date" name="ActionDetailLayoutName" id="' + htmlid + '" disabled>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'textarea') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<textarea name1="RemoveThis" name="ActionDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input" type="text" rows="5" disabled></textarea>';
                                    ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'datetime') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield">';
                                    ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                    ActionHTML += '<input name1="RemoveThis" class="mdl-textfield__input" type="datetime-local" name="ActionDetailLayoutName" id="' + htmlid + '" disabled>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'boolean') {
                                    if (device.platform === 'Android') {
                                        ActionHTML += '<input name1="RemoveThis" name="ActionDetailLayoutName" type="checkbox" id="' + htmlid + '" disabled>';
                                        ActionHTML += '<label for="' + htmlid + '">';
                                        ActionHTML += '<span>' + label + '</span>';
                                        ActionHTML += '</label><br>';
                                    } else if (device.platform === 'iOS') {
                                        ActionHTML += '<input name1="RemoveThis" name="ActionDetailLayoutName" type="checkbox" id="' + htmlid + '" disabled>';
                                        ActionHTML += '<label for="' + htmlid + '">';
                                        ActionHTML += '<span>' + label + '</span>';
                                        ActionHTML += '</label><br>';
                                    }
                                } else if (dataType === 'multipicklist') {
                                    if (newhtmlrequired === 'required')
                                        ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    else
                                        ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    ActionHTML += '<div class=" ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<select name1="RemoveThis" class="mdl-textfield__input" name="ActionDetailLayoutName" id="' + htmlid + '" multiple disabled>';
                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {
                                        ActionHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                    }
                                    ActionHTML += '</select>';
                                    ActionHTML += '</div><br>';
                                } else if (dataType === 'currency') {
                                    ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    ActionHTML += '<textarea name1="RemoveThis" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                    ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                                    ActionHTML += '</div><br>';
                                } else {
                                    console.log('In else', dataType);
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    } catch (e) {
                        console.log('ACtioncreate', e, Layoutdata)
                    }
                }
            }
        }
    }
    ActionHTML += '</div>';
    if (CountReadOnlyFields === 0) {
        ActionHTML = '';
    }
    //x=1 to exclude information section; and loop to InspectionPageDetailData['editLayoutSections'].length-1 to exclude system information
    for (var x = 0; x < Layoutdata['editLayoutSections'].length - 1; x++) {
        var layoutRows = Layoutdata['editLayoutSections'][x]['layoutRows'];
        var layoutHeader = Layoutdata['editLayoutSections'][x]['heading'];

        ActionHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
        ActionHTML += '<center><h5>' + layoutHeader + '</h5></center>';
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var y = 0; y < layoutItems.length; y++) {
                if (layoutItems[y]['editableForUpdate']) {
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    try {
                        var label = layoutComponents['details']['label'];
                        var htmlid = layoutComponents['details']['name'];
                        var dataType = layoutComponents['details']['type'];
                        var nillable = layoutComponents['details']['nillable'];
                        var precision = layoutComponents['details']['precision'];
                        var scale = layoutComponents['details']['scale'];
                        var max = Math.pow(10, (precision - scale)) - 1;
                        var step = Math.pow(10, -1 * scale);
                        var htmlrequired = nillable ? '' : 'required';
                        var maxlength = layoutComponents['details']['length'];
                        var newhtmlrequired = layoutItems[y]['required'] ? 'required' : '';
                        if (dataType === 'string') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="text" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'email') {
                            if (htmlid === 'STKR__Email_Action__c') {
                                ActionHTML += '<div style="display:flex;" class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                ActionHTML += '<input type="email" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                ActionHTML += '<a data-role="button" style="background:#3090C7;color:white;float: right;" onclick="openaccountcontactpage(\'' + htmlid + '\')"   class="km-widget km-button"><span class="km-text"><i class="fa fa-users"></i> </span></a>'
                                ActionHTML += '</div><br>';
                            } else {
                                ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                ActionHTML += '<input type="email" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                ActionHTML += '</div><br>';
                            }

                        } else if (dataType === 'reference') {
                            if (navigator.onLine) {
                                if (htmlid === 'STKR__Assigned_To__c') {
                                    ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    if (newhtmlrequired === 'required')
                                        ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    else
                                        ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    ActionHTML += '<select name="ActionDetailLayoutName" id="' + htmlid + '" class="ActionPageMDL UniqueSelect mdl-textfield__input"' + newhtmlrequired + '>';
                                    ActionHTML += '<option value="Responsible Person for Site">Responsible Person for Site</option>';
                                    for (var optionvalues = 0; optionvalues < Userdata.length; optionvalues++) {
                                        var include = false;
                                        if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && Userdata[optionvalues]['IsPortalEnabled'] && Userdata[optionvalues]['Contact']) {
                                            if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }

                                            // 0 level
                                            if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }

                                            // 1 level
                                            if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }

                                            //2 level
                                            try {
                                                if (Userdata[optionvalues]['Contact']['Account'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                    include = true;
                                                }
                                            } catch (error) { console.error(error); }

                                            //3 level
                                            try {
                                                if (Userdata[optionvalues]['Contact']['Account'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                    include = true;
                                                }
                                            } catch (error) { console.error(error); }

                                            //4 level
                                            try {
                                                if (Userdata[optionvalues]['Contact']['Account'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] &&
                                                    Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                    include = true;
                                                }
                                            } catch (error) { console.error(error); }



                                            if (newDetailValue[0]["STKR__ParentId__c"]) {
                                                if (newDetailValue[0]["STKR__ParentId__c"].length == 15) {
                                                    try {
                                                        if (Userdata[optionvalues]['Contact']['AccountId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                            include = true;
                                                        }
                                                        if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                            include = true;
                                                        }
                                                    } catch (err) {}
                                                } else {
                                                    if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                        include = true;
                                                    }
                                                    if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['ParentId'] && Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                        include = true;
                                                    }
                                                }
                                            }
                                        }

                                        if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && (include || Userdata[optionvalues]['UserType'] == 'Standard'))
                                            ActionHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';

                                        if (ShowRelatedContacts != undefined && ShowRelatedContacts.STKR__Enable__c) {
                                            for (var k = 0; k < ContactData.length; k++) {
                                                if (ContactData[k]['RelatedAccount'] === newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                    if (Userdata[optionvalues]['ContactId'] == ContactData[k]['Id'] && !Userdata[optionvalues]['STKR__Do_not_assign_actions__c']) {
                                                        if (!include) {
                                                            ActionHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';

                                                        }

                                                    }
                                                }
                                            }
                                        }
                                    }
                                    ActionHTML += '</select>';
                                    ActionHTML += '</div></br>';
                                }
                            }
                        } else if (dataType === 'double') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="number" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '"' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'picklist') {
                            if (newhtmlrequired === 'required')
                                ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            else
                                ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<select name="ActionDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input"' + newhtmlrequired + '>';
                            ActionHTML += '<option value="" selected>--None--</option>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                    ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                } else {
                                    ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                }
                            }
                            ActionHTML += '</select>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'date') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '<input class="ActionDetailPage2MDLName mdl-textfield__input" type="date" name="ActionDetailLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'textarea') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<textarea name="ActionDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input" type="text" rows="5" maxlength="' + maxlength + '" ' + newhtmlrequired + '></textarea>';
                            ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'datetime') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield">';
                            ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '<input class="mdl-textfield__input" type="datetime-local" name="ActionDetailLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'boolean') {
                            if (device.platform === 'Android') {
                                ActionHTML += '<input name="ActionDetailLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label for="' + htmlid + '">';
                                ActionHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                ActionHTML += '</label><br>';
                            } else if (device.platform === 'iOS') {
                                ActionHTML += '<input name="ActionDetailLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label for="' + htmlid + '">';
                                ActionHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                ActionHTML += '</label><br>';
                            }
                        } else if (dataType === 'multipicklist') {
                            if (newhtmlrequired === 'required')
                                ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            else
                                ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            ActionHTML += '<div class=" ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<select class="mdl-textfield__input" name="ActionDetailLayoutName" id="' + htmlid + '" multiple' + newhtmlrequired + '>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                            }
                            ActionHTML += '</select>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'currency') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="number" name="ActionDetailLayoutName" class="ActionDetailPage2MDLName mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionDetailPage2MDLName mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'url') {
                            ActionHTML += '<div class="ActionDetailPage2MDLName mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<a style="color:#505050;"   name="ActionDetailLayoutName" class="ActionDetailPage2MDLName ST_Clickable_Link mdl-textfield__input" id="' + htmlid + '">' + label + '</a>';

                            ActionHTML += '</div><br>';
                        } else {
                            console.log('In else', dataType);
                        }
                    } catch (e) {}
                } else {
                    // console.log('layoutitems1234', layoutItems[y])
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    console.log('layoutcomponentsabc', layoutComponents);

                    try {
                        if (layoutComponents) {
                            var spaceType = layoutComponents.type;
                            if (spaceType === 'EmptySpace') {
                                ActionHTML += '<br>';
                            } else {
                                console.log('In else', dataType);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        ActionHTML += '</div>';
    }
    return ActionHTML;
}

//Create Page
function ActionLayoutGenerator(Layoutdata) {
    var ActionHTML = '';
    //x=1 to exclude information section; and loop to InspectionPageDetailData['editLayoutSections'].length-1 to exclude system information
    for (var x = 0; x < Layoutdata['editLayoutSections'].length - 1; x++) {
        var layoutRows = Layoutdata['editLayoutSections'][x]['layoutRows'];
        var layoutHeader = Layoutdata['editLayoutSections'][x]['heading'];
        ActionHTML += '<center><h5>' + layoutHeader + '</h5></center>';
        ActionHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var y = 0; y < layoutItems.length; y++) {
                if (layoutItems[y]['editableForUpdate']) {
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    try {
                        var label = layoutComponents['details']['label'];
                        var htmlid = layoutComponents['details']['name'];
                        var dataType = layoutComponents['details']['type'];
                        var nillable = layoutComponents['details']['nillable'];
                        var precision = layoutComponents['details']['precision'];
                        var scale = layoutComponents['details']['scale'];
                        var max = Math.pow(10, (precision - scale)) - 1;
                        var step = Math.pow(10, -1 * scale);
                        var htmlrequired = nillable ? '' : 'required';
                        var maxlength = layoutComponents['details']['length'];
                        var newhtmlrequired = layoutItems[y]['required'] ? 'required' : '';
                        if (dataType === 'string') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="text" name="ActionLayoutName" class="ActionPageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'reference') {
                            //if (navigator.onLine) {
                            if (htmlid === 'STKR__Assigned_To__c') {
                                ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                if (newhtmlrequired === 'required')
                                    ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                else
                                    ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                ActionHTML += '<select name="ActionLayoutName" id="' + htmlid + '" class="ActionPageMDL UniqueSelect mdl-textfield__input"' + newhtmlrequired + '>';
                                ActionHTML += '<option value="Responsible Person for Site">Responsible Person for Site</option>';
                                for (var optionvalues = 0; optionvalues < Userdata.length; optionvalues++) {

                                    var include = false;
                                    if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && Userdata[optionvalues]['IsPortalEnabled'] && Userdata[optionvalues]['Contact']) {

                                        if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                            include = true;
                                        }

                                        // 0 level
                                        if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                            include = true;
                                        }

                                        // 1 level
                                        if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                            Userdata[optionvalues]['Contact']['Account']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                            include = true;
                                        }

                                        //2 level
                                        try {
                                            if (Userdata[optionvalues]['Contact']['Account'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }
                                        } catch (error) { console.error(error); }

                                        //3 level
                                        try {
                                            if (Userdata[optionvalues]['Contact']['Account'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['Id'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }
                                        } catch (error) { console.error(error); }

                                        //4 level
                                        try {
                                            if (Userdata[optionvalues]['Contact']['Account'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] &&
                                                Userdata[optionvalues]['Contact']['Account']['Parent']['Parent']['Parent']['ParentId'] == newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                include = true;
                                            }
                                        } catch (error) { console.error(error); }



                                        if (newDetailValue[0]["STKR__ParentId__c"]) {
                                            if (newDetailValue[0]["STKR__ParentId__c"].length == 15) {
                                                try {
                                                    if (Userdata[optionvalues]['Contact']['AccountId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                        include = true;
                                                    }
                                                    if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'].substring(0, 15) == newDetailValue[0]["STKR__ParentId__c"]) {
                                                        include = true;
                                                    }
                                                } catch (err) {}
                                            } else {
                                                if (Userdata[optionvalues]['Contact']['AccountId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                    include = true;
                                                }
                                                if (Userdata[optionvalues]['Contact']['Account'] && Userdata[optionvalues]['Contact']['Account']['ParentId'] == newDetailValue[0]["STKR__ParentId__c"]) {
                                                    include = true;
                                                }
                                            }
                                        }
                                    }

                                    if (!Userdata[optionvalues]['STKR__Do_not_assign_actions__c'] && (include || Userdata[optionvalues]['UserType'] == 'Standard'))
                                        ActionHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';

                                    if (ShowRelatedContacts != undefined && ShowRelatedContacts.STKR__Enable__c) {
                                        for (var k = 0; k < ContactData.length; k++) {
                                            if (ContactData[k]['RelatedAccount'] === newDetailValue[0]["STKR__Account_lkp__c"]) {
                                                if (Userdata[optionvalues]['ContactId'] == ContactData[k]['Id'] && !Userdata[optionvalues]['STKR__Do_not_assign_actions__c']) {
                                                    if (!include) {
                                                        ActionHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';

                                                    }

                                                }
                                            }
                                        }
                                    }

                                }
                                ActionHTML += '</select>';
                                ActionHTML += '</div></br>';
                            }
                            //} 
                        } else if (dataType === 'double') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="number" name="ActionLayoutName" class="ActionPageMDL mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '"' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'picklist') {
                            if (newhtmlrequired === 'required')
                                ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            else
                                ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<select name="ActionLayoutName" id="' + htmlid + '" class="ActionPageMDL mdl-textfield__input"' + newhtmlrequired + '>';
                            // Start 
                            ActionHTML += '<option value="">--None--</option>';

                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                    ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '" selected>' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';

                                } else {
                                    ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                }
                            }
                            // End

                            ActionHTML += '</select>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'date') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield">';
                            ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '<input class="ActionPageMDL mdl-textfield__input" type="date" name="ActionLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'textarea') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<textarea name="ActionLayoutName" id="' + htmlid + '"  class="mdl-textfield__input"  type="text" rows="5" maxlength="' + maxlength + '" ' + newhtmlrequired + '></textarea>';
                            ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'datetime') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield">';
                            ActionHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            ActionHTML += '<input class="mdl-textfield__input" type="date" name="ActionLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            ActionHTML += '</div> <br>';
                        } else if (dataType === 'boolean') {
                            if (device.platform === 'Android') {
                                ActionHTML += '<input name="ActionLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label for="' + htmlid + '">';
                                ActionHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                ActionHTML += '</label><br>';
                            } else if (device.platform === 'iOS') {
                                ActionHTML += '<input name="ActionLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label for="' + htmlid + '">';
                                ActionHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                ActionHTML += '</label><br>';
                            }
                        } else if (dataType === 'email') {
                            if (htmlid === 'STKR__Email_Action__c') {
                                ActionHTML += '<div style="display:flex;" class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                ActionHTML += '<input type="email" name="ActionLayoutName" class="ActionPageMDL mdl-textfield__input" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                ActionHTML += '<a data-role="button" style="background:#3090C7;color:white;float: right;" onclick="openaccountcontactFromCreatepage(\'' + htmlid + '\')"   class="km-widget km-button"><span class="km-text"><i class="fa fa-users"></i> </span></a>'
                                ActionHTML += '</div><br>';
                            } else {
                                ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                ActionHTML += '<input type="email" name="ActionLayoutName" class="ActionPageMDL mdl-textfield__input" id="' + htmlid + '"' + newhtmlrequired + '>';
                                ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                ActionHTML += '</div><br>';
                            }

                        } else if (dataType === 'multipicklist') {
                            if (newhtmlrequired === 'required')
                                ActionHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            else
                                ActionHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<select class="ActionPageMDL mdl-textfield__input" name="ActionLayoutName" id="' + htmlid + '" multiple' + newhtmlrequired + '>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                ActionHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                            }
                            ActionHTML += '</select>';
                            ActionHTML += '</div><br>';
                        } else if (dataType === 'currency') {
                            ActionHTML += '<div class="ActionPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            ActionHTML += '<input type="number" name="ActionLayoutName" class="ActionPageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            ActionHTML += '<label class="ActionPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                            ActionHTML += '</div><br>';
                        } else {
                            console.log('In else', dataType);
                        }
                    } catch (e) {}
                } else {
                    // console.log('layoutitems1234', layoutItems[y])
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    console.log('layoutcomponentsabc', layoutComponents);

                    try {
                        if (layoutComponents) {
                            var spaceType = layoutComponents.type;
                            if (spaceType === 'EmptySpace') {
                                ActionHTML += '<br>';
                            } else {
                                console.log('In else', dataType);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        ActionHTML += '</div>';
    }
    console.log('hola', ActionHTML);
    return ActionHTML;
}

// Create Page
function PrepWasteLayoutGenerator(Layoutdata) {
    var PrepWasteHTML = '';
    InitialPrepWasteId = '';
    try {
        InitialPrepWasteId = Prep_WasteData[0]['STKR__Volume__c'];
    } catch (e) {
        console.log(e);
    }
    for (var x = 0; x < Layoutdata['editLayoutSections'].length; x++) {
        var layoutRows = Layoutdata['editLayoutSections'][x]['layoutRows'];
        var layoutHeader = Layoutdata['editLayoutSections'][x]['heading'];
        PrepWasteHTML += '<center><h5>' + layoutHeader + '</h5></center>';
        PrepWasteHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var y = 0; y < layoutItems.length; y++) {
                if (layoutItems[y]['editableForUpdate']) {
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    try {
                        var label = layoutComponents['details']['label'];
                        var htmlid = layoutComponents['details']['name'];
                        var dataType = layoutComponents['details']['type'];
                        var nillable = layoutComponents['details']['nillable'];
                        var precision = layoutComponents['details']['precision'];
                        var scale = layoutComponents['details']['scale'];
                        var max = Math.pow(10, (precision - scale)) - 1;
                        var step = Math.pow(10, -1 * scale);
                        var htmlrequired = nillable ? '' : 'required';
                        var maxlength = layoutComponents['details']['length'];
                        var newhtmlrequired = layoutItems[y]['required'] ? 'required' : '';
                        if (dataType === 'string') {
                            PrepWasteHTML += '<div class="PrepWastePageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="text" name="PrepWasteLayoutName" class="PrepWastePageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '"' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWastePageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'reference') {
                            if (htmlid === 'STKR__Prep_Waste__c') {
                                PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                if (newhtmlrequired === 'required')
                                    PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                else
                                    PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                PrepWasteHTML += '<select name="PrepWasteLayoutName" onChange="UpdateVolume_Create(this.value);" id="' + htmlid + '" class="mdl-textfield__input"' + newhtmlrequired + '>';
                                for (var optionvalues = 0; optionvalues < Prep_WasteData.length; optionvalues++) {
                                    // PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    if (FromWhichPage == "Visit" && Prep_WasteData[optionvalues].STKR__Exclude_from_Visit_Prep__c == false) {
                                        PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    } else if (FromWhichPage == "Action" ) {
                                        PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    } else if(FromWhichPage =="Inspection" ) {
                                        if(Prep_WasteData[optionvalues].STKR__Available_Inspection_Item_Types__c == null){
                                            PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                        }else{
                                            var temp = Prep_WasteData[optionvalues].STKR__Available_Inspection_Item_Types__c.split(';')
                                            for (p = 0; p < temp.length; p++) {
                                                if (temp[p] == InspectionItemDetail.STKR__Item_Type__c) {
                                                    PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                                }
                                            }
                                        }
                                    }
                                }
                                PrepWasteHTML += '</select>';
                                PrepWasteHTML += '<input type="text" id="STKR__Volume__c_Create" class="PrepWastePageMDL mdl-textfield__input" value="' + InitialPrepWasteId + '" readonly style="position:absolute;margin-top:-10%;border:none;text-align:end;right:0;width:40%;">';
                                PrepWasteHTML += '</div><br>';
                            }
                        } else if (dataType === 'double') {
                            PrepWasteHTML += '<div class="PrepWastePageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="number" name="PrepWasteLayoutName" class="PrepWastePageMDL mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '"' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWastePageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'picklist') {
                            if (newhtmlrequired === 'required')
                                PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            else
                                PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<select name="PrepWasteLayoutName" id="' + htmlid + '" class="mdl-textfield__input"' + newhtmlrequired + '>';
                            // Start 
                           
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                    PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '" selected>' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';

                                } else {
                                    PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                }
                            }
                            // End
                            PrepWasteHTML += '</select>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'date') {
                            PrepWasteHTML += '<div class="PrepWastePageMDL mdl-textfield mdl-js-textfield">';
                            PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<input class="PrepWastePageMDL mdl-textfield__input" type="date" name="PrepWasteLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'textarea') {
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<textarea name="PrepWasteLayoutName" id="' + htmlid + '" class="PrepWastePageMDL mdl-textfield__input" type="text" rows="5" maxlength="' + maxlength + '"></textarea>';
                            PrepWasteHTML += '<label class="PrepWastePageMDL mdl-textfield__label" for="' + htmlid + '"' + newhtmlrequired + '>' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'datetime') {
                            PrepWasteHTML += '<div class="PrepWastePageMDL mdl-textfield mdl-js-textfield">';
                            PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<input class="PrepWastePageMDL mdl-textfield__input" type="date" name="PrepWasteLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'boolean') {
                            if (device.platform === 'Android') {
                                PrepWasteHTML += '<label class="PrepWastePageMDL mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">'
                                PrepWasteHTML += '<input name="PrepWasteLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '" class="PrepWastePageMDL mdl-checkbox__input"' + newhtmlrequired + '>'
                                PrepWasteHTML += '<span class="PrepWastePageMDL mdl-checkbox__label" style="vertical-align: super;">' + label + '</span>';
                                PrepWasteHTML += '</label><br>';
                            } else if (device.platform === 'iOS') {
                                PrepWasteHTML += '<input name="PrepWasteLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                PrepWasteHTML += '<label for="' + htmlid + '">';
                                PrepWasteHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                PrepWasteHTML += '</label><br>';
                            }
                        } else if (dataType === 'multipicklist') {
                            if (newhtmlrequired === 'required')
                                PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            else
                                PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<select class="mdl-textfield__input" name="PrepWasteLayoutName" id="' + htmlid + '" multiple' + newhtmlrequired + '>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                            }
                            PrepWasteHTML += '</select>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'currency') {
                            PrepWasteHTML += '<div class="PrepWastePageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="number" name="PrepWasteLayoutName" class="PrepWastePageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '"' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWastePageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else {
                            console.log('In else', dataType);
                        }
                    } catch (e) {}
                } else {
                    // console.log('layoutitems1234', layoutItems[y])
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    console.log('layoutcomponentsabc', layoutComponents);

                    try {
                        if (layoutComponents) {
                            var spaceType = layoutComponents.type;
                            if (spaceType === 'EmptySpace') {
                                PrepWasteHTML += '<br>';
                            } else {
                                console.log('In else', dataType);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        PrepWasteHTML += '</div>';
    }
    /*
    SetValues();
    */
    return PrepWasteHTML;
}

function PrepWasteDetailLayoutGenerator(Layoutdata) {
    var PrepWasteHTML = '';
    var CountReadOnlyFields = 0;

    StoreVolume = '';

    for (var i = 0; i < Prep_WasteData.length; i++) {
        if (Prep_WasteData[i]['Id'] === PreWasteMgmt_PrepWaste) {
            StoreVolume = Prep_WasteData[i]['STKR__Volume__c'];
        }
    }

    PrepWasteHTML += '<center><h5>Additional Information</h5></center>';
    PrepWasteHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
    for (var i = 1; i < Layoutdata['detailLayoutSections'].length; i++) {
        var layoutRows = Layoutdata['detailLayoutSections'][i]['layoutRows'];
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var k = 0; k < layoutItems.length; k++) {
                var layoutComponent = layoutItems[k]['layoutComponents']
                for (var l = 0; l < layoutComponent.length; l++) {
                    try {
                        var NotImage = false;
                        if ((layoutComponent[l]['details']['calculatedFormula'])) {
                            if ((layoutComponent[l]['details']['calculatedFormula'].indexOf('IMAGE') === -1)) {
                                NotImage = true;
                            }
                        } else {
                            NotImage = true;
                        }
                        if (!(layoutComponent[l]['details']['updateable']) && NotImage) {
                            try {
                                var htmlid = layoutComponent[l]['details']['name'];
                                var label = layoutComponent[l]['details']['label'];
                                var dataType = layoutComponent[l]['details']['type'];
                                var precision = layoutComponent[l]['details']['precision'];
                                var scale = layoutComponent[l]['details']['scale'];
                                var max = Math.pow(10, (precision - scale)) - 1;
                                var step = Math.pow(10, -1 * scale);
                                CountReadOnlyFields++;
                                if (dataType === 'string') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<textarea name1="RemoveThis" type="text" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                    PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'email') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<input name1="RemoveThis" type="email" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" id="' + htmlid + '" disabled>';
                                    PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'reference') {
                                    if (navigator.onLine) {
                                        if (htmlid === 'STKR__Assigned_To__c') {
                                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                            if (newhtmlrequired === 'required')
                                                PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                            else
                                                PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                            PrepWasteHTML += '<select name1="RemoveThis" name="PrepWasteDetailLayoutName" id="' + htmlid + '" class="PrepWasteDetailPageMDL mdl-textfield__input" disabled>';
                                            for (var optionvalues = 0; optionvalues < Userdata.length; optionvalues++) {
                                                PrepWasteHTML += '<option value="' + Userdata[optionvalues]['Id'] + '">' + Userdata[optionvalues]['Name'] + '</option>';
                                            }
                                            PrepWasteHTML += '</select>';
                                            PrepWasteHTML += '</div></br>';
                                        }
                                    }
                                } else if (dataType === 'double') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<input name1="RemoveThis" type="number" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '" disabled>';
                                    PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'picklist') {
                                    if (newhtmlrequired === 'required')
                                        PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    else
                                        PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<select name1="RemoveThis" name="PrepWasteDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input" disabled>';

                                    // New Code 
                                    PrepWasteHTML += '<option value="" selected>--None--</option>';

                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {
                                        if (layoutComponent['details']['picklistValues'][optionvalues]['defaultValue']) {
                                            PrepWasteHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        } else {
                                            PrepWasteHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                        }
                                    }
                                    // END

                                    PrepWasteHTML += '</select>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'date') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                    PrepWasteHTML += '<input name1="RemoveThis" class="PrepWasteDetailPageMDL mdl-textfield__input" type="date" name="PrepWasteDetailLayoutName" id="' + htmlid + '" disabled>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'textarea') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<textarea name1="RemoveThis" name="PrepWasteDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input" type="text" rows="5" disabled></textarea>';
                                    PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '">' + label + '</label>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'datetime') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield">';
                                    PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                    PrepWasteHTML += '<input name1="RemoveThis" class="mdl-textfield__input" type="datetime-local" name="PrepWasteDetailLayoutName" id="' + htmlid + '" disabled>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'boolean') {
                                    if (device.platform === 'Android') {
                                        PrepWasteHTML += '<label class=" PrepWasteDetailPageMDL mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">'
                                        PrepWasteHTML += '<input name1="RemoveThis" name="PrepWasteDetailLayoutName" type="checkbox" id="' + htmlid + '" class="PrepWasteDetailPageMDL mdl-checkbox__input" disabled>'
                                        PrepWasteHTML += '<span class="PrepWasteDetailPageMDL mdl-checkbox__label">' + label + '</span>';
                                        PrepWasteHTML += '</label><br>';
                                    } else if (device.platform === 'iOS') {
                                        PrepWasteHTML += '<input name1="RemoveThis" name="PrepWasteDetailLayoutName" type="checkbox" id="' + htmlid + '" disabled>';
                                        PrepWasteHTML += '<label for="' + htmlid + '">';
                                        PrepWasteHTML += '<span>' + label + '</span>';
                                        PrepWasteHTML += '</label><br>';
                                    }
                                } else if (dataType === 'multipicklist') {
                                    if (newhtmlrequired === 'required')
                                        PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    else
                                        PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label><br/>';
                                    PrepWasteHTML += '<div class=" PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<select name1="RemoveThis" class="mdl-textfield__input" name="PrepWasteDetailLayoutName" id="' + htmlid + '" multiple disabled>';
                                    for (var optionvalues = 0; optionvalues < layoutComponent['details']['picklistValues'].length; optionvalues++) {
                                        PrepWasteHTML += '<option value="' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponent['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                    }
                                    PrepWasteHTML += '</select>';
                                    PrepWasteHTML += '</div><br>';
                                } else if (dataType === 'currency') {
                                    PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                    PrepWasteHTML += '<textarea name1="RemoveThis" type="text" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" id="' + htmlid + '" disabled></textarea>';
                                    PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                                    PrepWasteHTML += '</div><br>';
                                } else {
                                    console.log('In else', dataType);
                                }
                            } catch (err) {
                                console.log(err);
                            }
                        }
                    } catch (e) {
                        console.log('Prep/wastecreate', e)
                    }
                }
            }
        }
    }
    PrepWasteHTML += '</div>';
    if (CountReadOnlyFields === 0) {
        PrepWasteHTML = '';
    }
    for (var x = 0; x < Layoutdata['editLayoutSections'].length; x++) {
        var layoutRows = Layoutdata['editLayoutSections'][x]['layoutRows'];
        var layoutHeader = Layoutdata['editLayoutSections'][x]['heading'];
        PrepWasteHTML += '<center><h5>' + layoutHeader + '</h5></center>';
        PrepWasteHTML += '<div class="mdl-shadow--2dp" style="margin:2%;padding:2%;background-color:#fff; border-radius: 10px;">';
        for (var j = 0; j < layoutRows.length; j++) {
            var layoutItems = layoutRows[j]['layoutItems'];
            for (var y = 0; y < layoutItems.length; y++) {
                if (layoutItems[y]['editableForUpdate']) {
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    try {
                        var label = layoutComponents['details']['label'];
                        var htmlid = layoutComponents['details']['name'];
                        var dataType = layoutComponents['details']['type'];
                        var nillable = layoutComponents['details']['nillable'];
                        var precision = layoutComponents['details']['precision'];
                        var scale = layoutComponents['details']['scale'];
                        var max = Math.pow(10, (precision - scale)) - 1;
                        var step = Math.pow(10, -1 * scale);
                        var htmlrequired = nillable ? '' : 'required';
                        var maxlength = layoutComponents['details']['length'];
                        var newhtmlrequired = layoutItems[y]['required'] ? 'required' : '';
                        if (dataType === 'string') {
                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="text" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'reference') {
                            if (htmlid === 'STKR__Prep_Waste__c') {
                                PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                                if (newhtmlrequired === 'required')
                                    PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                else
                                    PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                                PrepWasteHTML += '<select name="PrepWasteDetailLayoutName" onChange="UpdateVolume_Detail(this.value);" id="' + htmlid + '" class="mdl-textfield__input"' + newhtmlrequired + '>';
                                for (var optionvalues = 0; optionvalues < Prep_WasteData.length; optionvalues++) {
                                    //   PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    if (FromWhichPage == "Visit" && Prep_WasteData[optionvalues].STKR__Exclude_from_Visit_Prep__c == false) {
                                        PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    }else if(FromWhichPage == "Action"){
                                        PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                    } 
                                    else if(FromWhichPage =="Inspection" ) {
                                        if(Prep_WasteData[optionvalues].STKR__Available_Inspection_Item_Types__c == null){
                                            PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                        }else{
                                            var temp = Prep_WasteData[optionvalues].STKR__Available_Inspection_Item_Types__c.split(';')
                                            for (p = 0; p < temp.length; p++) {
                                                if (temp[p] == InspectionItemDetail.STKR__Item_Type__c) {
                                                    PrepWasteHTML += '<option value="' + Prep_WasteData[optionvalues]['Id'] + '">' + Prep_WasteData[optionvalues]['Name'] + ' (' + Prep_WasteData[optionvalues]['STKR__Type__c'] + ')' + '</option>';
                                                }
                                            }
                                        }
                                    }
                                }
                                PrepWasteHTML += '</select>';
                                PrepWasteHTML += '<input type="text" id="STKR__Volume__c_Detail" class="PrepWastePageMDL mdl-textfield__input" value="' + StoreVolume + '" readonly style="position:absolute;margin-top:-10%;border:none;text-align:end;right:0;width:40%;">';
                                PrepWasteHTML += '</div><br>';
                            }
                        } else if (dataType === 'double') {
                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="number" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" max="' + max + '" step="' + step + '" id="' + htmlid + '"' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'picklist') {
                            if (newhtmlrequired === 'required')
                                PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            else
                                PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<select name="PrepWasteDetailLayoutName" id="' + htmlid + '" class="mdl-textfield__input"' + newhtmlrequired + '>';

                            // New Code 
                            PrepWasteHTML += '<option value="" selected>--None--</option>';

                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                if (layoutComponents['details']['picklistValues'][optionvalues]['defaultValue']) {
                                    PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                } else {
                                    PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                                }
                            }

                            // END
                            PrepWasteHTML += '</select>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'date') {
                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield">';
                            PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<input class="PrepWasteDetailPageMDL mdl-textfield__input" type="date" name="PrepWasteDetailLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'textarea') {
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<textarea name="PrepWasteDetailLayoutName" id="' + htmlid + '" class="PrepWasteDetailPageMDL mdl-textfield__input" type="text" rows="5" maxlength="' + maxlength + '"></textarea>';
                            PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"' + newhtmlrequired + '>' + label + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'datetime') {
                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield">';
                            PrepWasteHTML += '<label style="color: rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<input class="PrepWasteDetailPageMDL mdl-textfield__input" type="date" name="PrepWasteDetailLayoutName" id="' + htmlid + '"' + newhtmlrequired + '/>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'boolean') {
                            if (device.platform === 'Android') {
                                PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect" for="' + htmlid + '">'
                                PrepWasteHTML += '<input name="PrepWasteDetailLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '" class="PrepWasteDetailPageMDL mdl-checkbox__input"' + newhtmlrequired + '>'
                                PrepWasteHTML += '<span class="PrepWasteDetailPageMDL mdl-checkbox__label" style="vertical-align: super;">' + label + '</span>';
                                PrepWasteHTML += '</label><br>';
                            } else if (device.platform === 'iOS') {
                                PrepWasteHTML += '<input name="PrepWasteDetailLayoutName" type="checkbox" style="width:25px;height:25px;" id="' + htmlid + '"' + newhtmlrequired + '>';
                                PrepWasteHTML += '<label for="' + htmlid + '">';
                                PrepWasteHTML += '<span style="vertical-align: super;">' + label + '</span>';
                                PrepWasteHTML += '</label><br>';
                            }
                        } else if (dataType === 'multipicklist') {
                            if (newhtmlrequired === 'required')
                                PrepWasteHTML += '<label style="color:rgb(215,0,0);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            else
                                PrepWasteHTML += '<label style="color:rgb(0,188,212);font-size: 16px;" for="' + htmlid + '">' + label + '</label>';
                            PrepWasteHTML += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<select class="mdl-textfield__input" name="PrepWasteDetailLayoutName" id="' + htmlid + '" multiple' + newhtmlrequired + '>';
                            for (var optionvalues = 0; optionvalues < layoutComponents['details']['picklistValues'].length; optionvalues++) {
                                PrepWasteHTML += '<option value="' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '">' + layoutComponents['details']['picklistValues'][optionvalues]['value'] + '</option>';
                            }
                            PrepWasteHTML += '</select>';
                            PrepWasteHTML += '</div><br>';
                        } else if (dataType === 'currency') {
                            PrepWasteHTML += '<div class="PrepWasteDetailPageMDL mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
                            PrepWasteHTML += '<input type="number" name="PrepWasteDetailLayoutName" class="PrepWasteDetailPageMDL mdl-textfield__input" id="' + htmlid + '" maxlength="' + maxlength + '" ' + newhtmlrequired + '>';
                            PrepWasteHTML += '<label class="PrepWasteDetailPageMDL mdl-textfield__label" for="' + htmlid + '"">' + label + "(" + userDefaultCurrency + ")" + '</label>';
                            PrepWasteHTML += '</div><br>';
                        } else {
                            console.log('In else', dataType);
                        }
                    } catch (e) {}
                } else {
                    // console.log('layoutitems1234', layoutItems[y])
                    var layoutComponents = layoutItems[y]['layoutComponents'][0];
                    console.log('layoutcomponentsabc', layoutComponents);

                    try {
                        if (layoutComponents) {
                            var spaceType = layoutComponents.type;
                            if (spaceType === 'EmptySpace') {
                                PrepWasteHTML += '<br>';
                            } else {
                                console.log('In else', dataType);
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        PrepWasteHTML += '</div>';
    }
    return PrepWasteHTML;
}