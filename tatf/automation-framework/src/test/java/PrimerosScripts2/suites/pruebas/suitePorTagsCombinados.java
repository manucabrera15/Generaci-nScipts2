package PrimerosScripts2.suites.pruebas;

import org.junit.platform.suite.api.*;

@Suite
@SelectPackages("PrimerosScripts2.escenarios.CrearCuentaTester.test")
@IncludeTags("Prueba")
@ExcludeTags("Automatizacion")
@IncludeClassNamePatterns(".*Test")
public class suitePorTagsCombinados {
}
