# vigil-reporter-ts

**Vigil Reporter for Node written in TypeScript. Used in pair with Vigil**

Vigil Reporter is used to actively submit health information to Vigil from your apps. 
Apps are best monitored via application probes, which are able to report detailed system
information such as CPU and RAM load. This lets Vigil show if an application host system 
is under high load.

## How to install?

Include `vigil-reporter-ts` in your `package.json` dependencies.

Alternatively, you can install it via the package manager cli.

```shell script
$ npm i ts-vigil-reporter
// Or if you prefer Yarn 
$ yarn add ts-vigil-reporter
```

## How to use?

### 1. Create reporter

`vigil-reporter` can be instantiated as such:

```typescript
import Vigil from "ts-vigil-reporter";

const client: Vigil = new Vigil({
    url: 'https://status.example.com',  // `page_url` from Vigil `config.cfg`
    token: 'YOUR_SECRET_TOKEN',         // `reporter_token` from Vigil `config.cfg`
    probe: 'relay',                     // Probe ID containing the parent Node for Replica
    node: 'socket-client',              // Node ID containing Replica
    replica: '10.44.0.5',               // Unique Replica ID for instance. Default REPLICA_MODE_HOSTNAME. **Optional**
    interval: 30,                       // Reporting interval. Default 30. **Optional**
    debug: false,                       // Enable console.log debug. Default false. **Optional**
    timeout: 10,                        // Timeout connecting Vigil server. Default 10. **Optional**                    
    headers: {'X-Proxy-Auth': '1234'}   // Custom HTTP headers to be sent Vigil. Default {}. **Optional**
});
```

You can also use `REPLICA_MODE_IP` or `REPLICA_MODE_HOSTNAME` as `replica` value.
This will make your replica id always be your IP or Hostname.

For better details, please see the `Options.ts` [interface](src/Options.ts).

### 2. Teardown reporter

If you need to teardown an active reporter, you can use the `end(options)` method to unbind it (`options` is optional).

```typescript
client.end(/* flush: boolean */);
```

## What is Vigil?

**Wondering what Vigil is?** Check out **[valeriansaliou/vigil](https://github.com/valeriansaliou/vigil)**
