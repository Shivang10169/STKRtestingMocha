const LoginPage = require('../../pageObject/android/login.page');
const AllowPage=require('../../pageObject/android/Allow.Page');
const refreshAlldataPage=require("../../PageObject/Android/RefreshAllData.page");
const SearchPageAcess=require("../../PageObject/Android/search.page");
const StartWorkPage=require("../../PageObject/Android/StartWork.page");
const CheckMyVisitStatus=require("../../PageObject/Android/MyVisitStatus.page");

const Todos = require('../index')
let todos = new Todos();
const expect = require('chai').expect;

// const { JSDOM } = require( 'jsdom' );
// const jsdom = new JSDOM('../../www/view/visitdetail');

// const { window } = jsdom;
// const { document } = window;
// global.window = window;
// global.document = document;

// const $ = global.jQuery = require( 'jquery' );


//Athentication and Allow data access screen
describe('Authentication', function () {
    it('check login screen present or not', function (done) {
        //driver.setImplicitTimeout(2000)
        var b = new Date();
        console.log("Time 2: " + b.toISOString());
        
        var error = LoginPage.userNameField.error.error
        expect(error).equal("no such element");
        if (error) {
            console.log('Login screen not visible', error);
        } else {
            done();
        }
    });

    it('fill input values ', function (done) {
        driver.setImplicitTimeout(3000)
        var c = new Date();
        console.log("Time 3: " + c.toISOString());

        LoginPage.userNameField.addValue("fielduser@servicetracker.uk.com");
    
        //// password 
        LoginPage.passwordField.addValue("Start2014");
        
        ///// remember Me 
        LoginPage.rememberMe.getText();
        let remember = LoginPage.rememberMe.getAttribute('checked');

        LoginPage.loginButton.click();

    });


    it('allow deny screen',function(){
        if(AllowPage.AllowAccessPage.getText()){
            console.log()
        }
        driver.touchAction([
            { action: 'press', x: 650, y: 1760 },
            { action: 'moveTo', x: 650, y: 1666 },
            'release',
        ])
        AllowPage.AllowData.click();
    });
});


//Download all data page For refesh button
describe('download all data page', function () {
    //make change after all done
    it('check page', function(){
        driver.setImplicitTimeout(2000)
        var d = new Date();
        console.log("Time 4: " + d.toISOString());
        let RefeshPage = refreshAlldataPage.refreshAlldataPageBtn.getText();
        console.log(' on the Refesh all data screen ', RefeshPage)
        // if(RefeshPage)
          refreshAlldataPage.refreshAlldataPageBtn.click();
        
    });
});


//Test search module
describe('Search Module', function () {

    it('click search button',function(){
        SearchPageAcess.searchBtn.click();
        SearchPageAcess.searchTextBox.addValue("astrea");
        expect(SearchPageAcess.searchTextBox.getText()).equal("astrea");
        SearchPageAcess.searchTextBtn.click();
        
        if(SearchPageAcess.searchItemListView.getText()){
            console.log("Search list view",SearchPageAcess.searchItemListView.getText())
        }
    });

    it('click search button for not exist value',function(){
        SearchPageAcess.searchTextBox.addValue("");
        expect(SearchPageAcess.searchTextBox.getText()).equal("");
        SearchPageAcess.searchTextBox.addValue("zzz");
        expect(SearchPageAcess.searchTextBox.getText()).equal("zzz");
        SearchPageAcess.searchTextBtn.click();
        if(SearchPageAcess.searchNotFoundVisitMessage.getText()){
            console.log("not found test",SearchPageAcess.searchNotFoundVisitMessage.getText())
        }
        console.log("for zzz not found");
        SearchPageAcess.homePage.click();
    });
});


//start work
describe('Start/End work', function () {
    it("Check Vehicle",()=>{
        StartWorkPage.finishBtn.click();
        StartWorkPage.finishBtnPopupOk.click();
        LoginPage.homePage.click();
    });
});

//Test all visit statues
describe("Check statuses",function(){
        it("My visit Open state",function(){
        CheckMyVisitStatus.MyVisitPage.click()
        CheckMyVisitStatus.VisitTest.click()
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()   
        driver.setImplicitTimeout(6000) 
        var state1=CheckMyVisitStatus.statusText.getText();
        expect(state1).equal(" Open ACCEPT");   
        console.log("Status",state1) 
    });

    it("My visit Acceptes start state",function(){
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        driver.setImplicitTimeout(6000)
        var state2=CheckMyVisitStatus.statusText.getText();
        expect(state2).equal(" Accepted START");
        console.log("Status",state2)
    });

    it("My visit journey started state",function(){
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        driver.setImplicitTimeout(6000)
        var state3=CheckMyVisitStatus.statusText.getText();
        expect(state3).equal(" Journey Started forward ARRIVE");
        console.log("Status",state3)
    });

    it("My visit In Progress PAUSE state",function(){
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        driver.setImplicitTimeout(10000)
        var state4=CheckMyVisitStatus.statusText.getText();
        expect(state4).equal(" In Progress PAUSE");
        console.log("Status",state4)
    });

    it("My visit Paused RESUME state",function(){
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        driver.setImplicitTimeout(8000)
        var state5=CheckMyVisitStatus.statusText.getText();
        expect(state5).equal(" Paused RESUME");
        console.log("Status",state5)
    });

    it("My visit In Progress PAUSE state",function(){
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        driver.setImplicitTimeout(6000)
        var state6=CheckMyVisitStatus.statusText.getText();
        expect(state6).equal(" In Progress PAUSE");
        console.log("Status",state6)
    });
});