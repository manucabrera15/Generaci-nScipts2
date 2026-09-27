package com.tatf.swaglabs.modules.login.pom;

import com.tatf.core.browser.IBrowser;

public class LoginPO {
    private final IBrowser browser;

    private final String title = "p.art-name";
    private final String usernameInput = "docNumber";
    private final String passwordInput = "password";
    private final String loginButton = "loginBtn";

    public LoginPO(IBrowser browser) {
        this.browser = browser;
    }

    public String getTitle() {
        return this.browser.find().css(title).getText();
    }

    public void enterUsername(String username) {
        this.browser.find().id(usernameInput).write(username);
    }

    public void enterPassword(String password) {
        this.browser.find().id(passwordInput).write(password);
    }

    public void clickLogin() {
        this.browser.find().id(loginButton).click();
    }
}
