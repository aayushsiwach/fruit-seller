import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/pages/index"; // Adjust if your file path is different
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { ItemType } from "@/types/types";

// Mock next/router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

// Mock ProductCard
jest.mock("@/src/components/ProductCard", () => ({
    __esModule: true,
    default: ({ product }: { product: ItemType }) => (
        <div data-testid="product-card">{product.name}</div>
    ),
}));

// Mock framer-motion to skip animations during tests
jest.mock("framer-motion", () => {
    const FakeMotion = ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    );
    return {
        motion: new Proxy(FakeMotion, {
            get: () => FakeMotion,
        }),
        AnimatePresence: FakeMotion,
    };
});

const mockPush = jest.fn();

beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

const renderWithQueryProvider = (ui: React.ReactNode) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe("Home Page", () => {
    beforeEach(() => {
        // Reset mocks
        fetchMock.resetMocks();
    });

    it("renders hero section", () => {
        renderWithQueryProvider(<Home />);
        expect(
            screen.getByText(/Fresh Fruits Delivered to Your Door/i)
        ).toBeInTheDocument();
    });

    it("renders loading spinner for featured products", async () => {
        fetchMock.mockResponseOnce(
            () => new Promise(() => {}) // simulate pending
        );
        renderWithQueryProvider(<Home />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders featured products after fetch", async () => {
        const mockProducts = [
            { id: 1, name: "Apple", quantity: 10 },
            { id: 2, name: "Banana", quantity: 5 },
        ];
        fetchMock.mockResponseOnce(JSON.stringify(mockProducts));

        renderWithQueryProvider(<Home />);

        await waitFor(() =>
            expect(screen.getAllByTestId("product-card")).toHaveLength(2)
        );
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Banana")).toBeInTheDocument();
    });

    it("renders benefits section", () => {
        renderWithQueryProvider(<Home />);
        expect(screen.getByText("Why Choose Us?")).toBeInTheDocument();
        expect(screen.getByText("Farm Fresh")).toBeInTheDocument();
    });

    it("navigates to products when CTA button is clicked", async () => {
        renderWithQueryProvider(<Home />);
        const shopNowButton = screen.getAllByRole("button", {
            name: /Shop Now/i,
        })[0];
        await userEvent.click(shopNowButton);
        expect(mockPush).toHaveBeenCalledWith("/products");
    });
});
