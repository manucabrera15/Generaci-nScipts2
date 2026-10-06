package PrimerosScripts2.escenarios.EliminarCuentaTester.test;


import PrimerosScripts2.escenarios.EliminarCuentaTester.task.EliminarCuentaTesterTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import com.tatf.core.browser.IBrowser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;

public class EliminarCuentaTesterTest extends BaseTest{

    @ParameterizedTest (name = "{arguments}")
    @CsvFileSource(resources = "/EliminarCuentaTester.csv",
            useHeadersInDisplayName = true)
    @DisplayName("Eliminar cuenta Tester correctamente")
    public void eliminarTesterTest(String ClaveAcceso, String Nombre,
                                   String Apellido, String Email, String Contrasena,
                                   String RepetirContrasena, String Pais,
                                   String NombreAutenticado, String NombreTester,
                                   String ApellidoTester, String EmailTester,
                                   String PaisTester, String ContrasenaPorDefecto,
                                   String TipoTester) {

        EliminarCuentaTesterTask eliminarTester =
                new EliminarCuentaTesterTask(browser);

        eliminarTester.accederAlSistema(
                url,
                ClaveAcceso
        );


        eliminarTester.registrarAdministrador(
                Nombre,
                Apellido,
                Email,
                Contrasena,
                RepetirContrasena,
                Pais
        );

        eliminarTester.iniciarSesion(
                Email,
                Contrasena
        );

        eliminarTester.verificarUsuarioAccedido(
                NombreAutenticado
        );


        eliminarTester.crearTester(
                NombreTester,
                ApellidoTester,
                EmailTester,
                PaisTester,
                ContrasenaPorDefecto,
                TipoTester
        );

        eliminarTester.verificarDatosTester(
                NombreTester,
                ApellidoTester,
                EmailTester,
                PaisTester,
                TipoTester
        );

        eliminarTester.eliminarTester(
                EmailTester);

        eliminarTester.verificarTesterEliminado(
                NombreTester,
                ApellidoTester,
                EmailTester,
                PaisTester,
                TipoTester);
    }
}

