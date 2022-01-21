export class Configuration {
    public get contractChatAddress(): string {
      if (!process.env['CONTRACT_CHAT_ADDRESS']) {
        throw new Error('Missing CONTRACT_CHAT_ADDRESS')
      }
      return process.env['CONTRACT_CHAT_ADDRESS']
    }
    public get rpcServer(): string {
        if (!process.env['RPC_SERVER']) {
          throw new Error('Missing RPC_SERVER')
        }
        return process.env['RPC_SERVER']
      }
  }
  