import React, { Fragment } from "react";
import LeftMenu from "../LeftMenu/LeftMenu";
import TopMenu from "../TopMenu/TopMenu";
import { Routes, Route } from "react-router-dom"; 
import Users from "../Users/Users";
import Home from "../Home/Home";
import Products from "../Products/Products";
import Stocks from "../Stocks/Stocks";
import Notifications from "../../common/components/Notification";
import { PrivateComponent } from "../../common/components/PrivateComponent"; 
const Admin: React.FC = () => {
  return (
    <Fragment>
      <Notifications />
      <LeftMenu />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <TopMenu />
          <div className="container-fluid">
            <Routes>
              <Route
                path="/users"
                element={
                  <PrivateComponent>
                    <Users />
                  </PrivateComponent>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateComponent>
                    <Home />
                  </PrivateComponent>
                }
              />
              <Route
                path="/products"
                element={
                  <PrivateComponent>
                    <Products />
                  </PrivateComponent>
                }
              />
              <Route
                path="/stock"
                element={
                  <PrivateComponent>
                    <Stocks />
                  </PrivateComponent>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Admin;
