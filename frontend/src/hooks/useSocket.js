import { useEffect } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const socket = io('http://localhost:5000');

export const useSocket = (onNewOrder, onLowStock) => {
  useEffect(() => {
    socket.on('newOrder', (data) => {
      toast.success(`New order ${data.orderNumber} - $${data.totalAmount}`);
      if (onNewOrder) onNewOrder(data);
    });
    socket.on('lowStock', (data) => {
      toast.error(`Low stock alert: ${data.name} (${data.stock} left)`);
      if (onLowStock) onLowStock(data);
    });
    return () => {
      socket.off('newOrder');
      socket.off('lowStock');
    };
  }, [onNewOrder, onLowStock]);
};