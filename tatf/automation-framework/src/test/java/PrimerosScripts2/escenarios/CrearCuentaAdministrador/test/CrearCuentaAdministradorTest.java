package PrimerosScripts2.escenarios.CrearCuentaAdministrador.test;

import PrimerosScripts2.escenarios.CrearCuentaAdministrador.task.CrearCuentaAdministradorTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;


public class CrearCuentaAdministradorTest extends BaseTest {

    private CrearCuentaAdministradorTask crearCuentaAdministrador;

    @BeforeEach
    public void configurar() {
        this.crearCuentaAdministrador =
                new CrearCuentaAdministradorTask(browser);
    }

    @ParameterizedTest(name = "{arguments}")
    @CsvFileSource(resources = "/CrearCuentaAdministrador.csv",
    useHeadersInDisplayName = true)

    @DisplayName("Crear cuenta administrador correctamente")
    public void crearCuentaAdministradorTest(String ClaveAcceso, String Nombre,
                                             String Apellido, String Email, String Contrasena,
                                             String RepetirContrasena, String Pais,
                                             String NombreAutenticado) {

        this.crearCuentaAdministrador.accederAlSistema(
                url,
                ClaveAcceso);

        this.crearCuentaAdministrador.registrarAdministrador(
                Nombre,
                Apellido,
                Email,
                Contrasena,
                RepetirContrasena,
                Pais);

        this.crearCuentaAdministrador.iniciarSesion(
                Email,
                Contrasena
        );

        this.crearCuentaAdministrador.IngresarVerUsuarios();

        this.crearCuentaAdministrador.verificarUsuarioEnLista(
                NombreAutenticado);
    }
}

