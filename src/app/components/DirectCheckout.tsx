import { useState } from 'react';
import { ArrowLeft, CheckCircle, Truck } from 'lucide-react';
import { Product } from './ProductCard';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface DirectCheckoutProps {
  product: Product;
  quantity: number;
  onBack: () => void;
  onComplete: (orderInfo: { phone: string; city: string; district: string; ward: string }) => void;
}

export function DirectCheckout({ product, quantity, onBack, onComplete }: DirectCheckoutProps) {
  const [step, setStep] = useState<'info' | 'success'>('info');
  const [formData, setFormData] = useState({
    phone: '',
    city: '',
    district: '',
    ward: '',
  });

  const subtotal = product.price * quantity;
  const shipping = subtotal > 5000000 ? 0 : 200000;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-gray-900">#DH{Date.now().toString().slice(-8)}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="w-6 h-6 text-amber-600" />
                Thông tin giao hàng
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
                    placeholder="0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
                    placeholder="VD: Hồ Chí Minh"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <input
                    type="text"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
                    placeholder="VD: Quận 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xã/Phường *
                  </label>
                  <input
                    type="text"
                    name="ward"
                    required
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none"
                    placeholder="VD: Phường Bến Nghé"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Chúng tôi sẽ liên hệ với bạn qua số điện thoại để xác nhận đơn hàng và địa chỉ giao hàng chi tiết.
                </p>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-semibold transition-colors"
              >
                Hoàn tất đơn hàng
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn hàng</h2>
              
              <div className="mb-4 pb-4 border-b">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 mb-1">{product.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {quantity}</p>
                    <p className="text-sm text-amber-600 font-semibold mt-1">
                      {product.price.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">Miễn phí</span>
                    ) : (
                      `${shipping.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-amber-600">{total.toLocaleString('vi-VN')}₫</span>
              </div>

              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  ✓ Thanh toán khi nhận hàng (COD)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}