var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator

/* main function */
var getRadius;

getRadius = window.localStorage.getItem('radius');

if (getRadius === null || getRadius === '' || !getRadius) {
    getRadius = 16;
}

function findDistance(frm, visitdata, from) {
    var fromTab = from;
    var t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi, km;
    // get values for lat1, lon1, lat2, and lon2
    t1 = frm.lat1.value;
    n1 = frm.lon1.value;
    t2 = frm.lat2.value;
    n2 = frm.lon2.value;

    // convert coordinates to radians
    lat1 = deg2rad(t1);
    lon1 = deg2rad(n1);
    lat2 = deg2rad(t2);
    lon2 = deg2rad(n2);

    // find the differences between the coordinates
    dlat = lat2 - lat1;
    dlon = lon2 - lon1;

    // here's the heavy lifting
    a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
    dm = c * Rm; // great circle distance in miles
    dk = c * Rk; // great circle distance in km

    // round the results down to the nearest 1/1000
    mi = round(dm);
    km = round(dk);

    // display the result
    frm.mi.value = mi;
    frm.km.value = km;
        
    if (frm.km.value <= parseInt(getRadius)) {
        // Updated by ashutosh on 18-03-2017, Please don't update this
        // Check if the data is overdue to show red color
        var visitdueDate;
        var currentDateTime = new Date();
        var CurrentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
        var dates, day, month, year; 
        
        if (device.platform === 'Win32NT') {
            // Added by Ashutosh on 15-09-2016
            dates = (visitdata['STKR__Due_Date__c']).split('T')[0];
            day = dates.split('-')[2];
            month = dates.split('-')[1];
            year = dates.split('-')[0];
            visitdueDate = new Date(year, month - 1, day);
        } else if (device.platform === 'iOS') {
            // Added by Ashutosh on 15-09-2016
            dates = (visitdata['STKR__Due_Date__c']).split('T')[0];
            day = dates.split('-')[2];
            month = dates.split('-')[1];
            year = dates.split('-')[0];
            visitdueDate = new Date(year, month - 1, day);
        } else {
            var visitdueDateTime = new Date(visitdata['STKR__Due_Date__c']);
            visitdueDate = new Date(visitdueDateTime.getFullYear(), visitdueDateTime.getMonth(), visitdueDateTime.getDate());
        }
        
        var diff = 0;
        diff = (visitdueDate).getTime() - (CurrentDate).getTime();
        diff = diff / (1000 * 60 * 60 * 24);
        
        if (diff < 0) {
            visitdata['isOverdue'] = true;
        }
        visitdata['RadiusInKM'] = frm.km.value;
        if (fromTab === 'nearby') {
            VisitNearby.push(visitdata);
        } else {
            VisitOverdue_Nearest.push(visitdata);
        }
    } else {
        //app.toastMessage('Distance between you and site : ' + frm.km.value + 'km');
    }
}

// convert degrees to radians
function deg2rad(deg) {
    rad = deg * Math.PI / 180; // radians = degrees * pi/180
    return rad;
}

// round to the nearest 1/1000
function round(x) {
    return Math.round(x * 1000) / 1000;
}