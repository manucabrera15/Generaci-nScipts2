package PrimerosScripts2.escenarios.FuncionesAuxiliares.CrearTester.pom;

import com.tatf.core.browser.IBrowser;

public class CrearTesterPO {

    private final IBrowser browser;

    private final String LinkCrearUsuario = "Crear usuario";
    private final String Nombre = "inputFirstName";
    private final String Apellido = "inputLastName";
    private final String Email = "inputEmail";
    private final String Pais = "inputCountry";
    private final String ContrasenaPorDefecto = "inputPassword";
    private final String TipoTester = "testerJunior";
    private final String BotonCrear = "btnRegister";
    private final String BotonConfirmar = "button.swal2-confirm.swal2-styled";
    private final String LinkVerUsuario = "Ver usuarios";
    private final String DatosUsuario = "//tr[td='Juan' and td='Sosa']";

    public CrearTesterPO(IBrowser browser) {
        this.browser = browser;
    }

    public void ClickCrearUsuario(){
        this.browser.find().link(LinkCrearUsuario).click();
    }

    public void IngresarNombre(String nombre){
        this.browser.find().name(Nombre).write(nombre);
    }

    public void IngresarApellido(String apellido){
        this.browser.find().name(Apellido).write(apellido);

    }

    public void IngresarEmail(String email){
        this.browser.find().name(Email).write(email);
    }

    public void IngresarPais(String pais){
        this.browser.find().name(Pais).write(pais);

    }

    public void IngresarContrasenaPorDefecto(String contrasenaPorDefecto){
        this.browser.find().name(ContrasenaPorDefecto).write(contrasenaPorDefecto);

    }

    public void SeleccionarTester(String tester){
        this.browser.find().id(TipoTester).write(tester);

    }

    public void ClickBotonCrear(){
        this.browser.find().id(BotonCrear).click();
    }

    public void EsperarMensajeConfirmacion(){
        this.browser.wait(BotonConfirmar);
    }

    public void ClickConfirmar(){
        this.browser.find().css(BotonConfirmar).click();
    }

    public void EntrarVerUsuarios(){
        this.browser.find().link(LinkVerUsuario).click();
    }

    public boolean TesterCreado(){
        return !this.browser.find().xpathList(DatosUsuario).isEmpty();
    }
}
