jest.mock('node:dns', () => ({
  setServers: jest.fn()
}));

jest.mock('dotenv', () => ({
  config: jest.fn(() => ({ parsed: {} }))
}));

const dns = require('node:dns');
const dotenv = require('dotenv');
const loadEnvironment = require('../src/config/env');

describe('Configuración del entorno y DNS', () => {
  const originalDnsServers = process.env.MONGODB_DNS_SERVERS;

  beforeEach(() => {
    jest.clearAllMocks();
    dotenv.config.mockReturnValue({ parsed: {} });
    delete process.env.MONGODB_DNS_SERVERS;
  });

  afterAll(() => {
    if (originalDnsServers === undefined) {
      delete process.env.MONGODB_DNS_SERVERS;
    } else {
      process.env.MONGODB_DNS_SERVERS = originalDnsServers;
    }
  });

  test('configura resolvers personalizados antes de iniciar el servidor', () => {
    process.env.MONGODB_DNS_SERVERS = '8.8.8.8, 8.8.4.4';

    loadEnvironment();

    expect(dns.setServers).toHaveBeenCalledWith(['8.8.8.8', '8.8.4.4']);
  });

  test('rechaza una dirección DNS inválida', () => {
    process.env.MONGODB_DNS_SERVERS = 'not-an-ip';

    expect(() => loadEnvironment()).toThrow(
      'MONGODB_DNS_SERVERS contiene una dirección inválida'
    );

    expect(dns.setServers).not.toHaveBeenCalled();
  });

  test('usa los DNS del sistema si no se configura una alternativa', () => {
    delete process.env.MONGODB_DNS_SERVERS;

    loadEnvironment();

    expect(dns.setServers).not.toHaveBeenCalled();
  });
});