package PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.task;

import com.tatf.core.browser.IBrowser;
import com.tatf.core.verification.IVerify;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.InicioDeSesion.pom.InicioDeSesionPO;

public class InicioDeSesionTask {

    private final IBrowser browser;
    private final InicioDeSesionPO inicioSesion;

    public InicioDeSesionTask(IBrowser browser) {
        this.browser = browser;
        this.inicioSesion = new InicioDeSesionPO(this.browser);
    }

    public void inicioSesion(String email, String contrasena) {

        this.inicioSesion.clickIniciarSesion();
        this.inicioSesion.IngresarEmail(email);
        this.inicioSesion.IngresarContrasena(contrasena);
        this.inicioSesion.clickIngresar();
        this.inicioSesion.esperarMensajeInicioSesion();
        this.inicioSesion.clickConfirmar();

        this.browser.wait(2).sleep();
        this.inicioSesion.esperarPaginaPrincipal();
    }

    public void verificarUsuarioAccedido(String nombreUsuario) {
        IVerify.create().verifyTrue(
                this.inicioSesion.UsuarioAccedido(nombreUsuario),
                "No se muestra el nombre de usuario accedido."
        );
    }
}

