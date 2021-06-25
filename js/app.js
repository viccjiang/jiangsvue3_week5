// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.js';

// 區域註冊: 載入Modal元件
import userProductModal from './userProductModal.js';
// 區域註冊: 載入分頁頁碼元件
import pagination from './pagination.js';

// 加入站點
const apiUrl = 'https:///vue3-course-api.hexschool.io';
// 加入API Path
const apiPath = 'jiangsvue3';
// scrollTop 需要的 DOM
// const tBody = document.querySelector('html,body');

const app = Vue.createApp({
  data() {
    return {
      // 一律使用 function return

      // 讀取效果 ex避免狂戳 api
      loadingStatus: {
        loadingItem: '',
      },
      // 產品列表
      products: [],
      // props 傳遞到內層的暫存資料
      product: {},
      // 表單結構，對應API文件：客戶購物 > 結帳頁面
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      // 購物車列表
      cart: {},
      // 分頁頁碼元件
      pagination: {},
    };
  },
  // 區域註冊
  // 註冊分頁頁碼元件
  components: {
    userProductModal,
    pagination,
  },

  methods: {
    // this.$refs.userProductModal.openModal();
    // 取得產品列表方法
    getProducts(page = 1) { //頁面預設值
      const url = `${apiUrl}/api/${apiPath}/products?page=${page}`;
      axios.get(url)
        .then((response) => {
          if (response.data.success) {
            console.log(response.data.products);
            this.products = response.data.products;
            this.pagination = response.data.pagination;
            // console.log(response.data);
            // console.log(tbody);
            // tbody.scrollTop = 0;
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 取得單一產品方法 openModal
    getProduct(id) {
      this.loadingStatus.loadingItem = id; //讀取 id
      console.log(id);
      const url = `${apiUrl}/api/${apiPath}/product/${id}`;
      axios.get(url)
        .then((response) => {
          if (response.data.success) {

            this.loadingStatus.loadingItem = '';//讀取完畢後，改為空的
            // 把取得的資料存起來
            this.product = response.data.product;
            this.$refs.userProductModal.openModal();
          } else {
            alert(response.data.message);
          }
        });
    },
    // 加入購物車方法 post 代入參數
    addToCart(id, qty = 1) {
      this.loadingStatus.loadingItem = id;
      const url = `${apiUrl}/api/${apiPath}/cart`;
      const cart = {
        product_id: id, //產品id
        qty, //產品數量
      };
      if (cart.qty < 1) {
        alert('數量必須大於0');
        this.loadingStatus.loadingItem = '';
      } else {
        axios.post(url, { data: cart })
          .then((response) => {
            if (response.data.success) {
              console.log(response);
              alert(response.data.message);
              // 成功刪除後清空id，恢復不是disabled的狀態
              this.loadingStatus.loadingItem = '';
              this.getCart(); //加入購物車就要觸發購物車列表
            } else {
              alert(response.data.message);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
      this.$refs.userProductModal.hideModal();
    },
    // 取得購物車列表方法
    getCart() {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      axios.get(url)
        .then((response) => {
          if (response.data.success) {
            console.log(response.data.data);
            this.cart = response.data.data; //包含兩大資訊：價格 ＆ 購物車列表
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },


    // 更新購物方法
    updateCart(data) {
      console.log(data);// 因為傳進來的 data為單筆物件
      this.loadingStatus.loadingItem = data.id;
      const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`; //購物車id
      const cart = {
        product_id: data.product_id, //產品id
        qty: data.qty,
      };
      if (cart.qty < 1) {
        alert('數量必須大於0');
        this.loadingStatus.loadingItem = '';
        this.getCart();
      } else {
        axios.put(url, { data: cart })
          .then((response) => {
            if (response.data.success) {
              console.log(response);
              alert(response.data.message);
              // 成功刪除後清空id，恢復不是disabled的狀態
              this.loadingStatus.loadingItem = '';
              this.getCart();
            } else {
              alert(response.data.message);
              this.loadingStatus.loadingItem = '';
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },
    // 清空購物車方法
    deleteAllCarts() {
      const url = `${apiUrl}/api/${apiPath}/carts`;
      axios.delete(url)
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            this.getCart();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 刪除單一購物車產品方法
    removeCartItem(id) {
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      this.loadingStatus.loadingItem = id;
      axios.delete(url)
        .then((response) => {
          if (response.data.success) {
            alert(response.data.message);
            // 成功刪除後清空id，恢復不是disabled的狀態
            this.loadingStatus.loadingItem = '';
            this.getCart();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    // 建立訂單方法 (送出訂單按鈕後)
    createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios
        .post(url, { data: order })
        .then((response) => {
          if (response.data.success) {
            // alert(response.data.message);
            alert(response.data.message);
            // 清空的方法：resetForm是v-form元件下面的方法
            // 不能直接給空字串的方式，因為又會觸發一次驗證表單
            this.$refs.form.resetForm();
            this.getCart();
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  // created() {
  //   // 元件生成，必定會執行的項目
  //   this.getProducts();

  // },
  mounted() {
    // 元件生成，必定會執行的項目
    this.getProducts();
    // 加入購物車就要取得購物車列表
    this.getCart();
  },
});

// 載入多國語系 i18n
VeeValidateI18n.loadLocaleFromURL('./js/zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

// 全部加入(CDN 版本)
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 全域註冊：表單驗證元件;
app.component('VForm', VeeValidate.Form);// v-form
app.component('VField', VeeValidate.Field);//v-field
app.component('ErrorMessage', VeeValidate.ErrorMessage);//error-message

app.mount('#app');

