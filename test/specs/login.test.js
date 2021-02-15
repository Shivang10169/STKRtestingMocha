const LoginPage = require('../../pageObject/android/login.page');
const AllowPage=require('../../pageObject/android/Allow.Page');
const refreshAlldataPage=require("../../PageObject/Android/RefreshAllData.page");
const SearchPageAcess=require("../../PageObject/Android/search.page");
const StartWorkPage=require("../../PageObject/Android/StartWork.page");
const CheckMyVisitStatus=require("../../PageObject/Android/MyVisitStatus.page");

const Todos = require('../index')
let todos = new Todos();
//var webdriver = require('selenium-webdriver')
//var driver = new webdriver.Builder()
const expect = require('chai').expect;

const { JSDOM } = require( 'jsdom' );
const jsdom = new JSDOM('../../www/view/visitdetail');

const { window } = jsdom;
const { document } = window;
global.window = window;
global.document = document;

const $ = global.jQuery = require( 'jquery' );


//Athentication and Allow data access screen
describe('Authentication', function () {
    // this.timeout(76000);
    
    //var a = new Date();
    //console.log("Time 1: " + a.toISOString());

    // beforeEach(function (done) {
    //     setTimeout(function () {
    //         //done();
    //     }, 45000);
    // });

    it('check login screen present or not', function (done) {
        driver.setImplicitTimeout(2000)
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

        ////username
        //var error = LoginPage.userNameField.error.error
        //if(!error){

        LoginPage.userNameField.addValue("fielduser@servicetracker.uk.com");
        //let username = LoginPage.userNameField.getText();
        //expect(username).equal("fielduser@servicetracker.uk.com");

        //// password 
        LoginPage.passwordField.addValue("Start2014");
        //let password = LoginPage.passwordField.getText();
        //expect(password).equal("Start2014");

        ///// remember Me 
        LoginPage.rememberMe.getText();
        let remember = LoginPage.rememberMe.getAttribute('checked');

        LoginPage.loginButton.click();

    });

    // it('click login button', function () {
    //     LoginPage.loginButton.click();
    //     console.log('clicked on the login button')
    // });

    it('allow deny screen',function(){
        driver.setImplicitTimeout(4000)
        if(AllowPage.AllowAccessPage.getText()){
            console.log()
        }
        AllowPage.AllowData.click();
    });
});


//Download all data page For refesh button
describe('download all data page', function () {
    //driver.pause(2000)
    

    // beforeEach(function (done) {
    //     setTimeout(function () {
    //         console.log('all data');
    //     }, 95000);
    // });
//make change after all done
    it('check page', function(){
        driver.setImplicitTimeout(2000)
        var d = new Date();
        console.log("Time 4: " + d.toISOString());
        driver.touchAction([
            { action: 'press', x: 650, y: 1760 },
            { action: 'moveTo', x: 650, y: 1666 },
            'release',
             ])
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


//
describe('Start/End work', function () {
    it("Check Vehicle",()=>{
        StartWorkPage.finishBtn.click();
        StartWorkPage.finishBtnPopupOk.click();
        LoginPage.homePage.click();
    });
});


describe("Check statuses",function(){


    it("My visit Open state",function(){
        CheckMyVisitStatus.MyVisitPage.click()
        CheckMyVisitStatus.VisitTest.click()
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()     
        expect(CheckMyVisitStatus.statusText.getText()).equal(" Accepted START");   
    });

    it("My visit Acceptes start state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        expect(CheckMyVisitStatus.statusText.getText()).equal(" Accepted START");
        //setTimeout(function(){console.log('wait accept')},20000)
    });

    it("My visit journey started state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        expect(CheckMyVisitStatus.statusText.getText()).equal(" In Progress PAUSE");
    });

    it("My visit In Progress PAUSE state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        expect(CheckMyVisitStatus.statusText.getText()).equal(" In Progress PAUSE");
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        
    });

    it("My visit Paused RESUME state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        expect(CheckMyVisitStatus.statusText.getText()).equal(" Paused RESUME");
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        
    });

    it("My visit In Progress PAUSE state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        expect(CheckMyVisitStatus.statusText.getText()).equal(" In Progress PAUSE");
        // var result = browser.execute('mobile: scroll', {direction: 'down'})
        // console.log("visit scroll",result)
    });
    
});