package PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.pom;

import com.tatf.core.browser.IBrowser;

public class AccesoAlSitioWebPO {
    private final IBrowser browser;

    private final String ClaveAcceso = "pass";
    private final String BotonIngresar = "//form[@id='loginForm']//button[@type='submit']";
    private final String TituloPagina = "//div[@class='sidebar-brand-text mx-3']";

    public AccesoAlSitioWebPO(IBrowser browser) {

        this.browser = browser;
    }

    public void enterHash(String claveAcceso) {
        this.browser.find().id(ClaveAcceso).write(claveAcceso);
    }

    public void clickIngresar() {
        this.browser.find().xpath(BotonIngresar).click();
    }

    public void esperarPaginaPrincipal() {
        this.browser.wait(TituloPagina);
    }

    public boolean sistemaAccedido() {
        return !this.browser.find().xpathList(TituloPagina).isEmpty();
    }

}
