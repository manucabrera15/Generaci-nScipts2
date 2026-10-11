package PrimerosScripts2.suites.pruebas;

import org.junit.platform.suite.api.IncludeTags;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import org.junit.platform.suite.api.SuiteDisplayName;

@Suite
@SuiteDisplayName("Suite por tag: EliminarCuentaTesterTest")
@SelectPackages("PrimerosScripts2.escenarios.EliminarCuentaTester.test")
@IncludeTags("Automatizacion")

public class suitePorTag {
}
