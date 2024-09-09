import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import React, { useState } from 'react';
import { Layout } from 'antd';
import MenuSidebar from './Navigation/Menu_sidebar';
import Navbar from './Navigation/Navbar';
import Course from './Feature/Course/Course';
import Homepage from './Feature/Homepage';
import Rmae from './Feature/Rmae/Rmae';
import Assignment from './Feature/Course/Assignment';
import PrivacyProtection from './Feature/Rmae/PrivacyProtection';
import AutoEvaluation from './Feature/Rmae/AutoEvaluation';
import FinalResult from './Feature/Course/FinalResult';
const { Content } = Layout;

// Main App component
const App = () => {
    const [pageTitle, setPageTitle] = useState('Homepage');

    return (
        <Router>
            <Layout style={{ minHeight: '100vh' }}>
                <MenuSidebar setPageTitle={setPageTitle}/> {/* Sidebar menu */}
                <Layout>
                    <Navbar pageTitle={pageTitle}/>{/* Navigation bar */}
                    <Content>
                    <Routes>
                        <Route path="/" element={<Navigate to="/homepage" replace />} />
                        <Route path="/homepage" element={<Homepage />} />
                        <Route path="/courses" element={<Course />} />
                        <Route path="/ai-assessment" element={<Rmae />} />
                        <Route path="/asm/:courseID" element={<Assignment />} />
                        <Route path="/privacy/:assignmentID" element={<PrivacyProtection />} />
                        <Route path="/evaluation/:assignmentID" element={<AutoEvaluation />} />
                        <Route path="/finalresult/:assignmentID" element={<FinalResult />} />
                    </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;