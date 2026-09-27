package com.tatf.core.browser;

import com.tatf.core.driver.factory.DriverType;
import com.tatf.core.driver.instance.DriverManagerSingleton;

public class BrowserFactory {
    private static final int EXPLICIT_WAIT_DEFAULT_SECONDS = 10;

    private BrowserFactory() {
    }

    /**
     * Arma un IBrowser listo para usar, con el driver correspondiente.
     *
     * @param debugging Si es true, resalta los elementos al interactuar con ellos.
     */
    public static IBrowser getBrowser(boolean debugging) {
        DriverType type = resolveDriverType();
        DriverManagerSingleton instance = DriverManagerSingleton.getInstance(type);
        return new BrowserImpl(instance, EXPLICIT_WAIT_DEFAULT_SECONDS, debugging);
    }

    /**
     * Lee el browser a usar desde la propiedad del sistema "browser" (CHROME por defecto).
     */
    private static DriverType resolveDriverType() {
        String browserProperty = System.getProperty("browser", "CHROME");
        return DriverType.valueOf(browserProperty.toUpperCase());
    }

    /**
     * Cierra el browser actual y libera la instancia del Singleton.
     */
    public static void quitBrowser() {
        DriverType type = resolveDriverType();
        DriverManagerSingleton.getInstance(type).quit();
    }
}
