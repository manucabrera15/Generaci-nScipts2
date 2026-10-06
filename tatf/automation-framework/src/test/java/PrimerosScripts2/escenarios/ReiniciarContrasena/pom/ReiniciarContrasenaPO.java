package PrimerosScripts2.escenarios.ReiniciarContrasena.pom;

import com.tatf.core.browser.IBrowser;

public class ReiniciarContrasenaPO {
    private final IBrowser browser;

    private final String LinkReiniciarContrasena = "Reiniciar contraseña";
    private final String Email = "inputEmail";
    private final String Contrasena = "inputPassword";
    private final String RepetirContrasena = "inputRepeatPassword";
    private final String BotonReiniciar = "btnReset";
    private final String BotonConfirmar = "button.swal2-confirm.swal2-styled";

    public ReiniciarContrasenaPO(IBrowser browser) {
        this.browser = browser;
    }

    public void ClickReiniciarContrasena(){
        this.browser.find().link(LinkReiniciarContrasena).click();
    }
    public void IngresarEmail(String email) {
        this.browser.find().name(Email).write(email);
    }

    public void IngresarContrasena(String contrasena) {
        this.browser.find().name(Contrasena).write(contrasena);
    }

    public void IngresarRepetirContrasena(String repetirContrasena) {
        this.browser.find().name(RepetirContrasena).write(repetirContrasena);
    }

    public void ClickReiniciar() {
        this.browser.find().id(BotonReiniciar).click();
    }

    public void EsperarMensajeConfirmacion() {
        this.browser.wait(BotonConfirmar);
    }

    public void ClickConfirmar() {
        this.browser.find().css(BotonConfirmar).click();
    }

    public boolean VerificarNombre(String nombreUsuario){

        return !this.browser.find().xpathList("//a[contains(normalize-space(), '" +
                        nombreUsuario + "')]").isEmpty();
    }
}


