import { useState } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export interface OrderWithUser {
  id: string;
  date: string;
  userEmail: string;
  userName: string;
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

interface AllOrdersPageProps {
  orders: OrderWithUser[];
  onBack: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderWithUser['status']) => void;
}

export function AllOrdersPage({ orders, onBack, onUpdateOrderStatus }: AllOrdersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderWithUser['status']>('all');

  const getStatusInfo = (status: OrderWithUser['status']) => {
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

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600">Tổng số: {orders.length} đơn hàng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-100">
            <p className="text-sm text-yellow-800 mb-1">Chờ xác nhận</p>
            <p className="text-2xl font-bold text-yellow-900">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <p className="text-sm text-blue-800 mb-1">Đang xử lý</p>
            <p className="text-2xl font-bold text-blue-900">
              {orders.filter(o => o.status === 'processing').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-100">
            <p className="text-sm text-green-800 mb-1">Doanh thu</p>
            <p className="text-2xl font-bold text-green-900">
              {(totalRevenue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div>
                          <p className="text-sm text-gray-500">Mã đơn hàng</p>
                          <p className="font-semibold text-gray-900">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Khách hàng</p>
                          <p className="font-semibold text-gray-900">{order.userName}</p>
                          <p className="text-xs text-gray-500">{order.userEmail}</p>
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
                      
                      <div className="flex items-center gap-3">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderWithUser['status'])}
                          className={`px-4 py-2 rounded-lg border font-semibold text-sm outline-none ${statusInfo.color}`}
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Info */}
                  <div className="p-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Items */}
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-4">Sản phẩm</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-3 border-b last:border-0">
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
                                  <span>SL: {item.quantity}</span>
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
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Thông tin giao hàng</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">SĐT:</span>
                            <span className="ml-2 font-medium text-gray-900">{order.shippingInfo.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Địa chỉ:</span>
                            <p className="font-medium text-gray-900 mt-1">
                              {order.shippingInfo.ward}, {order.shippingInfo.district}, {order.shippingInfo.city}
                            </p>
                          </div>
                        </div>
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
