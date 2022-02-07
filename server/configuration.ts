function getEnv(key: string) {
  const env = process.env[key];
  if (!env) {
    throw new Error(`Missing .env variable ${key}`);
  }
  return env;
}

export enum ENV {
  LOCAL = "",
  PROD = "PROD_",
  TEST = "TEST_",
}

export default class Configuration {
  private static env = "";
  public static set SET_ENV(env: ENV) {
    this.env = env
  }
  public static get RPC_SERVER()            { return getEnv(`${this.env}RPC_SERVER`); }
  public static get USER_ADDRESS()          { return getEnv(`${this.env}USER_ADDRESS`); }
  public static get CONTRACT_CHAT_ADDRESS() { return getEnv(`${this.env}CONTRACT_CHAT_ADDRESS`); }
  public static get CONTRACT_GALAXY_ADDRESS() { return getEnv(`${this.env}CONTRACT_GALAXY_ADDRESS`); }
}
