// Setup mínimo para Jest sin dependencias complejas

// Mock global de alert
global.alert = jest.fn();

// Mock de console para evitar spam en tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});