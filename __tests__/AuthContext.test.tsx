import React from "react";
import { render, screen, waitFor, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/src/contexts/AuthContext";
import * as nextAuth from "next-auth/react";

jest.mock("next-auth/react");

const mockSignIn = nextAuth.signIn as jest.Mock;
const mockSignOut = nextAuth.signOut as jest.Mock;

const TestComponent = () => {
    const { user, loading, error, register, login, logout, isAdmin } =
        useAuth();

    return (
        <div>
            <div>User: {user?.email || "none"}</div>
            <div>Loading: {loading.toString()}</div>
            <div>Error: {error || "none"}</div>
            <div>Is Admin: {isAdmin() ? "yes" : "no"}</div>
            <button
                onClick={() =>
                    register({
                        first_name: "Test",
                        last_name: "User",
                        email: "test@example.com",
                        password: "pass",
                    })
                }
            >
                Register
            </button>
            <button onClick={() => login("test@example.com", "pass")}>
                Login
            </button>
            <button onClick={() => logout()}>Logout</button>
        </div>
    );
};

describe("AuthProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (nextAuth.useSession as jest.Mock).mockReturnValue({
            data: { user: { email: "admin@example.com", role: "admin" } },
            status: "authenticated",
        });
    });

    it("provides user data and admin check", () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
        expect(
            screen.getByText(/User: admin@example.com/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Loading: false/i)).toBeInTheDocument();
        expect(screen.getByText(/Is Admin: yes/i)).toBeInTheDocument();
    });

    it("handles register success", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            } as Response)
        ) as jest.Mock;

        mockSignIn.mockResolvedValue({ error: null });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        userEvent.click(screen.getByText("Register"));

        await waitFor(() =>
            expect(mockSignIn).toHaveBeenCalledWith(
                "credentials",
                expect.any(Object)
            )
        );
    });

    it("handles register failure", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: "Registration failed" }),
            } as Response)
        );

        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await expect(
            result.current.register({
                first_name: "Test",
                last_name: "User",
                email: "fail@example.com",
                password: "password123",
            })
        ).rejects.toThrow("Registration failed");
    });

    // it("handles login failure", async () => {
    //     // Mock nextAuthSignIn to simulate login failure
    //     const mockSignIn = jest.fn(() =>
    //         Promise.resolve({ error: "Invalid credentials" })
    //     );
    //     jest.mock("next-auth/react", () => ({
    //         ...jest.requireActual("next-auth/react"),
    //         signIn: mockSignIn,
    //     }));

    //     const { result } = renderHook(() => useAuth(), {
    //         wrapper: AuthProvider,
    //     });

    //     await expect(
    //         result.current.login("fail@example.com", "wrongpassword")
    //     ).rejects.toThrow("Invalid credentials");
    // });

    it("handles logout", async () => {
        mockSignOut.mockResolvedValue(undefined);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        userEvent.click(screen.getByText("Logout"));

        await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    });
});
