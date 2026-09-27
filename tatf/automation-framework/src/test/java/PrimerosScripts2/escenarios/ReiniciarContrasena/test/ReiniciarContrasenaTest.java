package PrimerosScripts2.escenarios.ReiniciarContrasena.test;

import PrimerosScripts2.escenarios.ReiniciarContrasena.data.ReiniciarContrasenaData;
import PrimerosScripts2.escenarios.ReiniciarContrasena.task.ReiniciarContrasenaTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class ReiniciarContrasenaTest extends BaseTest {

    private ReiniciarContrasenaTask reiniciarContrasena;

    @BeforeEach
    public void configurar() {
        this.reiniciarContrasena = new ReiniciarContrasenaTask(browser);
    }

    @Test
    @DisplayName("Reiniciar contraseña de nuestro usuario creado anteriormente")
    public void reiniciarContrasenaTest() {

        this.reiniciarContrasena.accederAlSistema(
                url,
                ReiniciarContrasenaData.ClaveAcceso);

        this.reiniciarContrasena.registrarAdministrador(
                ReiniciarContrasenaData.Nombre,
                ReiniciarContrasenaData.Apellido,
                ReiniciarContrasenaData.Email,
                ReiniciarContrasenaData.Contrasena,
                ReiniciarContrasenaData.RepetirContrasena,
                ReiniciarContrasenaData.Pais
        );

        this.reiniciarContrasena.reiniciarContrasena(
                ReiniciarContrasenaData.Email,
                ReiniciarContrasenaData.Contrasena2,
                ReiniciarContrasenaData.RepetirContrasena2
        );

        this.reiniciarContrasena.iniciarSesion(
                ReiniciarContrasenaData.Email,
                ReiniciarContrasenaData.Contrasena2
        );

        this.reiniciarContrasena.verificarUsuarioAccedido(
                ReiniciarContrasenaData.NombreAutenticado);
    }
}
