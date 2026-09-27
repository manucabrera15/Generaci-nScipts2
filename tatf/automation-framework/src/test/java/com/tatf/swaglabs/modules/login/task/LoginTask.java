package com.tatf.swaglabs.modules.login.task;

import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;
import com.tatf.swaglabs.modules.home.data.HomeData;
import com.tatf.swaglabs.modules.home.task.HomeTask;
import com.tatf.swaglabs.modules.login.data.LoginData;
import com.tatf.swaglabs.modules.login.pom.LoginPO;

public class LoginTask {
    private final IBrowser browser;
    private final LoginPO login;

    public LoginTask(IBrowser browser) {
        this.browser = browser;
        this.login = new LoginPO(this.browser);
    }

    public void enterToSystem(String url) {
        this.browser.interaction().navigateTo(url);
    }

    public void verifyTitle(String title) {
        IVerify.create().verify(LoginData.TITLE, this.login.getTitle(), "El título no es el esperado.");
    }

    public void logInToTheSystemAndVerify(String username, String password) {
        this.login.enterUsername(username);
        this.login.enterPassword(password);
        this.login.clickLogin();
        new HomeTask(browser).verifyTitle(HomeData.TITLE);
    }
}
