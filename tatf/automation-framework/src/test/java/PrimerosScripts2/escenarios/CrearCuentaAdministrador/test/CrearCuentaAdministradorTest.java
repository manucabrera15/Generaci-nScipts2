package PrimerosScripts2.escenarios.CrearCuentaAdministrador.test;

import PrimerosScripts2.escenarios.CrearCuentaAdministrador.data.CrearCuentaAdministradorData;
import PrimerosScripts2.escenarios.CrearCuentaAdministrador.task.CrearCuentaAdministradorTask;
import PrimerosScripts2.escenarios.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class CrearCuentaAdministradorTest extends BaseTest {

    private CrearCuentaAdministradorTask crearCuentaAdministrador;

    @BeforeEach
    public void configurar() {
        this.crearCuentaAdministrador =
                new CrearCuentaAdministradorTask(browser);
    }

    @Test
    @DisplayName("Crear cuenta administrador correctamente")
    public void crearCuentaAdministradorTest() {

        this.crearCuentaAdministrador.accederAlSistema(
                url,
                CrearCuentaAdministradorData.ClaveAcceso);

        this.crearCuentaAdministrador.registrarAdministrador(
                CrearCuentaAdministradorData.Nombre,
                CrearCuentaAdministradorData.Apellido,
                CrearCuentaAdministradorData.Email,
                CrearCuentaAdministradorData.Contrasena,
                CrearCuentaAdministradorData.RepetirContrasena,
                CrearCuentaAdministradorData.Pais);

        this.crearCuentaAdministrador.iniciarSesion(
                CrearCuentaAdministradorData.Email,
                CrearCuentaAdministradorData.Contrasena
        );

        this.crearCuentaAdministrador.IngresarVerUsuarios();

        this.crearCuentaAdministrador.verificarUsuarioEnLista(
                CrearCuentaAdministradorData.NombreAutenticado);
    }
}
