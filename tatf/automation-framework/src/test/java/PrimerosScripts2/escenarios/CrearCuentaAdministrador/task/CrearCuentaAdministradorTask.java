package PrimerosScripts2.escenarios.CrearCuentaAdministrador.task;

import PrimerosScripts2.escenarios.FuncionesAuxiliares.AccesoAlSitioWeb.task.AccesoAlSitioWebTask;
//import PrimerosScripts2.escenarios.CrearCuentaAdministrador.data.CrearCuentaAdministradorData;
import PrimerosScripts2.escenarios.CrearCuentaAdministrador.pom.CrearCuentaAdministradorPO;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.task.InicioDeSesionTask;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.task.RegistroTask;
import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;

public class CrearCuentaAdministradorTask {

    private final CrearCuentaAdministradorPO crearCuentaAdministradorPO;
    private final IVerify verify;
    private final IBrowser browser;
    private final AccesoAlSitioWebTask accesoAlSitioWeb;
    private final RegistroTask registro;
    private final InicioDeSesionTask incioDeSesion;

    public CrearCuentaAdministradorTask(IBrowser browser) {
        this.browser = browser;
        this.crearCuentaAdministradorPO = new CrearCuentaAdministradorPO(this.browser);
        this.verify = IVerify.create();
        this.accesoAlSitioWeb = new AccesoAlSitioWebTask(this.browser);
        this.registro = new RegistroTask(this.browser);
        this.incioDeSesion = new InicioDeSesionTask(this.browser);
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
        this.incioDeSesion.inicioSesion(email,contrasena);
    }


    public void IngresarVerUsuarios(){
        this.crearCuentaAdministradorPO.ClickVerUsuario();
        this.browser.wait(2).sleep();
    }

    public void verificarUsuarioEnLista(String nombreUsuario) {
        this.verify.verify( true,
                this.crearCuentaAdministradorPO.UsuarioEnLista(nombreUsuario),
                "El usuario no fue creado correctamente.");
    }


}
