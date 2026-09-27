package PrimerosScripts2.escenarios.CrearCuentaTester.task;

import PrimerosScripts2.escenarios.CrearCuentaTester.pom.CrearCuentaTesterPO;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.task.AccesoAlSitioWebTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.CrearTester.task.CrearTesterTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.task.InicioDeSesionTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.task.RegistroTask;
import com.tatf.core.browser.BrowserImpl;
import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;

public class CrearCuentaTesterTask {
    private final IBrowser browser;
    private final IVerify verify;
    private final AccesoAlSitioWebTask accesoAlSitioWeb;
    private final RegistroTask registro;
    private final InicioDeSesionTask inicioDeSesion;
    private final CrearTesterTask crearTester;
    private CrearCuentaTesterPO crearCuentaTesterPO;

    public CrearCuentaTesterTask(IBrowser browser) {

        this.browser = browser;
        this.verify = IVerify.create();
        this.accesoAlSitioWeb = new AccesoAlSitioWebTask(browser);
        this.registro = new RegistroTask(browser);
        this.inicioDeSesion = new InicioDeSesionTask(browser);
        this.crearTester = new CrearTesterTask(browser);
        this.crearCuentaTesterPO = new CrearCuentaTesterPO(this.browser);
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
                paisNacimiento
        );
    }

    public void iniciarSesion(String email, String contrasena) {

        this.inicioDeSesion.inicioSesion(email, contrasena);
    }

    public void verificarUsuarioAccedido(String nombreUsuario) {
        this.inicioDeSesion.verificarUsuarioAccedido(nombreUsuario);
    }

    public void crearTester(String nombre, String apellido,
                            String email, String pais,
                            String contrasenaPorDefecto,
                            String tester) {

        this.crearTester.crearTester(nombre, apellido, email, pais,
                contrasenaPorDefecto,
                tester
        );
    }

    public void verificarDatosTester(String nombre, String apellido,
                                     String email, String pais,
                                     String tipoTester) {

        this.crearTester.verificarTesterCreado();

        IVerify.create().verifyTrue(
                this.crearCuentaTesterPO.DatosTester(
                        nombre,
                        apellido,
                        email,
                        pais,
                        tipoTester
                ),
                "Los datos del tester no coinciden con los datos ingresados."
        );
    }
}

