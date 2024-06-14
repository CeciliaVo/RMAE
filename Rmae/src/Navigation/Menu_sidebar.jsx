import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Upload, Modal, Input, Form } from 'antd';
import { HomeOutlined, ReadOutlined, OpenAIOutlined, CameraOutlined, LogoutOutlined } from '@ant-design/icons';
import { BsFillPencilFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import './Menu_sidebar.css';
import './Modalname.css';
import UserDefaultAvatar from '../assets/avatardefault.png';

const { Sider } = Layout;

function getItem(label, key, icon, setPageTitle) {
    const navigate = useNavigate();
    return {
        label, // Display label for the item
        key, // Unique key for each item
        icon, // Icon for the item
        onClick: () => {
            setPageTitle(label); // Update the page title 
            navigate(key); // Navigate to the page associated with the key
        },
    };
}

// Sidebar component
const MenuSidebar = ({ setPageTitle }) => {
    const [collapsed, setCollapsed] = useState(true); // State to manage the collapsed state of the Sider
    /*USER INFORMATION*/
    const [showCameraIcon, setShowCameraIcon] = useState(false); // State to manage avatar change
    const [userAvatar, setUserAvatar] = useState(UserDefaultAvatar); // Set the default avatar
    const [userName, setUserName] = useState('User Name'); 
    const [firstName, setFirstName] = useState(''); 
    const [familyName, setFamilyName] = useState(''); 
    const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the visibility of the modal for changing the name
    const [isButtonDisabled, setIsButtonDisabled] = useState(true); // State to manage change name condition

    // Define the items for the sidebar
    const items = [
        getItem('Homepage', '/homepage', <HomeOutlined style={{ fontSize: '15px' }} />, setPageTitle),
        getItem('Courses', '/courses', <ReadOutlined style={{ fontSize: '15px' }} />, setPageTitle),
        getItem('AI Assessment Evaluation', '/ai-assessment', <OpenAIOutlined style={{ fontSize: '15px' }} />, setPageTitle),
        getItem('Sign Out', '/signout', <LogoutOutlined  style={{ fontSize: '15px' }} />)
    ]

    // User information
    const user = {
        avatar: userAvatar, // replace with the URL to the user's avatar
        name: userName, // use userName state here
        email: 'nekokuromoji@example.com',
    };

    // Update isButtonDisabled state whenever firstName or familyName changes
    useEffect(() => {
        setIsButtonDisabled((!firstName || firstName.length < 2) && (!familyName || familyName.length < 2));
    }, [firstName, familyName]);

    // Function to upload user avatar
    const avatarUpload = (file) => {
        // Check if the file is an image file
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // Check if the file size is less than 1MB
        if (file.size > 2500 * 2500) {
            alert('Please upload an image file smaller than 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setUserAvatar(reader.result);
        };
        reader.readAsDataURL(file);
        // Prevent the upload action from being executed
        return false;
    };

    // Function to constrain the name input of the user
    const userNameChange = (type) => (uname) => {
        const name = uname.target.value;
        // Check if the name only contains letters and is not longer than 8 characters
        if (name && !/^[a-zA-Z]{1,8}$/.test(name)) {
            alert('Name should only contain letters and be no longer than 8 characters.');
        } else {
            if (type === 'firstName') {
                setFirstName(name);
            } else if (type === 'familyName') {
                setFamilyName(name);
            }
        }
    };

    // Function to handle change user name form
    const uNameForm = () => {
        setIsModalOpen(true);
    };

    // Function to handle change name success
    const confirmUNameChange = () => {
        let newName = `${firstName} ${familyName}`.trim(); 
        setUserName(newName);
        setFirstName(''); 
        setFamilyName(''); 
        setIsModalOpen(false);
    };


    // Function to handle change name Cancel
    const cancelUNameChange = () => {
        setFirstName(''); 
        setFamilyName(''); 
        setIsModalOpen(false);
    };

    return (
        <Sider width={250} theme="light" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            {collapsed ? (
                <div className="collapsed-avatar-container">
                    <Avatar className="collapsed-user-avatar" src={user.avatar} size={50} />
                </div>
            ) : (
                <div className="user-info">
                    <div className="avatar-container" onMouseEnter={() => setShowCameraIcon(true)} onMouseLeave={() => setShowCameraIcon(false)}>
                        <Upload showUploadList={false} beforeUpload={avatarUpload}>
                            <Avatar className="user-avatar" src={user.avatar} size={70} />
                            {showCameraIcon && <CameraOutlined className="camera-icon" />}
                        </Upload>
                    </div>
                    <h1 className="username">{user.name} <BsFillPencilFill className="pencil-icon" onClick={uNameForm} /> </h1>
                    <p className="email">{user.email}</p>
                </div>
            )}
            <Menu defaultSelectedKeys={['/homepage']} mode="inline" items={items} />
            <Modal className="custom-modal" title="Change Name" open={isModalOpen} onOk={confirmUNameChange} onCancel={cancelUNameChange} okButtonProps={{ disabled: isButtonDisabled }}>
                <Form layout="vertical">
                    <Form.Item label = 'First Name' className="u1name">
                        <Input className="u1n-holder" placeholder="" onChange={userNameChange('firstName')} value={firstName} />
                    </Form.Item>
                    <Form.Item label = 'Family Name' className="ufname">
                        <Input className="ufn-holder" placeholder="" onChange={userNameChange('familyName')} value={familyName} />
                    </Form.Item>
                </Form>
            </Modal>
        </Sider>
    );    
}
export default MenuSidebar;