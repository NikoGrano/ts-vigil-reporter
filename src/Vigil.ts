/**
 *
 * Typescript Vigil Reporter — NOTICE OF LICENSE
 * This source file is released under MIT license by copyright holders.
 * Please see LICENSE file for more specific licensing terms.
 * @author Niko Granö <niko@granö.fi>
 *
 */
import Options from "./Options";
import os from 'os';
import v8 from 'v8';
import HttpClient from "./HttpClient";

export default class Vigil {
    private readonly client: HttpClient;
    private timeout: NodeJS.Timeout;
    private readonly options: Options;
    private ip: string;
    constructor(
        {
            url,
            node,
            probe,
            token,
            interval = 30,
            replica = 'REPLICA_MODE_HOSTNAME',
            debug = false,
            timeout = 10000,
            headers = {},
        }: Options
    ) {
        this.options = {url, node, probe, token, interval, replica, debug, timeout, headers};
        this.client = new HttpClient(this.options);
        this.timeout = setTimeout(() => {
            this.timeout = undefined;
            this.cycle();
        }, 10);
    }

    public end(flush: boolean = true): boolean {
        if (this.timeout !== undefined) {
            this.log('Shutting down Vigil!')
            clearTimeout(this.timeout);
            this.timeout = undefined;

            if (flush) {
                this.log('Flushing replica...');
                this.client.delete((s) => {
                    console.log(s ? 'Replica flushed!' : 'Failed to flush replica!');
                    return s;
                });
            }

            return true;
        }

        return false;
    }

    private cycle() {
        this.log('Scheduled poll request triggered!');
        this.poll(this.exec.bind(this));
    }

    private exec(status: boolean) {
        if (this.timeout === undefined) {
            const msg = status === true
                ? 'Scheduled next poll in ' + this.options.interval + ' seconds.'
                : 'Last request failed, scheduler next request in ' + this.options.interval / 2 + ' seconds.';
            this.log(msg);

            const timeout = status === true ? this.options.interval : this.options.interval / 2;
            this.timeout = setTimeout(() => {
                this.log('Executing next poll now.');
                this.timeout = undefined;
                this.cycle();
            }, timeout * 1000);
        }
    }

    private poll(next: (status: boolean) => void) {
        const heap = v8.getHeapStatistics();
        const data = {
            replica: this.replica(),
            interval: this.options.interval,
            load: {
                cpu: parseFloat(((os.loadavg()[0] || 0) / (os.cpus().length || 1)).toPrecision(2)),
                ram: parseFloat(((heap.total_heap_size || 0.0) / (heap.heap_size_limit || 1.0)).toPrecision(2))
            }
        }
        const payload = JSON.stringify(data);
        this.log('Built payload: ' + payload);
        this.client.post(payload, next);
    }

    private replica(): string {
        switch (this.options.replica) {
            case 'REPLICA_MODE_HOSTNAME':
                return os.hostname();
            case 'REPLICA_MODE_IP':
                return this.getIPAddress();
            default:
                return this.options.replica;
        }
    }

    private log(msg: string): void {
        if (this.options.debug) {
            console.log('Vigil DEBUG: '+ msg);
        }
    }

    private getIPAddress(): string {
        if (this.ip === undefined) {
            const interfaces = os.networkInterfaces();
            for (const devName in interfaces) {
                const iface = interfaces[devName];
                for (let i = 0; i < iface.length; i++) {
                    const alias = iface[i];
                    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                        this.ip = alias.address;
                        return this.ip;
                    }
                }
            }
            throw new Error('Could not get IP address. Please use other mode than REPLICA_MODE_IP!');
        }

        return this.ip;
    }
}

