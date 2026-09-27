package PrimerosScripts2.escenarios.EliminarCuentaTester.test;

import PrimerosScripts2.escenarios.EliminarCuentaTester.data.EliminarCuentaTesterData;
import PrimerosScripts2.escenarios.EliminarCuentaTester.task.EliminarCuentaTesterTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import com.tatf.core.browser.IBrowser;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class EliminarCuentaTesterTest extends BaseTest{

    @Test
    @DisplayName("Eliminar cuenta Tester correctamente")
    public void eliminarTesterTest() {

        EliminarCuentaTesterTask eliminarTester =
                new EliminarCuentaTesterTask(browser);

        eliminarTester.accederAlSistema(
                url,
                EliminarCuentaTesterData.ClaveAcceso
        );


        eliminarTester.registrarAdministrador(
                EliminarCuentaTesterData.Nombre,
                EliminarCuentaTesterData.Apellido,
                EliminarCuentaTesterData.Email,
                EliminarCuentaTesterData.Contrasena,
                EliminarCuentaTesterData.RepetirContrasena,
                EliminarCuentaTesterData.Pais
        );

        eliminarTester.iniciarSesion(
                EliminarCuentaTesterData.Email,
                EliminarCuentaTesterData.Contrasena
        );

        eliminarTester.verificarUsuarioAccedido(
                EliminarCuentaTesterData.NombreAutenticado
        );


        eliminarTester.crearTester(
                EliminarCuentaTesterData.NombreTester,
                EliminarCuentaTesterData.ApellidoTester,
                EliminarCuentaTesterData.EmailTester,
                EliminarCuentaTesterData.PaisTester,
                EliminarCuentaTesterData.ContrasenaPorDefecto,
                EliminarCuentaTesterData.TipoTester
        );

        eliminarTester.verificarDatosTester(
                EliminarCuentaTesterData.NombreTester,
                EliminarCuentaTesterData.ApellidoTester,
                EliminarCuentaTesterData.EmailTester,
                EliminarCuentaTesterData.PaisTester,
                EliminarCuentaTesterData.TipoTester
        );

        eliminarTester.eliminarTester();

        eliminarTester.verificarTesterEliminado();
    }
}

