package PrimerosScripts2.escenarios.CrearCuentaTester.test;

import PrimerosScripts2.escenarios.CrearCuentaTester.task.CrearCuentaTesterTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import com.tatf.core.browser.IBrowser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

public class CrearCuentaTesterTest extends BaseTest {

    @ParameterizedTest(name = "{arguments}")
    @CsvFileSource(resources = "/CrearCuentaTester.csv",
            useHeadersInDisplayName = true)
    @DisplayName("Crear cuenta Tester correctamente")
    public void crearCuentaTesterTest(String ClaveAcceso, String Nombre,
                                      String Apellido, String Email, String Contrasena,
                                      String RepetirContrasena, String Pais,
                                      String NombreAutenticado, String NombreTester,
                                      String ApellidoTester, String EmailTester,
                                      String PaisTester, String ContrasenaPorDefecto,
                                      String TipoTester) {

        CrearCuentaTesterTask crearCuentaTester =
                new CrearCuentaTesterTask(browser);

        crearCuentaTester.accederAlSistema(url,
                ClaveAcceso
        );

        crearCuentaTester.registrarAdministrador(
                Nombre,
                Apellido,
                Email,
                Contrasena,
                RepetirContrasena,
                Pais
        );

        crearCuentaTester.iniciarSesion(
                Email,
                Contrasena
        );

        crearCuentaTester.verificarUsuarioAccedido(
                NombreAutenticado
        );

        crearCuentaTester.crearTester(
                NombreTester,
                ApellidoTester,
                EmailTester,
                PaisTester,
                ContrasenaPorDefecto,
                TipoTester
        );

        crearCuentaTester.verificarDatosTester(
                NombreTester,
                ApellidoTester,
                EmailTester,
                PaisTester,
                TipoTester
        );
    }
}
