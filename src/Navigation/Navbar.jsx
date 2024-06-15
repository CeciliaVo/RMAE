import React from 'react';
import { Layout, Image } from 'antd';
import { BsBellFill } from "react-icons/bs";
import './Navbar.css';
import logo from '../../public/logo.png'

const { Header } = Layout;

const Navbar = ({ pageTitle }) => {
    return (
        <Header className="header">
            <Image className="logo" src={logo} width={80} />
            <h1 className="page-title">{pageTitle}</h1>
            <div className="notification-icon"> <BsBellFill size={25}/> </div>
        </Header>
    );
};

export default Navbar;
