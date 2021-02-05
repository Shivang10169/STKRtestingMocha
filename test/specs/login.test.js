const LoginPage = require('../../pageObject/android/login.page')
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


console.log("kjhgcv ",browser.isAndroid);


describe('Authentication', function () {
    // this.timeout(76000);
    console.log('driver ',driver)
    var a = new Date();
    console.log("Time 1: " + a.toISOString());

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
        //expect(username).equal("fielduser@servicetracker.uk.com");

        //// password 
        LoginPage.passwordField.addValue("Start2014");
        let password = LoginPage.passwordField.getText();
        //expect(password).equal("Start2014");

        ///// remember Me 
        LoginPage.rememberMe.getText();
        let remember = LoginPage.rememberMe.getAttribute('checked');
        // expect(text).equal("Actual User");
        //}


    })

    // it('click login button',() =>{
    //     LoginPage.loginButton.click();
    //     let vfScreen = LoginPage.vfCodeScreen.getText();
    //     console.log(' on the vf screen ', vfScreen)
    //    // expect(vfScreen).equal("Verify Your Identity"); 
    // })

    it('click login button', function () {
        LoginPage.loginButton.click();
       //let AllowScreen = LoginPage.AllowAccessPage;
        console.log('clicked on the login button')
    })

    // it('should detect when element is visible', () => {
    //     LoginPage.refreshAlldataPage.waitForDisplayed({ timeout: 3000000 });
    // });
    
    
   

    it('allow deny screen',function(){
       // LoginPage.AllowAccessPage.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        LoginPage.AllowData.click();
      

    });

   


    // it("Check Vehicle Cancel",()=>{
        // LoginPage.finishBtn.click();
        //  LoginPage.finishBtn.click();
        // LoginPage.finishBtnPopupCancel.click()
        //  LoginPage.requiedVaslue.click()
        // LoginPage.createVehicle.click();
    // })

    // it('',()=>{

    // })
    
})

describe('download all data page', function () {
    beforeEach(function (done) {
        setTimeout(function () {
            console.log('all data');
        }, 95000);
    });
    it('check page', function(){
        let RefeshPage = LoginPage.refreshAlldataPage.getText();
        console.log(' on the Refesh all data screen ', RefeshPage)
        // if(RefeshPage)
        //   LoginPage.refreshAlldataPage.click();
        
    })
})

describe('Search Module', function () {
    it('click search button',() =>{
        
        //browser.url("/Searchvisits.html");
        LoginPage.searchBtn.click();
        LoginPage.searchTextBox.addValue("astrea");
        LoginPage.searchTextBtn.click();
    
        if(LoginPage.searchItemListView.getText()){
            console.log("kjhgtfrdsxcvbhkjlukyhgf",LoginPage.searchItemListView)
        }
        
        //console.log("dhcvhsdgcv db",LoginPage.restvisit);
        
        // if(todos.VisitSearchlist()){
        //     console.log("searched list");
        // }

    });

    it('click search button for not exist value',function(){

        LoginPage.searchTextBox.addValue("");
        LoginPage.searchTextBox.addValue("zzz");
        LoginPage.searchTextBtn.click();
        if(LoginPage.searchNotFoundVisitMessage.getText()){
            console.log("not found test",LoginPage.searchNotFoundVisitMessage.getText())
        }
        console.log("for zzz not found");
        LoginPage.homePage.click();
    });
})

describe('Start/End work', function () {
    it("Check Vehicle",()=>{
        LoginPage.finishBtn.click();
        LoginPage.finishBtnPopupOk.click()
        //LoginPage.requiedValue.click()
       // browser.click('#homePageBtn');
        // driver.findElement(By.id("homePageBtn")).click();
        LoginPage.homePage.click();
       // LoginPage.createVehicle.click();
    })
})

// describe('Test Myvisit',function(){
//     it("scroll to inspection button",function(){
    
//           LoginPage.MyVisitPage.click()
//           LoginPage.VisitTest.click()
//           LoginPage.inspectionbtn.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
//        // driver.findElements(webdriver.By.xpath(LoginPage.inspectionbtn)).click();
//         LoginPage.inspectionbtn.click(); 
//     })

// })

describe("Check statuses",function(){
    it("My visit Open state",function(){

        browser.touchPerform([{
            action: 'press',
            options: {
                x: 100,
                y: 250
            }
        }]);
        
        
        LoginPage.MyVisitPage.click()
    LoginPage.VisitTest.click()
    console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    //browser.touchScroll("#StatusButtton",0,250)
    //browser.touchFlick(10,100,"#StatusButtton")
    //browser.touchScroll(10,100,"StatusButtton")

    browser.touchAction([{action: 'press', x: 10, y: 100}, { action: 'moveTo', x: 10, y: 500 }, 'release'])
    })

    it("My visit next state",function(){
        console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    })

    it("My visit next state",function(){
        console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    })

    it("My visit next state",function(){
        console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    })

    it("My visit next state",function(){
        console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    })

    it("My visit next state",function(){
        console.log("Status",LoginPage.statusText.getText())
    
        LoginPage.VisitstatusBtn.click()
        LoginPage.statusChangePopUp.click()
    })


    //LoginPage.inspectionbtn.scrollIntoView("false");
  //driver.scroll(10, 100, LoginPage.inspectionbtn);

    
})