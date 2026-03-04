import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { HomePage } from '@/app/components/HomePage';
import { ProductDetail } from '@/app/components/ProductDetail';
import { ProductsPage } from '@/app/components/ProductsPage';
import { Cart, CartItem } from '@/app/components/Cart';
import { CartCheckout } from '@/app/components/CartCheckout';
import { DirectCheckout } from '@/app/components/DirectCheckout';
import { AuthModal } from '@/app/components/AuthModal';
import { AccountPage, User } from '@/app/components/AccountPage';
import { AdminPage } from '@/app/components/AdminPage';
import { OrdersPage, Order } from '@/app/components/OrdersPage';
import { AllOrdersPage, OrderWithUser } from '@/app/components/AllOrdersPage';
import { Product } from '@/app/components/ProductCard';

type Page = 'home' | 'products' | 'product' | 'cart' | 'checkout' | 'directCheckout' | 'account' | 'admin' | 'orders' | 'allOrders';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<OrderWithUser[]>([]);
  
  const [users, setUsers] = useState<User[]>([
    {
      email: 'admin@email.com',
      name: 'Admin',
      password: 'admin1',
      isAdmin: true
    }
  ]);

  // Sample products data with stock
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: 'Sofa Hiện Đại Luxury',
      price: 12500000,
      originalPrice: 15000000,
      image: 'https://images.unsplash.com/photo-1759722668253-1767030ad9b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzb2ZhJTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3Njk3NjYyMDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng khách',
      rating: 4.5,
      stock: 45
    },
    {
      id: 2,
      name: 'Bàn Ăn Gỗ Tự Nhiên',
      price: 8900000,
      originalPrice: 11000000,
      image: 'https://images.unsplash.com/photo-1758977403438-1b8546560d31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBkaW5pbmclMjB0YWJsZXxlbnwxfHx8fDE3Njk4NTAwMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng ăn',
      rating: 5.0,
      stock: 30
    },
    {
      id: 3,
      name: 'Giường Ngủ Cao Cấp',
      price: 15000000,
      image: 'https://images.unsplash.com/photo-1680503146454-04ac81a63550?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwZnVybml0dXJlJTIwYmVkfGVufDF8fHx8MTc2OTc1Nzk5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng ngủ',
      rating: 4.8,
      stock: 20
    },
    {
      id: 4,
      name: 'Bàn Làm Việc Ergonomic',
      price: 6500000,
      originalPrice: 7800000,
      image: 'https://images.unsplash.com/photo-1637762646936-29b68cd6670d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBkZXNrJTIwY2hhaXJ8ZW58MXx8fHwxNzY5ODUwMDMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng làm việc',
      rating: 4.6,
      stock: 50
    },
    {
      id: 5,
      name: 'Tủ Sách Gỗ Sồi',
      price: 5200000,
      image: 'https://images.unsplash.com/photo-1605972713797-0f20b224371c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc2hlbGYlMjBjYWJpbmV0fGVufDF8fHx8MTc2OTc4MTcwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng khách',
      rating: 4.7,
      stock: 15
    },
    {
      id: 6,
      name: 'Bàn Sofa Marble',
      price: 4800000,
      originalPrice: 6000000,
      image: 'https://images.unsplash.com/photo-1642657547271-722df15ce6d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjB0YWJsZSUyMG1vZGVybnxlbnwxfHx8fDE3Njk3OTYzMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Phòng khách',
      rating: 4.9,
      stock: 25
    }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      
      // Load cart for this user
      const savedCart = localStorage.getItem(`cart_${user.email}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }

      // Load orders for this user
      const savedOrders = localStorage.getItem(`orders_${user.email}`);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    }

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    // Load all orders (for admin)
    const savedAllOrders = localStorage.getItem('allOrders');
    if (savedAllOrders) {
      setAllOrders(JSON.parse(savedAllOrders));
    }
  }, []);

  // Save to localStorage when they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cartItems));
      localStorage.setItem(`orders_${currentUser.email}`, JSON.stringify(orders));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser, cartItems, orders]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
  }, [allOrders]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handleLogin = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setShowAuthModal(false);
      
      // Load cart and orders for this user
      const savedCart = localStorage.getItem(`cart_${user.email}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      
      const savedOrders = localStorage.getItem(`orders_${user.email}`);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      
      return true;
    }
    return false;
  };

  const handleRegister = (email: string, password: string, name: string): boolean => {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      email,
      name,
      password,
      isAdmin: false
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setShowAuthModal(false);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]);
    setOrders([]);
    setCurrentPage('home');
  };

  const handleAddToCart = (product: Product) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.isAdmin) {
      return; // Admin cannot add to cart
    }

    if (product.stock <= 0) {
      alert('Sản phẩm đã hết hàng');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Check stock before adding more
        if (existingItem.quantity >= product.stock) {
          alert('Không đủ hàng trong kho');
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const handleAddToCartWithQuantity = (product: Product, quantity: number) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (currentUser.isAdmin) {
      return; // Admin cannot add to cart
    }

    if (product.stock < quantity) {
      alert('Không đủ hàng trong kho');
      return;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          alert('Không đủ hàng trong kho');
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    if (!currentUser) {
      setShowAuthModal(true);
      setSelectedProduct(product);
      setCheckoutQuantity(quantity);
    } else {
      if (product.stock < quantity) {
        alert('Không đủ hàng trong kho');
        return;
      }
      setSelectedProduct(product);
      setCheckoutQuantity(quantity);
      setCurrentPage('directCheckout');
    }
  };

  const handleUpdateCartQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
      alert('Không đủ hàng trong kho');
      return;
    }

    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const handleCartCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Check stock for all items
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        alert(`Không đủ hàng cho sản phẩm: ${item.name}`);
        return;
      }
    }
    
    setCurrentPage('checkout');
  };

  const handleDirectCheckoutComplete = (orderInfo: { phone: string; city: string; district: string; ward: string }) => {
    if (!currentUser || !selectedProduct) return;

    // Check stock
    const product = products.find(p => p.id === selectedProduct.id);
    if (!product || product.stock < checkoutQuantity) {
      alert('Không đủ hàng trong kho');
      return;
    }

    const subtotal = selectedProduct.price * checkoutQuantity;
    const shipping = subtotal > 5000000 ? 0 : 200000;

    const newOrder: Order = {
      id: `#DH${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('vi-VN'),
      items: [{
        id: selectedProduct.id,
        name: selectedProduct.name,
        image: selectedProduct.image,
        price: selectedProduct.price,
        quantity: checkoutQuantity
      }],
      total: subtotal + shipping,
      status: 'pending',
      shippingInfo: orderInfo
    };

    const newOrderWithUser: OrderWithUser = {
      ...newOrder,
      userEmail: currentUser.email,
      userName: currentUser.name
    };

    setOrders([newOrder, ...orders]);
    setAllOrders([newOrderWithUser, ...allOrders]);

    // Update stock
    setProducts(products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, stock: p.stock - checkoutQuantity }
        : p
    ));
  };

  const handleCartCheckoutComplete = (orderInfo: { phone: string; city: string; district: string; ward: string }) => {
    if (!currentUser || cartItems.length === 0) return;

    // Check stock for all items
    for (const item of cartItems) {
      const product = products.find(p => p.id === item.id);
      if (!product || product.stock < item.quantity) {
        alert(`Không đủ hàng cho sản phẩm: ${item.name}`);
        return;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 5000000 ? 0 : 200000;

    const newOrder: Order = {
      id: `#DH${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('vi-VN'),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      })),
      total: subtotal + shipping,
      status: 'pending',
      shippingInfo: orderInfo
    };

    const newOrderWithUser: OrderWithUser = {
      ...newOrder,
      userEmail: currentUser.email,
      userName: currentUser.name
    };

    setOrders([newOrder, ...orders]);
    setAllOrders([newOrderWithUser, ...allOrders]);

    // Update stock for all items
    setProducts(prevProducts => 
      prevProducts.map(product => {
        const cartItem = cartItems.find(item => item.id === product.id);
        return cartItem 
          ? { ...product, stock: product.stock - cartItem.quantity }
          : product;
      })
    );

    setCartItems([]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.email === updatedUser.email ? updatedUser : u));
  };

  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(0, ...products.map(p => p.id)) + 1
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderWithUser['status']) => {
    setAllOrders(allOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
    
    // Also update in user's orders if it's theirs
    if (currentUser) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    }
  };

  // Auto-navigate to checkout after login if there's a pending purchase
  useEffect(() => {
    if (currentUser && showAuthModal) {
      setShowAuthModal(false);
      if (selectedProduct) {
        setCurrentPage('directCheckout');
      }
    }
  }, [currentUser, showAuthModal, selectedProduct]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={currentUser}
        cartCount={cartCount}
        onLogoClick={() => setCurrentPage('home')}
        onProductsClick={() => setCurrentPage('products')}
        onCartClick={() => setCurrentPage('cart')}
        onAccountClick={() => setCurrentPage('account')}
        onAdminClick={() => setCurrentPage('admin')}
        onOrdersClick={() => setCurrentPage('orders')}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuthModal(true)}
      />
      
      {currentPage === 'home' && (
        <HomePage
          products={products}
          onAddToCart={handleAddToCart}
          onBuyNow={(product) => handleBuyNow(product, 1)}
          onProductClick={handleProductClick}
        />
      )}

      {currentPage === 'products' && (
        <ProductsPage
          products={products}
          onAddToCart={handleAddToCart}
          onBuyNow={(product) => handleBuyNow(product, 1)}
          onProductClick={handleProductClick}
        />
      )}

      {currentPage === 'product' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onAddToCart={handleAddToCartWithQuantity}
          onBuyNow={handleBuyNow}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'cart' && (
        <Cart
          items={cartItems}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClose={() => setCurrentPage('home')}
          onCheckout={handleCartCheckout}
        />
      )}

      {currentPage === 'checkout' && (
        <CartCheckout
          items={cartItems}
          onBack={() => setCurrentPage('cart')}
          onComplete={handleCartCheckoutComplete}
        />
      )}

      {currentPage === 'directCheckout' && selectedProduct && currentUser && (
        <DirectCheckout
          product={selectedProduct}
          quantity={checkoutQuantity}
          onBack={() => setCurrentPage('product')}
          onComplete={handleDirectCheckoutComplete}
        />
      )}

      {currentPage === 'account' && currentUser && (
        <AccountPage
          user={currentUser}
          onUpdateUser={handleUpdateUser}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'admin' && currentUser && currentUser.isAdmin && (
        <AdminPage
          products={products}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onBack={() => setCurrentPage('home')}
          onViewOrders={() => setCurrentPage('allOrders')}
        />
      )}

      {currentPage === 'orders' && currentUser && (
        <OrdersPage
          orders={orders}
          onBack={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'allOrders' && currentUser && currentUser.isAdmin && (
        <AllOrdersPage
          orders={allOrders}
          onBack={() => setCurrentPage('admin')}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className="text-xl font-bold">NoiThat.vn</span>
              </div>
              <p className="text-gray-400 text-sm">
                Cung cấp đồ nội thất cao cấp cho ngôi nhà của bạn
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Phòng khách</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Phòng ngủ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Phòng ăn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Phòng làm việc</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảo hành</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Giao hàng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Thanh toán</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: contact@noithat.vn</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 NoiThat.vn. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}