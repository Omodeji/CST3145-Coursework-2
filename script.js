var app = new Vue({
  el: "#app",
  data: {
    showProduct: true,
    lessons: [],
    cart: [],
    searchTerm: "",
    username: "",
    phone: "",
    filteredLessons: [],
    sortAttribute: "subject",
    sortOrder: "asc",
    sortedLessons: [],
    baseURL: "https://cw2-backend.vercel.app/",
  },

  created() {
    this.getLessons();
  },

  methods: {
    async getLessons() {
      var res = await fetch(`${this.baseURL}collection/lessons`);
      this.lessons = await res.json();
    },

    async searchLessons() {
      var query = `?search=${this.searchTerm}&sort=${this.sortAttribute}&order=${this.sortOrder}`

      var res = await fetch(`${this.baseURL}search/collection/lessons/${query}`);
      this.lessons = await res.json();
    },

    async submitOrder() {
      var order = {
        cart: [...this.cart],
        username: this.username,
        phone: this.phone,
      };

      // Update lessons
      this.cart.forEach((item) => { 
        fetch(`${this.baseURL}collection/lessons/${item.lesson._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avaliability: item.lesson.avaliability }),
        });
      });

      // Save Order
      await fetch(`${this.baseURL}collection/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      alert("Order Submitted");
      this.cart = [];
      this.showProduct = true;
    },

    addToCart(lesson) {
      if (lesson.avaliability > 0) {
        lesson.avaliability--;
        var cartIndex = this.cart.findIndex((i) => i.lesson === lesson);
        if (cartIndex > -1) {
          this.cart[cartIndex].amount++;
        } else {
          // is lesson is not in cart add new lesson object
          this.cart.push({
            lesson: lesson,
            amount: 1,
          });
        }
      }
    },
    removeProduct(lesson) {
      // remove product from cart container array
      const index = this.cart.findIndex((i) => i.lesson === lesson);
      console.log(index);
      // check for last index
      if (index !== -1) {
        // if lesson space already in cart deduct one amount
        this.cart[index].amount--;
        // add overall space when lesson is removed
        lesson.avaliability += 1;
        // else remove all lessons and update to original value
        if (this.cart[index].amount == 0) {
          this.cart.splice(index, 1);
        }
      }
      // when a product is removed from cart add one back to space
    },
    // check for avaliability
    // you cannot add a course more the number of space capacity it has.
    checkItemCount(id) {
      itemCount = 0;
      for (i = 0; i < this.cart.length; i++) {
        // check for current instance of is
        if (this.cart[i] === id) {
          itemCount += 1;
        }
      }
      return itemCount;
    },
    // check if to show checkout page
    showCheckOut() {
      this.showProduct = this.showProduct ? false : true;
    },
  },
  // computed values object
  computed: {
    // get cart length
    cartSize: function () {
      return this.cart.reduce((sum, lesson) => sum + lesson.amount, 0);
    },
    // check if product can be added to cart
    canAddToCart(lessons) {
      return this.lessons.avaliability > this.checkItemCount(lessons.id);
    },
    cartTotal() {
      return this.cart.reduce(
        (total, item) => total + item.amount * item.lesson.price,
        0
      );
    },

    completeOrder() {
      return /^[a-zA-Z]+$/.test(this.username) && /^\d+$/.test(this.phone);
    },
  },
});
