package PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.task;

import com.tatf.core.browser.IBrowser;
import PrimerosScripts2.escenarios.FuncionesAuxiliares.Registro.pom.RegistroPO;

public class RegistroTask {

    private final IBrowser browser;
    private final RegistroPO registro;

    public RegistroTask(IBrowser browser) {
        this.browser = browser;
        this.registro = new RegistroPO(this.browser);
    }

    public void registro(String nombre, String apellido, String email,
                         String contrasena, String repetirContrasena,
                         String paisNacimiento) {

        this.registro.IngresarRegistro();
        this.registro.IngresarNombre(nombre);
        this.registro.IngresarApellido(apellido);
        this.registro.IngresarEmail(email);
        this.registro.IngresarContrasena(contrasena);
        this.registro.IngresarRepetirContrasena(repetirContrasena);
        this.registro.IngresarPais(paisNacimiento);
        this.registro.clickRegistrar();
        this.registro.esperarMensajeRegistro();
        this.registro.clickConfirmar();

        this.browser.wait(2).sleep();

        }
    }

