package PrimerosScripts2.escenarios.FuncionesAuxiliares.CrearTester.task;

import com.tatf.core.browser.IBrowser;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.CrearTester.pom.CrearTesterPO;
import com.tatf.core.verification.IVerify;

public class CrearTesterTask {
    private final IBrowser browser;
    private final CrearTesterPO crearTester;

    public CrearTesterTask(IBrowser browser) {
        this.browser = browser;
        this.crearTester = new CrearTesterPO(this.browser);
    }
    public void crearTester(String nombre, String apellido, String email,
                            String pais, String contrasenaPorDefecto,
                            String tester) {

        this.crearTester.ClickCrearUsuario();

        this.crearTester.IngresarNombre(nombre);
        this.crearTester.IngresarApellido(apellido);
        this.crearTester.IngresarEmail(email);
        this.crearTester.IngresarPais(pais);
        this.crearTester.IngresarContrasenaPorDefecto(contrasenaPorDefecto);
        this.crearTester.SeleccionarTester(tester);

        this.crearTester.ClickBotonCrear();

        this.crearTester.EsperarMensajeConfirmacion();
    }

    public void verificarTesterCreado() {

        this.crearTester.ClickConfirmar();

        this.crearTester.EntrarVerUsuarios();

        IVerify.create().verifyTrue(
                this.crearTester.TesterCreado(),
                "Se verifica que el tester haya sido creado correctamente."
        );
    }
}

