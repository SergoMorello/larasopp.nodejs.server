import Config from "./Config";
import Log from "./Log";

abstract class Core {
	protected config = new Config();
	protected log = new Log(this.config);

}

export default Core;