import { Search, Menu, User, LogOut, Settings, ShieldCheck, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';
import { User as UserType } from './AccountPage';

interface HeaderProps {
  user: UserType | null;
  cartCount: number;
  onLogoClick: () => void;
  onProductsClick: () => void;
  onCartClick: () => void;
  onAccountClick: () => void;
  onAdminClick: () => void;
  onOrdersClick: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function Header({ user, cartCount, onLogoClick, onProductsClick, onCartClick, onAccountClick, onAdminClick, onOrdersClick, onLogout, onLoginClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">NoiThat.vn</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={onLogoClick}
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              Trang chủ
            </button>
            <button
              onClick={onProductsClick}
              className="text-gray-700 hover:text-amber-600 transition-colors"
            >
              Sản phẩm
            </button>
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">
              Về chúng tôi
            </a>
            <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">
              Liên hệ
            </a>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-700 hover:text-amber-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Shopping Cart - Always visible */}
            {user && !user.isAdmin && (
              <button 
                onClick={onCartClick}
                className="relative p-2 text-gray-700 hover:text-amber-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            
            {/* User Account */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="hidden md:block font-medium text-gray-900">{user.name}</span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.isAdmin && (
                          <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          onAccountClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Quản lý tài khoản</span>
                      </button>

                      {!user.isAdmin && (
                        <button
                          onClick={() => {
                            onOrdersClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Đơn hàng của tôi</span>
                        </button>
                      )}

                      {user.isAdmin && (
                        <button
                          onClick={() => {
                            onAdminClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">Quản lý sản phẩm</span>
                        </button>
                      )}

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Đăng nhập
              </button>
            )}
            
            <button className="md:hidden p-2 text-gray-700 hover:text-amber-600 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}