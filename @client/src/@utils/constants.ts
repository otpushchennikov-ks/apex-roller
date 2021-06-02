const productionWsHost = window.location.origin.replace(/^http/, 'ws');
const productionRestHost = `${window.location.origin}`;

export const wsHost = process.env.NODE_ENV === 'production' ? productionWsHost : 'ws://localhost:5000';
export const restHost = process.env.NODE_ENV === 'production' ? productionRestHost : 'http://localhost:5000';
