package com.tatf.swaglabs.modules.base;

import com.tatf.core.browser.BrowserFactory;
import com.tatf.core.browser.IBrowser;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

public class BaseTest {
    protected static IBrowser browser;
    protected static String url;
    protected static String userNameValue;
    protected static String passwordValue;

    @BeforeAll
    static public void configuration() {
        browser = BrowserFactory.getBrowser(true);
        url = "file:///C:/ProyectoManuel/GeneraciónScripts2/tatf/aplicando-pom/pom/04-home-banking/index.html";
        userNameValue = "12345678";
        passwordValue = "Rambla2026";
    }

    @AfterAll
    static public void close() {
        BrowserFactory.quitBrowser();
    }
}
