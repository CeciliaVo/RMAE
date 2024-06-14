import React, { useState } from 'react';
import {Divider, Row, Col, Tooltip, Modal, Checkbox, Input, Button, Steps, Select} from 'antd';
import { InfoCircleOutlined, CloseOutlined, SyncOutlined} from '@ant-design/icons';
import { FaGooglePlay } from "react-icons/fa";
import { BsPersonLock } from "react-icons/bs";
import { IoTimerSharp } from "react-icons/io5";
import { LuArrowLeftFromLine } from "react-icons/lu";
import ReturnPrePage from './Course/ReturnPage';
import ProgressBar from 'react-bootstrap/ProgressBar';

import './Rmae.css';

const Rmae = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState([]);
    const [options, setOptions] = useState(["Student name", "Course ID", "Course Name", "Student ID", "Student Age", "Gender"]);
    const [newOption, setNewOption] = useState("");
    const [currentAssignment, setCurrentAssignment] = useState(null); //Keep track on the current assignment the user is interact with
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };
    
    const [assignments, setAssignments] = useState([
        { 
            id: "OENG1183_1A_2024",
            name: "Capstone EP Sem A", 
            courseName: "OENG1183",
            date: "08/06/2024",
            submissionType: "Folder",
            numberOfFiles: "177",
            fileType: "python",
            privacyProtectionState: 'start', 
            autoEvaState: 'wait', 
            progressPercentage: 0 
        },
        { 
            id: "OENG1183_2B_2024",
            name: "Capstone EP Sem B", 
            privacyProtectionState: 'start', 
            autoEvaState: 'wait', 
            progressPercentage: 0 
        }
    ]);

    const modalAskInputUser = (assignmentId) => {
        setIsModalOpen(true);
        setCurrentAssignment(assignmentId);
        setRecentAssignments(prevRecentAssignments => {
            const updatedRecentAssignments = [assignmentId, ...prevRecentAssignments];
            // Keep only the 3 most recent assignments
            return updatedRecentAssignments.slice(0, 3);
        });
    };
    

    const confirmSensiData = () => {
        setIsModalOpen(false);
        setSelectedData([]); 
        setNewOption(""); 
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === currentAssignment
                    ? { ...assignment, privacyProtectionState: 'process' }
                    : assignment
            )
        );
    };

    const privacyProtectionFunc = (assignmentId) => {
        // ... Hide sensitive data ...

        // After the process is done
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === assignmentId
                    ? { ...assignment, privacyProtectionState: 'done', autoEvaState: 'start', progressPercentage: 100 }
                    : assignment
            )
        );
        // ... Start the second step ...
    };

    const cancelSensiData = () => {
        setIsModalOpen(false);
        setSelectedData([]); 
        setNewOption(""); 
    };

    const inputNewOpt = (e) => {
        const value = e.target.value;
        const lettersAndSpacesOnly = value.replace(/[^A-Za-z\s]/g, '');
        setNewOption(lettersAndSpacesOnly);
    };    

    const selectOption = checkedValues => {
        setSelectedData(checkedValues);
    };

    const allowAddNewOption = () => {
        if (newOption.length >= 3) {
            setOptions([...options, newOption]);
            setNewOption("");
        }
    };

    const deleteOption = (index) => {
        if (options.length > 3) {
            const newOptions = [...options];
            newOptions.splice(index, 1);
            setOptions(newOptions);
        }
    };

    return (
        <>
        {/*previous page return*/}
        <div className='manage-page-state'>
            <LuArrowLeftFromLine className='returnpage-icon' size={25} onClick={ReturnPrePage} />
        </div>

        <div className='search-box'> 
            <Select
                className='search-box-component'
                showSearch
                style={{ width: 200 }}
                placeholder="Search to Select"
                optionFilterProp="children"
                filterOption={(input, option) => (option?.label ?? '').includes(input)}
                filterSort={(optionA, optionB) =>
                    (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={recentAssignments.map(id => {
                    const assignment = assignments.find(a => a.id === id);
                    return { value: assignment.id, label: assignment.name };
                })}
                onChange={handleSearchChange}
            />
        </div>

        <div className="assignments-container">
            {/* Assignment information title */}
            <Row className="assignment-info">
                <Col span={3}><div className="asm-label-rmae"><b>Assignment ID</b></div></Col>
                <Col span={8}><div className="asm-label-rmae"><b>Assignment Name</b></div></Col>
                <Col span={1}></Col>
                <Col span={2}></Col>
                <Col span={8}><div className="asm-label-rmae"><b>Progress</b></div></Col>
            </Row>

            <Divider  className='divi-rmae'  orientation = 'left'></Divider>

            {assignments.map((assignment) => (
                <div key={assignment.id}>
                    <Row className="display-assignments">
                        <Col span={3} className="assignment-name">{assignment.id}</Col>
                        <Col span={8} className="assignment-name">{assignment.name}</Col>
                        <Col span={1}>
                            <Tooltip title={
                                <>
                                    <span className="tooltip-label">Course Name:</span> <span className="tooltip-value">{`${assignment.courseName}`}</span><br />
                                    <span className="tooltip-label">Date:</span> <span className="tooltip-value">{`${assignment.date}`}</span><br />
                                    <span className="tooltip-label">Submission Type:</span> <span className="tooltip-value">{`${assignment.submissionType}`}</span><br />
                                    <span className="tooltip-label">Number of Files:</span> <span className="tooltip-value">{`${assignment.numberOfFiles}`}</span><br />
                                    <span className="tooltip-label">File Type:</span> <span className="tooltip-value">{`${assignment.fileType}`}</span>
                                </>
                            }>
                                <InfoCircleOutlined className="view-asm-detail-icon" /> {/* Hover to show the assignmemt detai for marking */}
                            </Tooltip>
                        </Col>
                        <Col span={2}>
                            {assignment.privacyProtectionState === 'start' ? (
                                <FaGooglePlay className="start-eva-icon" size={18} onClick={() => modalAskInputUser(assignment.id)} />
                            ) : (
                                <SyncOutlined spin className="process-eva-icon" size={18} />
                            )}
                        </Col>

                        {/* Progress bar system */}
                        <Col span={8}>
                            <ProgressBar now={assignment.progressPercentage} label={`${assignment.progressPercentage}%`} visuallyHidden />
                            {assignment.privacyProtectionState === 'process' && (
                                <p className="progress-announcement">The system is removing the sensitive data from the student works.</p>
                            )}
                        </Col>
                    </Row>
                </div>
            ))}

        </div>

        <Modal className="custom-modal-eva-progress" title="Evaluation Progress" open={isModalOpen} onCancel={cancelSensiData} onOk={() => confirmSensiData(currentAssignment)} width={650} okButtonProps={{ className: 'custom-ok-button', disabled: selectedData.length === 0 }}>
            <Steps
                className = "eva-progress"
                current={0}
                items={[
                    {
                        icon: <BsPersonLock />,
                        title: 'Privacy Protection',
                    },
                    {
                        icon: <IoTimerSharp />,
                        title: 'Auto-evaluation',
                    },
                ]}
            />
            <p className="step-description" >Please choose the type of sensitive data that you want to hide</p>
            <div  className="sensi-data-choose">

                <Checkbox.Group value={selectedData} onChange={selectOption}>
                {options.map((option, index) => (
                    <div key={index}>
                        <Checkbox value={option}>{option}</Checkbox>
                        <CloseOutlined 
                            className={options.length > 3 ? 'delete-sensi-data-option' : 'del-sensi-data-option-disable'} 
                            onClick={() => deleteOption(index)} 
                        />
                    </div>
                ))}
                </Checkbox.Group>

                <Input className="input-new-op"  value={newOption} onChange={inputNewOpt} />
                <Button className="add-sensidata-button" onClick={allowAddNewOption} disabled={newOption.length < 3}>Add</Button>
            </div>
        </Modal>

    </>
    );
};

export default Rmae;