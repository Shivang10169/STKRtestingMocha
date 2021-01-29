// function sum(a,b){
//     return a+b;
// }

function getvisit() {
    SearchResult = [];
    RestVisits = [];
    CompletedVisits = [];
    StoreTerritoryId = [];
   // $('#MessaageOfSearch').hide();
    try {
       // $("#ListViewForSearchVisit").data("kendoMobileListView").replace(SearchResult);
    } catch (err) {
        console.log(err);
    }
   // SearchTerm = $('#term').val();
    console.log(SearchTerm);

    function pushUniqueVisit(visitRecord) {
        let found = false;
        for (var i = 0; i < SearchResult.length; i++) {
            if (SearchResult[i].Id == visitRecord.Id) {
                found = true;
                break;
            }
        }
        if (!found)
            SearchResult.push(visitRecord);
    }

    if (SearchTerm) {
        for (var j = 0; j < ScheduleData.length; j++) {
            if (ScheduleData[j]['STKR__Account__r']['STKR__Territory__r'] != null) {
                if ((ScheduleData[j]['STKR__Account__r']['STKR__Territory__r']['Name'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    console.log('matched');
                    StoreTerritoryId.push(ScheduleData[j]['STKR__Account__r']['STKR__Territory__r']['Id'].substring(0, 15));
                }
            }
        }
        for (var i = 0; i < AllVisits.length; i++) {
            // Search By Name
            if (AllVisits[i]['Name'])
                if ((AllVisits[i]['Name'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }

            // Search By Status
            if (AllVisits[i]['STKR__Status__c'])
                if ((AllVisits[i]['STKR__Status__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search by Account Name
            if (AllVisits[i]['STKR__Account__c'])
                if ((AllVisits[i]['STKR__Account__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //search By Visit type
            if (AllVisits[i]['STKR__Visit_Type__c'])
                if ((AllVisits[i]['STKR__Visit_Type__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Start Due Date
            if (AllVisits[i]['STKR__Due_Date__c'])
                if ((AllVisits[i]['STKR__Due_Date__c'].split('T')[0]).match(SearchTerm)) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By End Due Date
            if (AllVisits[i]['STKR__Due_Finish__c'])
                if ((AllVisits[i]['STKR__Due_Finish__c'].split('T')[0]).match(SearchTerm)) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Record Type
            if (AllVisits[i]['RecordTypeId'])
                if ((AllVisits[i]['RecordTypeId']).match(SearchTerm)) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Address
            if (AllVisits[i]['STKR__Address__c'])
                if ((AllVisits[i]['STKR__Address__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Pests Found
            if (AllVisits[i]['STKR__Pests_Found__c'])
                if ((AllVisits[i]['STKR__Pests_Found__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Other Pests Found
            if (AllVisits[i]['STKR__Other_Pests_Found__c'])
                if ((AllVisits[i]['STKR__Other_Pests_Found__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Risk Assesment
            if (AllVisits[i]['STKR__Risk_Assessment__c'])
                if ((AllVisits[i]['STKR__Risk_Assessment__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Risk Assesment Question
            if (AllVisits[i]['STKR__Risk_Assessment_Questions__c'])
                if ((AllVisits[i]['STKR__Risk_Assessment_Questions__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            //Search By Recommendation
            if (AllVisits[i]['STKR__Recommendations__c'])
                if ((AllVisits[i]['STKR__Recommendations__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Prep Used
            if (AllVisits[i]['STKR__Prep_Used__c'])
                if ((AllVisits[i]['STKR__Prep_Used__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Proofing
            if (AllVisits[i]['STKR__Proofing__c'])
                if ((AllVisits[i]['STKR__Proofing__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Hygiene
            if (AllVisits[i]['STKR__Hygiene__c'])
                if ((AllVisits[i]['STKR__Hygiene__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Notes
            if (AllVisits[i]['STKR__Notes__c'])
                if ((AllVisits[i]['STKR__Notes__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Notes Long
            if (AllVisits[i]['STKR__Notes_Long__c'])
                if ((AllVisits[i]['STKR__Notes_Long__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Seacrh By Priority 
            if (AllVisits[i]['STKR__Priority__c'])
                if ((AllVisits[i]['STKR__Priority__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Healt and Safety Note
            if (AllVisits[i]['STKR__Heath_And_Safety__c'])
                if ((AllVisits[i]['STKR__Heath_And_Safety__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Resource Name 
            if (AllVisits[i]['STKR__Resource_Name__c'])
                if ((AllVisits[i]['STKR__Resource_Name__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Business Type
            if (AllVisits[i]['STKR__Visit_Type__c'])
                if ((AllVisits[i]['STKR__Visit_Type__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // Search By Findings
            if (AllVisits[i]['STKR__Field_Notes__c'])
                if ((AllVisits[i]['STKR__Field_Notes__c'].toLowerCase()).match(SearchTerm.toLowerCase())) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // search By Object Id  
            if (AllVisits[i]['Id'])
                if ((AllVisits[i]['Id']).match(SearchTerm)) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // search By description
            if (AllVisits[i]['Id'])
                if ((AllVisits[i]['Id']).match(SearchTerm)) {
                    pushUniqueVisit(AllVisits[i]);
                    continue;
                }
            // search By territory
            if (AllVisits[i]['STKR__Territory__c'])
                for (var pq = 0; pq < StoreTerritoryId.length; pq++) {
                    if ((StoreTerritoryId[pq].indexOf(AllVisits[i]['STKR__Territory__c']) > -1)) {
                        pushUniqueVisit(AllVisits[i]);
                        continue;
                    }
                }

        }
        //console.log('Matched Visits', SearchResult);
        if (SearchResult.length) {
            try {
                for (var k = 0; k < SearchResult.length; k++) {
                    if (SearchResult[k]['STKR__Status__c'] === 'Complete') {
                        CompletedVisits.push(SearchResult[k]);
                    } else {
                        RestVisits.push(SearchResult[k]);
                    }
                }
              //  $("#ListViewForSearchVisit").data("kendoMobileListView").replace(RestVisits);
            } catch (err) {
                console.log(err);
            }
            changeVisitColor();
        } else {
          //  $('#MessaageOfSearch').show();
        }
    } else {
        app.toastMessage('Please Enter Something', 'long');
    }
    return SearchResult.length;
}

module.exports=getvisit;