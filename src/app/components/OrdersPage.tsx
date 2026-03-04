import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface Order {
  id: string;
  date: string;
  items: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingInfo: {
    phone: string;
    city: string;
    district: string;
    ward: string;
  };
}

interface OrdersPageProps {
  orders: Order[];
  onBack: () => void;
}

export function OrdersPage({ orders, onBack }: OrdersPageProps) {
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Chờ xác nhận',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      case 'processing':
        return {
          icon: Package,
          text: 'Đang xử lý',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Hoàn thành',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          text: 'Đã hủy',
          color: 'text-red-600 bg-red-50 border-red-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn Hàng Của Tôi</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-gray-600 mb-6">Bạn chưa đặt đơn hàng nào</p>
            <button
              onClick={onBack}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-500">Mã đơn hàng</p>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ngày đặt</p>
                        <p className="font-semibold text-gray-900">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tổng tiền</p>
                        <p className="font-semibold text-amber-600">
                          {order.total.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{statusInfo.text}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Số lượng: {item.quantity}</span>
                              <span className="font-semibold text-amber-600">
                                {item.price.toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Thông tin giao hàng</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Số điện thoại: {order.shippingInfo.phone}</p>
                        <p>
                          Địa chỉ: {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
