package PrimerosScripts2.escenarios.ReiniciarContrasena.task;

import PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.task.AccesoAlSitioWebTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.task.InicioDeSesionTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.task.RegistroTask;
import PrimerosScripts2.escenarios.ReiniciarContrasena.pom.ReiniciarContrasenaPO;
import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;

public class ReiniciarContrasenaTask {

    private final IBrowser browser;
    private final ReiniciarContrasenaPO reiniciarContrasena;

    private final AccesoAlSitioWebTask accesoAlSitioWeb;
    private final RegistroTask registro;
    private final InicioDeSesionTask inicioDeSesion;

    public ReiniciarContrasenaTask(IBrowser browser) {
        this.browser = browser;
        this.reiniciarContrasena = new ReiniciarContrasenaPO(this.browser);
        this.accesoAlSitioWeb = new AccesoAlSitioWebTask(this.browser);
        this.registro = new RegistroTask(this.browser);
        this.inicioDeSesion = new InicioDeSesionTask(this.browser);
    }

    public void accederAlSistema(String url, String claveAcceso) {
        this.accesoAlSitioWeb.entrarAlSistema(url, claveAcceso);
        this.accesoAlSitioWeb.verifyAccess();
    }

    public void registrarAdministrador(String nombre, String apellido,
                                       String email, String contrasena,
                                       String repetirContrasena,
                                       String paisNacimiento) {

        this.registro.registro(nombre, apellido, email, contrasena, repetirContrasena,
                paisNacimiento);

    }

    public void iniciarSesion(String email, String contrasena){

        this.inicioDeSesion.inicioSesion(email,contrasena);
    }

    public void verificarUsuarioAccedido(String nombreUsuario) {
        IVerify.create().verifyTrue(
                !this.browser.find()
                        .xpathList("//a[contains(normalize-space(), '" + nombreUsuario + "')]")
                        .isEmpty(),
                "No se muestra el nombre del usuario accedido."
        );
    }



    public void reiniciarContrasena(String email,
                                    String contrasena,
                                    String repetirContrasena) {

        this.reiniciarContrasena.ClickReiniciarContrasena();

        this.reiniciarContrasena.IngresarEmail(email);

        this.reiniciarContrasena.IngresarContrasena(contrasena);

        this.reiniciarContrasena.IngresarRepetirContrasena(repetirContrasena);

        this.reiniciarContrasena.ClickReiniciar();

        this.reiniciarContrasena.EsperarMensajeConfirmacion();

        this.reiniciarContrasena.ClickConfirmar();
    }
}

