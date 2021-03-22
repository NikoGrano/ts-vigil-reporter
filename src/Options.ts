/**
 *
 * Typescript Vigil Reporter — NOTICE OF LICENSE
 * This source file is released under MIT license by copyright holders.
 * Please see LICENSE file for more specific licensing terms.
 * @author Niko Granö <niko@granö.fi>
 *
 */

export default interface Options {
    /**
     * The URL of Vigil instance.
     * @example https://status.example.com
     */
    url: string

    /**
     * The Token for Vigil instance. Used for authentication.
     * @example 5D96D737DE3BE633909A2931330631BDB25C3F9B54357
     */
    token: string,

    /**
     * Probe ID containing the parent Node for Replica
     * @example relay
     */
    probe: string,

    /**
     * Node ID containing Replica
     * @example socket-client
     */
    node: string,

    /**
     * Unique Replica ID for instance. Defaults to hostname.
     * Other available options are custom string, mac, ip and hostname.
     * @example REPLICA_MODE_IP
     * @example replica-1
     * @example REPLICA_MODE_HOSTNAME
     */
    replica?: 'REPLICA_MODE_IP'|'REPLICA_MODE_HOSTNAME'|string,

    /**
     * Reporting interval. Default 30 seconds.
     * @example 60
     */
    interval?: number,

    /**
     * Output all actions to console.
     * @example false
     */
    debug?: boolean,

    /**
     * Timeout to send request to the Vigil server in ms.
     * @example 10000
     */
    timeout?: number;

    /**
     * Headers to set into all Vigil requests. Will be merged.
     * @example {'Custom-Header': 'value'}
     */
    headers?: object;
};
