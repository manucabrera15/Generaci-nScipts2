package PrimerosScripts2.escenarios.base;

import com.tatf.core.browser.BrowserFactory;
import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

public class BaseTest {
    protected static IBrowser browser;
    protected static IVerify verify;
    protected static String url;

    @BeforeAll
    static void beforeAll() {
        browser = BrowserFactory.getBrowser(true);
        verify = IVerify.create();
        url = "http://cestore.ces.com.uy/adminces/";
    }

    @AfterAll
    static void afterAll() {
        BrowserFactory.quitBrowser();
    }
}