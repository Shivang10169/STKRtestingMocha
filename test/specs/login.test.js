const LoginPage = require('../../pageObject/android/login.page');
const AllowPage=require('../../pageObject/android/Allow.Page');
const refreshAlldataPage=require("../../PageObject/Android/RefreshAllData.page");
const SearchPageAcess=require("../../PageObject/Android/search.page");
const StartWorkPage=require("../../PageObject/Android/StartWork.page");
const CheckMyVisitStatus=require("../../PageObject/Android/MyVisitStatus.page");

const Todos = require('../index')
let todos = new Todos();
var webdriver = require('selenium-webdriver')
var driver = new webdriver.Builder()
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
    
    var a = new Date();
    //console.log("Time 1: " + a.toISOString());

    beforeEach(function (done) {
        setTimeout(function () {
            //done();
        }, 45000);
    });

    it('check login screen present or not', function (done) {
        var c = new Date();
        console.log("Time 2: " + c.toISOString());

        var error = LoginPage.userNameField.error.error
        expect(error).equal("no such element");
        if (error) {
            console.log('Login screen not visible', error);
        } else {
            done();
        }
    });

    it('fill input values ', function (done) {
        var c = new Date();
        console.log("Time 3: " + c.toISOString());

        ////username
        //var error = LoginPage.userNameField.error.error
        //if(!error){

        LoginPage.userNameField.addValue("fielduser@servicetracker.uk.com");
        let username = LoginPage.userNameField.getText();
        expect(username).equal("fielduser@servicetracker.uk.com");

        //// password 
        LoginPage.passwordField.addValue("Start2014");
        let password = LoginPage.passwordField.getText();
        //expect(password).equal("Start2014");

        ///// remember Me 
        LoginPage.rememberMe.getText();
        let remember = LoginPage.rememberMe.getAttribute('checked');
    });

    it('click login button', function () {
        LoginPage.loginButton.click();
        console.log('clicked on the login button')
    });

    it('allow deny screen',function(){
        if(AllowPage.AllowAccessPage.getText()){
            console.log()
        }
        AllowPage.AllowData.click();
    });
});

describe('download all data page', function () {
    beforeEach(function (done) {
        setTimeout(function () {
            console.log('all data');
        }, 95000);
    });
//make change after all done
    it('check page', function(){
        let RefeshPage = refreshAlldataPage.refreshAlldataPageBtn.getText();
        console.log(' on the Refesh all data screen ', RefeshPage)
        // if(RefeshPage)
        //   LoginPage.refreshAlldataPage.click();
        
    });
});

describe('Search Module', function () {

    it('click search button',function(){
        SearchPageAcess.searchBtn.click();
        SearchPageAcess.searchTextBox.addValue("astrea");
        SearchPageAcess.searchTextBtn.click();
    
        if(SearchPageAcess.searchItemListView.getText()){
            console.log("Search list view",SearchPageAcess.searchItemListView.getText())
        }
    });

    it('click search button for not exist value',function(){
        SearchPageAcess.searchTextBox.addValue("");
        SearchPageAcess.searchTextBox.addValue("zzz");
        SearchPageAcess.searchTextBtn.click();
        if(SearchPageAcess.searchNotFoundVisitMessage.getText()){
            console.log("not found test",SearchPageAcess.searchNotFoundVisitMessage.getText())
        }
        console.log("for zzz not found");
        SearchPageAcess.homePage.click();
    });
});

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
    });

    it("My visit next state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
    });

    it("My visit next state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
    });

    it("My visit next state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
    
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
    });

    it("My visit next state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
    
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
    });

    it("My visit next state",function(){
        console.log("Status",CheckMyVisitStatus.statusText.getText())
        CheckMyVisitStatus.VisitstatusBtn.click()
        CheckMyVisitStatus.statusChangePopUp.click()
        var result = browser.execute('mobile: scroll', {direction: 'down'})
        console.log("visit scroll",result)
    });
    
});