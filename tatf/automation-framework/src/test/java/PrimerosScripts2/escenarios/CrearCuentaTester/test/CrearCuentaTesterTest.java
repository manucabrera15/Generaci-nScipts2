package PrimerosScripts2.escenarios.CrearCuentaTester.test;

import PrimerosScripts2.escenarios.CrearCuentaTester.data.CrearCuentaTesterData;
import PrimerosScripts2.escenarios.CrearCuentaTester.task.CrearCuentaTesterTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import com.tatf.core.browser.IBrowser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class CrearCuentaTesterTest extends BaseTest {

    @Test
    @DisplayName("Crear cuenta Tester correctamente")
    public void crearCuentaTesterTest() {

        CrearCuentaTesterTask crearCuentaTester =
                new CrearCuentaTesterTask(browser);

        crearCuentaTester.accederAlSistema(url,
                CrearCuentaTesterData.ClaveAcceso
        );

        crearCuentaTester.registrarAdministrador(
                CrearCuentaTesterData.Nombre,
                CrearCuentaTesterData.Apellido,
                CrearCuentaTesterData.Email,
                CrearCuentaTesterData.Contrasena,
                CrearCuentaTesterData.RepetirContrasena,
                CrearCuentaTesterData.Pais
        );

        crearCuentaTester.iniciarSesion(
                CrearCuentaTesterData.Email,
                CrearCuentaTesterData.Contrasena
        );

        crearCuentaTester.verificarUsuarioAccedido(
                CrearCuentaTesterData.NombreAutenticado
        );

        crearCuentaTester.crearTester(
                CrearCuentaTesterData.NombreTester,
                CrearCuentaTesterData.ApellidoTester,
                CrearCuentaTesterData.EmailTester,
                CrearCuentaTesterData.PaisTester,
                CrearCuentaTesterData.ContrasenaPorDefecto,
                CrearCuentaTesterData.TipoTester
        );

        crearCuentaTester.verificarDatosTester(
                CrearCuentaTesterData.NombreTester,
                CrearCuentaTesterData.ApellidoTester,
                CrearCuentaTesterData.EmailTester,
                CrearCuentaTesterData.PaisTester,
                CrearCuentaTesterData.TipoTester
        );
    }
}
