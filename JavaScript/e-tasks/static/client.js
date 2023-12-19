'use strict';

const transport = {};

transport.ws = (url, structure) => {
  const api = {};
  const socket = new WebSocket(url);
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);

    for (const methodName of methods) {
      api[serviceName][methodName] = (...args) => new Promise((resolve, reject) => {
        const packet = { name: serviceName, method: methodName, args };
        socket.onopen = () => socket.send(JSON.stringify(packet));
        socket.onmessage = (event) => resolve(JSON.parse(event.data));
        socket.onerror = (error) => reject(error);
      });
    }
  }
  return api;
}

transport.http = (url, structure) => {
  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);

    for (const methodName of methods) {

      api[serviceName][methodName] = (...args) => new Promise((resolve, reject) => {
        console.log({ args });
        fetch(`${url}/api/${serviceName}/${methodName}`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ args }),
        })
          .then((response) => { 
            const { status } = response;
            if (status !== 200) reject(new Error(status));
            resolve(response.json())
          })
          .catch((error) => reject("Server error: " + error));
      });
    }
  }
  return api;
};

function scaffold(url, structure) {
  return url.startsWith("ws") ? transport.ws(url, structure) : transport.http(url, structure);
}


(async () => {
  const api = scaffold(
    "http://localhost:8001",
    {
    user: {
      create: ['record'],
      read: ['id'],
      update: ['id', 'record'],
      delete: ['id'],
      find: ['mask'],
    },
    country: {
      read: ['id'],
      delete: ['id'],
      find: ['mask'],
    },
  });
  const data = await api.user.read(1);
  console.log(data);
})();