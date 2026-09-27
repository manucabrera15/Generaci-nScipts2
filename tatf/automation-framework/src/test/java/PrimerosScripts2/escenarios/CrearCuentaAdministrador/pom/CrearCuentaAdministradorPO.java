package PrimerosScripts2.escenarios.CrearCuentaAdministrador.pom;

import com.tatf.core.browser.IBrowser;

public class CrearCuentaAdministradorPO {
    private final IBrowser browser;

    private final String LinkVerUsuario = "Ver usuarios";

    public CrearCuentaAdministradorPO(IBrowser browser) {
        this.browser = browser;
    }


    public void ClickVerUsuario(){
       this.browser.find().link(LinkVerUsuario).click();
        this.browser.wait(2).sleep();
    }

    public boolean UsuarioEnLista(String nombreUsuario) {
        String[] partes = nombreUsuario.split(" ");

        return !this.browser.find()
                .xpathList(
                        "//tr[td[contains(normalize-space(), '" + partes[0] + "')]" +
                                " and td[contains(normalize-space(), '" + partes[1] + "')]]"
                )
                .isEmpty();
    }

}
