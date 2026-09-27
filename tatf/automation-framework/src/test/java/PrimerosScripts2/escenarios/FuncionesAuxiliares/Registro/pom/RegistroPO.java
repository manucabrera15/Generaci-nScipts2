package PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.pom;

import com.tatf.core.browser.IBrowser;

public class RegistroPO {
    private final IBrowser browser;

    private final String LinkRegistro = "Registrarse";
    private final String Nombre = "inputFirstName";
    private final String Apellido = "inputLastName";
    private final String Email = "inputEmail";
    private final String Contrasena = "inputPassword";
    private final String RepetirContrasena = "inputRepeatPassword";
    private final String PaisNacimiento = "inputCountry";
    private final String BotonRegistro = "btnRegister";
    private final String BotonConfirmar = "button.swal2-confirm";

    public RegistroPO(IBrowser browser) {
        this.browser = browser;
    }

    public void IngresarRegistro(){
        this.browser.find().link(LinkRegistro).click();
    }

    public void IngresarNombre(String nombre) {
        this.browser.find().name(Nombre).write(nombre);
    }

    public void IngresarApellido(String apellido){
        this.browser.find().name(Apellido).write(apellido);
    }

    public void IngresarEmail(String email) {
        this.browser.find().name(Email).write(email);
    }

    public void IngresarContrasena(String contrasena) {
        this.browser.find().name(Contrasena).write(contrasena);
    }

    public void IngresarRepetirContrasena(String repetir_contrasena) {
        this.browser.find().name(RepetirContrasena).write(repetir_contrasena);
    }

    public void IngresarPais(String paisNacimiento) {
        this.browser.find().name(PaisNacimiento).write(paisNacimiento);
    }

    public void clickRegistrar() {
        this.browser.find().id(BotonRegistro).click();
    }

    public void esperarMensajeRegistro() {
        this.browser.wait(BotonConfirmar);
    }

    public void clickConfirmar() {
        this.browser.find().css(BotonConfirmar).click();

        }
    }


