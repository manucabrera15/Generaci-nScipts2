package PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.pom;

import com.tatf.core.browser.IBrowser;

public class InicioDeSesionPO {
    private final IBrowser browser;

    private final String LinkInicio = "Iniciar sesión";
    private final String Email = "inputEmail";
    private final String Contrasena = "inputPassword";
    private final String BotonIngresar = "button.btn-orange-ces";
    private final String Elemento_pagina_principal = "//div[@class='sidebar-brand-text mx-3']";
    private final String BotonConfirmar = "button.swal2-confirm.swal2-styled";

    public InicioDeSesionPO(IBrowser browser) {
        this.browser = browser;
    }

    public void clickIniciarSesion() {
        this.browser.find().link(LinkInicio).click();
    }

    public void IngresarEmail(String email) {
        this.browser.find().name(Email).write(email);
    }

    public void IngresarContrasena(String contrasena) {
        this.browser.find().name(Contrasena).write(contrasena);
    }

    public void clickIngresar() {
        this.browser.find().css(BotonIngresar).click();
    }

    public void esperarMensajeInicioSesion() {this.browser.wait(BotonConfirmar);}

    public void clickConfirmar() {this.browser.find().css(BotonConfirmar).click();}

    public void esperarPaginaPrincipal() {
        this.browser.wait(Elemento_pagina_principal);
    }

    public boolean UsuarioAccedido(String NombreUsuario) {
       return !this.browser.find()
                .linkList(NombreUsuario)
               .isEmpty();
    }
}

