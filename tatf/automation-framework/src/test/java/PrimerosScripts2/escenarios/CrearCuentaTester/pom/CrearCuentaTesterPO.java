package PrimerosScripts2.escenarios.CrearCuentaTester.pom;

import com.tatf.core.browser.IBrowser;

public class CrearCuentaTesterPO {

    private final IBrowser browser;

    public CrearCuentaTesterPO(IBrowser browser) {
        this.browser = browser;
    }

    public boolean DatosTester(String nombre, String apellido,
                               String email, String pais,
                               String tipoTester) {

        String datosTester =
                "//tr[td='" + nombre +
                        "' and td='" + apellido +
                        "' and td='" + email +
                        "' and td='" + pais +
                        "' and td='" + tipoTester + "']";

        return !this.browser.find()
                .xpathList(datosTester)
                .isEmpty();
    }
}