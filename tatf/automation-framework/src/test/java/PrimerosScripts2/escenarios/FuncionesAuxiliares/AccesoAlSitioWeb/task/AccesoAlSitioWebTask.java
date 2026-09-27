package PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.task;

import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.pom.AccesoAlSitioWebPO;

public class AccesoAlSitioWebTask {

    private final IBrowser browser;
    private final AccesoAlSitioWebPO acceso;

    public AccesoAlSitioWebTask(IBrowser browser) {
        this.browser = browser;
        this.acceso = new AccesoAlSitioWebPO(this.browser);
    }

    public void entrarAlSistema(String url, String claveAcceso) {
        this.browser.interaction().navigateTo(url);

        this.acceso.enterHash(claveAcceso);

        this.acceso.clickIngresar();

        this.acceso.esperarPaginaPrincipal();
    }

    public void verifyAccess() {
        IVerify.create().verifyTrue(
                this.acceso.sistemaAccedido(),
                "No se pudo acceder a la página principal de AdminCES."
        );

    }
}

