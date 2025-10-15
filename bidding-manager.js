class BiddingManager {
  constructor() {
    this.productsRef = database.ref('products');
    this.usersRef = database.ref('users');
    this.currentUser = null;
    this.products = [];
    
    // 初始化数据监听
    this.initDataListeners();
  }
  
  // 初始化数据监听
  initDataListeners() {
    // 监听产品数据变化
    this.productsRef.on('value', (snapshot) => {
      const productsData = snapshot.val();
      if (productsData) {
        this.products = Object.keys(productsData).map(key => ({
          id: key,
          ...productsData[key]
        }));
        this.renderProducts();
      }
    });
  }
  
  // 用户登录
  async login(username, password) {
    // 在实际应用中，这里应该有真正的身份验证
    // 这里我们模拟登录
    const userId = 'user_' + Date.now();
    
    this.currentUser = {
      id: userId,
      username: username
    };
    
    // 保存用户信息到数据库
    await this.usersRef.child(userId).set({
      username: username,
      lastLogin: new Date().toISOString()
    });
    
    return this.currentUser;
  }
  
  // 用户登出
  logout() {
    this.currentUser = null;
  }
  
  // 提交竞价
  async placeBid(productId, bidAmount) {
    if (!this.currentUser) {
      throw new Error('请先登录');
    }
    
    const productRef = this.productsRef.child(productId);
    const productSnapshot = await productRef.once('value');
    const product = productSnapshot.val();
    
    if (!product) {
      throw new Error('商品不存在');
    }
    
    // 验证竞价
    if (bidAmount <= product.currentPrice) {
      throw new Error(`竞价必须高于当前价格 ¥${product.currentPrice}`);
    }
    
    if (bidAmount - product.currentPrice < product.minIncrement) {
      throw new Error(`加价必须至少为 ¥${product.minIncrement}`);
    }
    
    // 更新竞价
    await productRef.update({
      currentPrice: bidAmount,
      currentBidder: this.currentUser.username,
      currentBidderId: this.currentUser.id,
      lastBidTime: new Date().toISOString()
    });
    
    // 记录竞价历史
    const bidHistoryRef = database.ref('bidHistory').push();
    await bidHistoryRef.set({
      productId: productId,
      productName: product.name,
      bidderId: this.currentUser.id,
      bidderName: this.currentUser.username,
      bidAmount: bidAmount,
      bidTime: new Date().toISOString()
    });
    
    return true;
  }
  
  // 渲染产品列表
  renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    this.products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">${this.getProductImage(product.id)}</div>
        <div class="product-details">
          <div class="product-name">${product.name}</div>
          <div class="product-price">¥${product.currentPrice.toLocaleString()}</div>
          <div class="product-bidder">当前竞价: ${product.currentBidder || '暂无'}</div>
          <div class="product-min-bid">最小加价: ¥${product.minIncrement}</div>
        </div>
      `;
      
      productCard.addEventListener('click', () => {
        this.showProductDetail(product);
      });
      
      productsGrid.appendChild(productCard);
    });
  }
  
  // 显示产品详情
  showProductDetail(product) {
    const productInfo = document.getElementById('productInfo');
    if (!productInfo) return;
    
    productInfo.innerHTML = `
      <h3>${product.name}</h3>
      <div class="info-row">
        <span class="info-label">商品描述:</span>
        <span class="info-value">${product.description || '暂无描述'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">起拍价格:</span>
        <span class="info-value">¥${product.startPrice.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">最低加价:</span>
        <span class="info-value">¥${product.minIncrement.toLocaleString()}</span>
      </div>
      <div class="current-price">
        当前价格: <span id="currentPrice">¥${product.currentPrice.toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">当前竞价人:</span>
        <span class="info-value" id="currentBidder">${product.currentBidder || '暂无'}</span>
      </div>
    `;
    
    // 更新当前选中的商品 - 修复：确保全局可用
    this.currentSelectedProduct = product;
    
    // 显示竞价区域
    document.getElementById('productsSection').style.display = 'none';
    document.getElementById('biddingSection').style.display = 'block';
    
    // 更新竞价区域的用户信息
    const biddingUserInfo = document.getElementById('biddingUserInfo');
    if (biddingUserInfo && this.currentUser) {
      biddingUserInfo.textContent = `欢迎，${this.currentUser.username} (ID: ${this.currentUser.id})`;
    }
  }
  
  // 获取产品图片
  getProductImage(productId) {
    const images = ['🎨', '⌚', '📮', '🏀', '🎸', '💎', '📚', '📷', '🥃', '🧵', '🗿', '🚗'];
    const index = parseInt(productId) - 1;
    return images[index] || '📦';
  }
}

// 创建全局实例
const biddingManager = new BiddingManager();
