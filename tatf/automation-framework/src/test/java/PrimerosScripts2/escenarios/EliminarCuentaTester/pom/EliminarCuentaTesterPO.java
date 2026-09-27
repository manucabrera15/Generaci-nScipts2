package PrimerosScripts2.escenarios.EliminarCuentaTester.pom;

import com.tatf.core.browser.IBrowser;

public class EliminarCuentaTesterPO {
    private final IBrowser browser;

    private final String BotonEliminar = "Sosa15@gmail.com";
    private final String BotonConfirmar = "button.swal2-confirm";

    public EliminarCuentaTesterPO(IBrowser browser){
        this.browser = browser;
    }

    public void clickEliminarTester() {
        this.browser.find().id(BotonEliminar).click();
    }

    public void esperarConfirmacion() {
        this.browser.wait(BotonConfirmar);
    }

    public void clickSi() {
        this.browser.find().css(BotonConfirmar).click();
    }

    public boolean testerEliminado() {

        String datosTester =
                "//tr[td='Juan' and td='Sosa' and td='Sosa15@gmail.com'" +
                        " and td='Uruguay' and td='Tester Junior']";

        return this.browser.find()
                .xpathList(datosTester)
                .isEmpty();
    }
}
