package PrimerosScripts2.escenarios.EliminarCuentaTester.task;

import PrimerosScripts2.escenarios.CrearCuentaTester.task.CrearCuentaTesterTask;
import PrimerosScripts2.escenarios.EliminarCuentaTester.pom.EliminarCuentaTesterPO;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.task.AccesoAlSitioWebTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.task.InicioDeSesionTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.task.RegistroTask;
import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;

public class EliminarCuentaTesterTask {

    private final IBrowser browser;
    private final EliminarCuentaTesterPO eliminarTester;
    private final AccesoAlSitioWebTask accesoAlSitioWeb;
    private final RegistroTask registro;
    private final InicioDeSesionTask inicioDeSesion;
    private final CrearCuentaTesterTask crearCuentaTesterTask;


    public EliminarCuentaTesterTask(IBrowser browser) {
        this.browser = browser;
        this.eliminarTester = new EliminarCuentaTesterPO(this.browser);
        this.accesoAlSitioWeb = new AccesoAlSitioWebTask(browser);
        this.registro = new RegistroTask(browser);
        this.inicioDeSesion = new InicioDeSesionTask(browser);
        this.crearCuentaTesterTask = new CrearCuentaTesterTask(this.browser);
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

        this.crearCuentaTesterTask.crearTester(nombre, apellido, email, pais,
                contrasenaPorDefecto,
                tester
        );
    }

    public void verificarDatosTester(String nombre, String apellido,
                                     String email, String pais,
                                     String tipoTester) {


        this.crearCuentaTesterTask.verificarDatosTester(
                nombre,
                apellido,
                email,
                pais,
                tipoTester
        );
    }

    public void eliminarTester(String email) {

        this.eliminarTester.clickEliminarTester(email);

        this.eliminarTester.esperarConfirmacion();
        this.eliminarTester.clickSi();

        this.eliminarTester.esperarConfirmacion();
        this.eliminarTester.clickSi();
    }

    public void verificarTesterEliminado(String nombre, String apellido, String email,
                                         String pais, String tipoTester) {

        IVerify.create().verifyTrue(
                this.eliminarTester.testerEliminado(nombre, apellido, email, pais, tipoTester),
                "Se verifica que el tester haya sido eliminado"
        );
    }
}
