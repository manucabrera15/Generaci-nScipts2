package com.tatf.core.driver.manager;

import org.openqa.selenium.chrome.ChromeOptions;

import java.util.Map;

public class ChromeDriver extends DriverManager {
    /**
     * Crea el driver de Chrome con las opciones por defecto.
     */
    public ChromeDriver() {
        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("start-maximized");
        chromeOptions.addArguments("--ignore-certificate-errors");

        chromeOptions.setExperimentalOption(
                "prefs",
                Map.of(
                        "credentials_enable_service", false,
                        "profile.password_manager_leak_detection", false
                )
        );

        this.driver = new org.openqa.selenium.chrome.ChromeDriver(chromeOptions);
        setDefaultConfig();
    }
}
