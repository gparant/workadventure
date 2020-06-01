import socketIO = require('socket.io');
import {Socket} from "socket.io";
import * as http from "http";

const Peer = require('simple-peer');
const wrtc = require('wrtc');

export enum SockerIoEvent {
    CONNECTION = "connection",
    WEBRTC_ROOM = "WEBRTC_ROOM",
}

export class IoSocketController {
    Io: socketIO.Server;
    private PeerConnectionMap: Map<string, any> = new Map<string, any>();
    private StreamRemote : Map<string, MediaStream> = new Map<string, MediaStream>();

    constructor(server: http.Server) {
        this.Io = socketIO(server);
        this.ioConnection();
    }

    ioConnection() {
        this.Io.on(SockerIoEvent.CONNECTION, (socket: Socket) => {

            socket.on(SockerIoEvent.WEBRTC_ROOM, (data: any): void => {

                socket.join("webrtc");

                //create new peerConnexion
                let peer : any = new Peer({
                    initiator: false,
                    wrtc: wrtc,
                    reconnectTimer: 10000,
                    config: {
                        iceServers: [
                            {
                                urls: 'stun:stun.l.google.com:19302'
                            },
                            {
                                urls: 'turn:numb.viagenie.ca',
                                username: 'g.parant@thecodingmachine.com',
                                credential: 'itcugcOHxle9Acqi$'
                            },
                        ]
                    },
                });
                this.PeerConnectionMap.set(data.userId, peer);

                //start listen signal for the peer connection
                this.PeerConnectionMap.get(data.userId).on('signal', (data: any) => {
                    this.sendWebrtcSignal(socket, data);
                });

                this.PeerConnectionMap.get(data.userId).on('stream', (streamPeerConnexion: MediaStream) => {
                    console.info("stream", streamPeerConnexion);
                    this.StreamRemote.set(data.userId, streamPeerConnexion);
                    socket.broadcast.emit("stream", {userId: data.userId, stream: streamPeerConnexion});
                });

                /*this.PeerConnectionMap.get(data.userId).on('track', (track: MediaStreamTrack, stream: MediaStream) => {
                    this.stream(data.userId, stream);
                });*/

                this.PeerConnectionMap.get(data.userId).on('close', () => {
                    console.log("close connection");
                });

                this.PeerConnectionMap.get(data.userId).on('error', (err: any) => {
                    console.error(`error => ${data.userId} => ${err.code}`, err);
                });

                this.PeerConnectionMap.get(data.userId).on('connect', () => {
                    console.info(`connect => ${data.userId}`);
                });

                this.PeerConnectionMap.get(data.userId).on('data',  (chunk: Buffer) => {
                    // sending to all clients except sender
                    socket.broadcast.emit('stream', chunk);
                });
            });

            socket.on('signal', (data: any) => {
                this.PeerConnectionMap.get(data.userId).signal(data.signal);
            });
        });

    }

    /**
     *
     * @param Socket
     * @param data
     */
    private sendWebrtcSignal(Socket: Socket, data: any) {
        try {
            Socket.emit("signal", data);
        }catch (e) {
            console.error(`sendWebrtcSignal => ${data.userId}`, data);
        }
    }
}