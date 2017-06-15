interface SocketConnectCallback {
  (err?: any): void;
}

interface SocketInfo {
  url: string;
  connected: boolean;
  connecting: boolean;
  pendingCallbacks: SocketConnectCallback[];
  socket?: WebSocket
}

export class TransportManager {
  private sockets: { [url: string]: SocketInfo } = {};

  connect(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let info = this.sockets[url];
      if (info) {
        if (info.connected) {
          resolve();
          return;
        }
        if (info.connecting) {
          info.pendingCallbacks.push((err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
          return;
        }
      }
      if (!info) {
        info = {
          url: url,
          connected: false,
          connecting: true,
          pendingCallbacks: []
        };
        this.sockets[url] = info;
      } else {
        info.connecting = true;
        info.pendingCallbacks = [];
      }
      info.pendingCallbacks.push((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
      this.connectSocket(info);
    });
  }

  private connectSocket(info: SocketInfo) {
    info.connecting = true;
    try {
      const socket = new WebSocket(info.url);
      socket.binaryType = "arraybuffer";
      info.socket = socket;
      socket.onopen = (event) => {
        if (socket.readyState === WebSocket.OPEN) {
          info.connecting = false;
          info.connected = true;
          try {
            for (const cb of info.pendingCallbacks) {
              cb();
            }
          } catch (err) {
            // noop
          }
        }
      };
      socket.onerror = (error) => {
        try {
          for (const cb of info.pendingCallbacks) {
            cb(error);
          }
        } catch (err) {
          // noop
        } finally {
          info.connected = false;
          info.connecting = false;
          info.pendingCallbacks = [];
        }
      };
      socket.onclose = (event) => {
        info.connected = false;
        info.connecting = false;
      };
      socket.onmessage = (event) => {
        // TODO: 
      };

    } catch (err) {
      try {
        for (const cb of info.pendingCallbacks) {
          cb(err);
        }
      } catch (err) {
        // noop
      } finally {
        info.connected = false;
        info.connecting = false;
        info.pendingCallbacks = [];
      }
    }
  }
}