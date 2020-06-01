import "jasmine";
import {SetPlayerDetailsMessage} from "../../front/src/Messages/SetPlayerDetailsMessage";
import {SockerIoEvent} from "../src/Controller/IoSocketController";
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const SocketIo = require('socket.io-client');

describe("PeerConnexion", () => {
    it("Test and create peer connexion", () => {

        const socket = SocketIo("http://localhost:9000");

        socket.emit(SockerIoEvent.WEBRTC_ROOM, JSON.stringify({userId: "test", data: "connect"}));
        socket.on('signal', (data: any) => {
            console.log('signal', data);
        });

        let PeerConnectionArray : any = new Peer({
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

        //start listen signal for the peer connection
        PeerConnectionArray.on('signal', (data: any) => {
            console.log('signal', data);
        });
    });
});
