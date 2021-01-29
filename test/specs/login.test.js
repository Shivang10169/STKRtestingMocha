const LoginPage = require('../../pageObject/android/login.page')
const Todos = require('../index')
let todos = new Todos();

const expect = require('chai').expect;

describe('Login', () => {
    it('normal test', () => {
        expect('foo').to.equal('foo');
    })
    it('fill input values ',() =>{
        ////username
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
        // expect(text).equal("Actual User");

        
    })

    // it('click login button',() =>{
    //     LoginPage.loginButton.click();
    //     let vfScreen = LoginPage.vfCodeScreen.getText();
    //     console.log(' on the vf screen ', vfScreen)
    //    // expect(vfScreen).equal("Verify Your Identity"); 
    // })

    it('click login button',() =>{
        LoginPage.loginButton.click();
       let AllowScreen = LoginPage.AllowAccessPage;
      console.log(' on the Allow screen ,')
      console.log(' on the Allhvfuyfyj ,')
       //expect(AllowScreen).equal("Verify Your Identity"); 
    })

    // it('should detect when element is visible', () => {
    //     LoginPage.refreshAlldataPage.waitForDisplayed({ timeout: 3000000 });
    // });
    
    
   

    it('click Allow button',() =>{
       // LoginPage.AllowAccessPage.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        LoginPage.AllowData.click();
        let RefeshPage = LoginPage.refreshAlldataPage.getText();
            console.log(' on the Refesh all data screen ', RefeshPage)
        //  $('#LoadAllDataMDLButton').click();
        if(RefeshPage)
          LoginPage.refreshAlldataPage.click();
        
    });

    it('click search button',() =>{
        
        //browser.url("/Searchvisits.html");
        LoginPage.searchBtn.click();
        LoginPage.searchTextBox.addValue("astrea");
        LoginPage.searchTextBtn.click();
    
        if(LoginPage.searchItemListView){
            console.log("kjhgtfrdsxcvbhkjlukyhgf",LoginPage.searchItemListView)
        }
        
        //console.log("dhcvhsdgcv db",LoginPage.restvisit);
        
        if(todos.VisitSearchlist()){
            console.log("searched list");
        }

    });

    it('click search button for not exist value',() =>{

        LoginPage.searchTextBox.addValue("");
        LoginPage.searchTextBox.addValue("zzz");
        LoginPage.searchTextBtn.click();
        console.log("for zzz not found");
    });
    
})