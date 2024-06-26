import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Myorder() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch(
            `/api/order?consumentId=${session.user._id}`
          );
          const data = await response.json();

          if (response.ok) {
            // Sort orders by createdAt in descending order
            const sortedOrders = data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
          } else {
            setError(data.error);
          }
        } catch (error) {
          setError("Failed to fetch orders");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [session, status]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRes = await fetch("/api/product");
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData = await productsRes.json();
        setProducts(productsData);
        setProductsLoaded(true); // Set productsLoaded to true when products are fetched
      } catch (error) {
        setError("Error fetching products");
      }
    };

    fetchProducts();
  }, []);

  if (isLoading || !productsLoaded) {
    return (
      <div className="flex items-center justify-center p-12 text-black text-2xl text-center bg-white">
        <div>
          <h1>Memuat Order</h1>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="mx-auto mt-4 animate-spin" // Center the SVG and add some margin-top
          >
            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm8 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-19 0c0-6.065 4.935-11 11-11v2c-4.962 0-9 4.038-9 9 0 2.481 1.009 4.731 2.639 6.361l-1.414 1.414.015.014c-2-1.994-3.24-4.749-3.24-7.789z" />
          </svg>
        </div>
      </div>
    ); // Display loading message until both orders and products are loaded
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-hidden bg-white">
      <Navbar />
      <div className="container mx-auto py-8 text-black over">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        {orders.length === 0 && <p>You have no orders.</p>}
        {orders.length > 0 && (
          <ul className="list-none">
            {orders.map((order) => (
              <li
                key={order._id}
                className="bg-white shadow-md rounded-md p-4 mb-4 border-2"
              >
                <h2 className="text-xl font-bold mb-2">Order #{order._id}</h2>
                <p className="mb-2">
                  <strong>Date:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-2">
                  <strong>Total Price:</strong> Rp{order.totalPrice.toFixed(2)}
                </p>
                <h3 className="text-lg font-bold mb-2">Items:</h3>
                <ul className="list-disc pl-4">
                  {order.items.map((item, index) => {
                    const product = products.find(
                      (p) => p._id === item.product
                    );
                    return (
                      <li
                        key={index}
                        className="flex justify-between items-center mb-2"
                      >
                        <div className="flex items-center">
                          {product &&
                            product.images &&
                            product.images.length > 0 && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-12 h-12 mr-4 object-cover"
                              />
                            )}
                          <span>{product ? product.title : "Unknown"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">
                            Quantity: {item.quantity}
                          </span>
                          <span>
                            Price: Rp{product ? product.price : "N/A"}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-3">
                  <strong>Shipping Address:</strong>{" "}
                  {order.shippingAddress.name}, {order.shippingAddress.address}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
}
