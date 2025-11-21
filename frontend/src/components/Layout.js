// src/components/Layout.js
import React from "react";
import Navbar from "./Navbar";

function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div className="main-content">
                {children}
            </div>
        </>
    );
}

export default Layout;
