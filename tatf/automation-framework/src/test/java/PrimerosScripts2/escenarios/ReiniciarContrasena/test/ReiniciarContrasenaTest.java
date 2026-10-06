package PrimerosScripts2.escenarios.ReiniciarContrasena.test;

import PrimerosScripts2.escenarios.ReiniciarContrasena.task.ReiniciarContrasenaTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

public class ReiniciarContrasenaTest extends BaseTest {

    private ReiniciarContrasenaTask reiniciarContrasena;

    @BeforeEach
    public void configurar() {
        this.reiniciarContrasena = new ReiniciarContrasenaTask(browser);
    }

    @ParameterizedTest(name = "{arguments}")
    @CsvFileSource(resources = "/ReiniciarContrasena.csv",
            useHeadersInDisplayName = true)
    @DisplayName("Reiniciar contraseña de nuestro usuario creado anteriormente")
    public void reiniciarContrasenaTest(String ClaveAcceso, String Nombre,
                                        String Apellido, String Email, String Contrasena,
                                        String RepetirContrasena, String Pais,
                                        String NombreAutenticado, String Contrasena2,
                                        String RepetirContrasena2) {

        this.reiniciarContrasena.accederAlSistema(
                url,
                ClaveAcceso);

        this.reiniciarContrasena.registrarAdministrador(
                Nombre,
                Apellido,
                Email,
                Contrasena,
                RepetirContrasena,
                Pais
        );

        this.reiniciarContrasena.reiniciarContrasena(
                Email,
                Contrasena2,
                RepetirContrasena2
        );

        this.reiniciarContrasena.iniciarSesion(
                Email,
                Contrasena2
        );

        this.reiniciarContrasena.verificarUsuarioAccedido(
                NombreAutenticado);
    }
}
