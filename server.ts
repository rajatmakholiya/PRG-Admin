// server.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { getOrdersDbConnection } from './src/lib/mongodb';
import { IOrder } from './src/models/Order';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: `http://${hostname}:${port}`,
      methods: ['GET', 'POST'],
    },
  });

  try {
    const connection = await getOrdersDbConnection();

    const changeStream = connection.collection('orders').watch();

    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        const newOrder: IOrder = change.fullDocument as IOrder;
        console.log('New order detected:', newOrder._id);
        io.emit('new-order', newOrder);
      }
    });

    console.log('MongoDB change stream is now watching the "orders" collection.');

  } catch (error) {
    console.error('Failed to set up MongoDB change stream:', error);
    process.exit(1);
  }
  // --- End of Change Stream Setup ---

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});