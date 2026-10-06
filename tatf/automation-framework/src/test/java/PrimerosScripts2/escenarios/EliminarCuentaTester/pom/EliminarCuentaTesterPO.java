package PrimerosScripts2.escenarios.EliminarCuentaTester.pom;

import com.tatf.core.browser.IBrowser;

public class EliminarCuentaTesterPO {
    private final IBrowser browser;

    private final String BotonConfirmar = "button.swal2-confirm";

    public EliminarCuentaTesterPO(IBrowser browser){

        this.browser = browser;
    }

    public void clickEliminarTester(String email) {

        this.browser.find().id(email).click();
    }

    public void esperarConfirmacion() {

        this.browser.wait(BotonConfirmar);
    }

    public void clickSi() {

        this.browser.find().css(BotonConfirmar).click();
    }

    public boolean testerEliminado(String nombre, String apellido, String email,
                                    String pais, String tipoTester) {

        String datosTester =
                "//tr[td='" + nombre +
                        "' and td='" + apellido +
                        "' and td='" + email +
                        "' and td='" + pais +
                        "' and td='" + tipoTester + "']";

        return this.browser.find()
                .xpathList(datosTester)
                .isEmpty();
    }
}
