import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  module OrderRecord {
    public func compareByDate(o1 : OrderRecord, o2 : OrderRecord) : Order.Order {
      Int.compare(o1.createdAt, o2.createdAt);
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    imageUrl : Text;
    stock : Nat;
    createdAt : Time.Time;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Cart = {
    items : [CartItem];
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
    price : Nat;
  };

  type OrderStatus = {
    #pending;
    #processing;
    #shipped;
    #delivered;
  };

  type OrderRecord = {
    id : Nat;
    user : Principal;
    items : [OrderItem];
    total : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
  };

  type OrderInput = {
    items : [OrderItem];
    total : Nat;
    status : OrderStatus;
  };

  type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, Cart>();
  let orders = Map.empty<Nat, OrderRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let categories = List.fromArray(["Electronics", "Clothing", "Home & Garden", "Books", "Sports", "Toys", "Beauty", "Automotive"]);

  var nextProductId = 1;
  var nextOrderId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      imageUrl = product.imageUrl;
      stock = product.stock;
      createdAt = Time.now();
    };
    products.add(id, newProduct);
    id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    let existingProduct = switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?p) { p };
    };

    let updatedProduct : Product = {
      id;
      name = product.name;
      description = product.description;
      price = product.price;
      category = product.category;
      imageUrl = product.imageUrl;
      stock = product.stock;
      createdAt = existingProduct.createdAt;
    };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { products.remove(id) };
    };
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) {
        Text.equal(p.category, category);
      }
    );
  };

  public query ({ caller }) func searchProducts(name : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { p.name.contains(#text name) }
    );
  };

  // Cart Management
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    if (quantity == 0 or quantity > 100) {
      Runtime.trap("Invalid quantity: Must be between 1 and 100");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (product.stock < quantity) {
      Runtime.trap("Not enough stock available");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { { items = [] } };
      case (?cart) { cart };
    };

    let existingItem = cart.items.find(
      func(item) { item.productId == productId }
    );

    let newItems = switch (existingItem) {
      case (null) {
        cart.items.concat([{ productId; quantity }]);
      };
      case (?item) {
        cart.items.map(
          func(i) {
            if (i.productId == productId) {
              { productId = item.productId; quantity = item.quantity + quantity };
            } else {
              i;
            };
          }
        );
      };
    };

    carts.add(caller, { items = newItems });
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };

    let newItems = cart.items.filter(
      func(item) { item.productId != productId }
    );

    carts.add(caller, { items = newItems });
  };

  public shared ({ caller }) func updateCartItem(productId : Nat, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    if (quantity == 0 or quantity > 100) {
      Runtime.trap("Invalid quantity: Must be between 1 and 100");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };

    if (product.stock < quantity) {
      Runtime.trap("Not enough stock available");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };

    let newItems = cart.items.map(
      func(item) {
        if (item.productId == productId) {
          { productId = item.productId; quantity };
        } else {
          item;
        };
      }
    );

    carts.add(caller, { items = newItems });
  };

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    switch (carts.get(caller)) {
      case (null) { { items = [] } };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage cart");
    };

    carts.remove(caller);
  };

  // Order Management
  public shared ({ caller }) func placeOrder() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };

    if (cart.items.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    let orderItems = cart.items.map(
      func(item) {
        let product = switch (products.get(item.productId)) {
          case (null) { Runtime.trap("Product not found") };
          case (?product) { product };
        };
        if (product.stock < item.quantity) {
          Runtime.trap("Not enough stock for product " # product.name);
        };
        { productId = item.productId; quantity = item.quantity; price = product.price };
      }
    );

    let total = orderItems.foldLeft(
      0,
      func(acc, item) { acc + (item.price * item.quantity) }
    );

    let newOrder : OrderRecord = {
      id = nextOrderId;
      user = caller;
      items = orderItems;
      total;
      status = #pending;
      createdAt = Time.now();
    };

    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;

    // Update stock
    for (item in cart.items.values()) {
      switch (products.get(item.productId)) {
        case (?product) {
          let updatedProduct = {
            id = product.id;
            name = product.name;
            description = product.description;
            price = product.price;
            category = product.category;
            imageUrl = product.imageUrl;
            stock = product.stock - item.quantity;
            createdAt = product.createdAt;
          };
          products.add(item.productId, updatedProduct);
        };
        case (null) {};
      };
    };

    // Clear cart
    carts.remove(caller);

    newOrder.id;
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?OrderRecord {
    let order = switch (orders.get(id)) {
      case (null) { return null };
      case (?o) { o };
    };

    // Users can only view their own orders, admins can view all
    if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };

    ?order;
  };

  public query ({ caller }) func getUserOrders() : async [OrderRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    orders.values().toArray().filter(
      func(o) { o.user == caller }
    ).sort(OrderRecord.compareByDate);
  };

  public query ({ caller }) func getAllOrders() : async [OrderRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort(OrderRecord.compareByDate);
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    let order = switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let updatedOrder = {
      id = order.id;
      user = order.user;
      items = order.items;
      total = order.total;
      status;
      createdAt = order.createdAt;
    };

    orders.add(id, updatedOrder);
  };

  public query ({ caller }) func getCategories() : async [Text] {
    categories.toArray();
  };
};
