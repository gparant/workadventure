const RecordRTC = require('recordrtc');
const bytesToSize = require('recordrtc');
const invokeSaveAsDialog = require('recordrtc');
const SocketIo = require('socket.io-client');
const Peer = require('simple-peer');

let socket = SocketIo('http://localhost:9000');
const userId = location.hash;
const videoConstraint: {width : any, height: any, facingMode : string} = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
};
const constraintsMedia : {audio : any, video : any} = {
    audio: true,
    video: videoConstraint
};

socket.emit("WEBRTC_ROOM", {userId: userId});

let StreamRemote : Map<string, MediaStream> = new Map<string, MediaStream>();

let addStream = (MediaStream : MediaStream) => {
    StreamRemote.set("test", MediaStream);
}

let PeerConnectionArray : any = new Peer({
    initiator: true,
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
    socket.emit("signal", {userId: userId, signal: data});
});

PeerConnectionArray.on('stream', (stream: MediaStream) => {
    console.log("stream", stream);

});

PeerConnectionArray.on('close', () => {
});

PeerConnectionArray.on('error', (err: any) => {
    console.error(`error =>  => ${err.code}`, err);
});

PeerConnectionArray.on('connect', () => {
    console.info(`connect =>`);
});

PeerConnectionArray.on('data',  (chunk: Buffer) => {
});

socket.on("signal", (data: any) => {
    PeerConnectionArray.signal(data);
});

import { Readable } from 'stream';
socket.on("stream", (data: any) => {
    console.log("receive stream", data);
});

setTimeout(() => {
    PeerConnectionArray.write(new Buffer('hey'));
}, 2000);


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(async function(stream) {
    let recorder = RecordRTC(stream, {
        type: 'video'
    });
    recorder.startRecording();

    const sleep = (m: any) => new Promise(r => setTimeout(r, m));
    await sleep(500);

    recorder.stopRecording(function() {
        let blob = recorder.getBlob();
        console.log('blob', blob);
        blob.arrayBuffer().then((data: ArrayBuffer) => {
            PeerConnectionArray.write(new Buffer(data));
        });
        invokeSaveAsDialog(blob);
    });

});