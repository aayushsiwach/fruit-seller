import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "@/src/contexts/CartContext";


const mockProducts = [
    {
        id: "1",
        name: "Apple",
        price: 1.0,
        quantity: 10,
        image: "apple.jpg",
        description: "Fresh apple",
        category: "Fruit",
        product_id: 1,
        discount: 10,
        is_seasonal: false,
        created_at: "2023-01-01",
    },
    {
        id: "2",
        name: "Banana",
        price: 0.5,
        quantity: 20,
        image: "banana.jpg",
        description: "Ripe banana",
        category: "Fruit",
        product_id: 2,
        discount: 10,
        is_seasonal: false,
        created_at: "2023-01-01",
    },
];

function TestCartComponent() {
    const { cart, addToCart, removeFromCart, clearCart } = useCart();

    return (
        <>
            <div data-testid="cart-count">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </div>

            <button onClick={() => addToCart(mockProducts[0], 2)}>
                Add Apple x2
            </button>
            <button onClick={() => removeFromCart(mockProducts[0].id)}>
                Remove Apple
            </button>
            <button onClick={() => clearCart()}>Clear Cart</button>

            {cart.map((item) => (
                <div key={item.product_id} data-testid="cart-item">
                    {item.product_id} - {item.quantity}
                </div>
            ))}
        </>
    );
}

beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe("CartProvider", () => {
    it("adds items to the cart", async () => {
        render(
            <CartProvider>
                <TestCartComponent />
            </CartProvider>
        );

        await act(async () => {
            userEvent.click(screen.getByText("Add Apple x2"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("cart-count").textContent).toBe("2");
        });

        expect(screen.getAllByTestId("cart-item")[0]).toHaveTextContent(
            "1 - 2"
        );
    });

    it("removes item from cart", async () => {
        render(
            <CartProvider>
                <TestCartComponent />
            </CartProvider>
        );

        await act(async () => {
            userEvent.click(screen.getByText("Add Apple x2"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("cart-count").textContent).toBe("2");
        });

        await act(async () => {
            userEvent.click(screen.getByText("Remove Apple"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("cart-count").textContent).toBe("0");
        });
    });

    it("clears the cart", async () => {
        render(
            <CartProvider>
                <TestCartComponent />
            </CartProvider>
        );

        await act(async () => {
            userEvent.click(screen.getByText("Add Apple x2"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("cart-count").textContent).toBe("2");
        });

        await act(async () => {
            userEvent.click(screen.getByText("Clear Cart"));
        });

        await waitFor(() => {
            expect(screen.getByTestId("cart-count").textContent).toBe("0");
        });
    });
});
