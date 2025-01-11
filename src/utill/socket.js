const io = require('socket.io-client');
const env = require('../../env.json')
class WebSocketClient {
  constructor() {
    this.url = env.SOCKET_URL;
    this.socket = null;
    this.onConnectPromise = null;
    this.onConnectResolve = null;
  }

  // Kết nối tới WebSocket server với xác thực JWT
  async connect() {
    this.onConnectPromise = new Promise((resolve) => {
      this.onConnectResolve = resolve;
    });

    this.socket = io(this.url, {
      path: env.SOCKET_PATH,
      extraHeaders: {
        authorization: env.JWT_TOKEN
      }
    });

    this.socket.on('connect', () => {
      console.log(`Connected to server ${new Date()}`);
      this.onConnectResolve(); // Giải quyết promise khi kết nối thành công
    });

    this.socket.on('room_created', (data) => {
      console.log('Joined room:', data.room);
      this.room = data.room;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error connect server:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket server disconnect');
    });

    this.socket.on('error', (error) => {
      console.error('Error WebSocket:', error);
      process.exit(1);
    });

    // Đợi cho đến khi kết nối mở hoàn toàn
    await this.onConnectPromise;
  }

  // Gửi tin nhắn tới server
  async send(event, message) {
    if (this.socket && this.socket.connected) {
      return new Promise((resolve, reject) => {
        this.socket.emit(event, message, (ack) => {
          if (ack instanceof Error) {
            reject(ack);
          } else {
            resolve();
          }
        });
      });
    }
    throw new Error();
  }

  // Đóng kết nối WebSocket
  // eslint-disable-next-line consistent-return
  async close() {
    if (this.socket) {
      return new Promise((resolve) => {
        this.socket.disconnect();
        resolve();
      });
    }
  }

  // Lắng nghe các sự kiện từ server
  async on(event, callback) {
    try {
      if (this.socket) {
        this.socket.on(event, callback);
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = WebSocketClient;
