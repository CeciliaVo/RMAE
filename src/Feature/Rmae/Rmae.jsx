import React, { useState, useEffect } from 'react';
import {Divider, Row, Col, Tooltip, Modal, Checkbox, Input, Button, Steps, Select} from 'antd';
import { InfoCircleOutlined, CloseOutlined, SyncOutlined} from '@ant-design/icons';
import { FaGooglePlay } from "react-icons/fa";
import { BsPersonLock } from "react-icons/bs";
import { IoTimerSharp} from "react-icons/io5";
import { MdLockPerson } from "react-icons/md";
import { GiTwirlyFlower } from "react-icons/gi";
import { LuArrowLeftFromLine } from "react-icons/lu";
import ReturnPrePage from '../Course/ReturnPage';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { AssignmentEndpoint, PrivacyEndpoint, EvaEndpoint } from '../../constants/endpoints';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import { displaySuccessMessage } from '../../utils/request';

import './Rmae.css';

const Rmae = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalEvaOpen, setIsModalEvaOpen] = useState(false);

    const navigate = useNavigate();
    const [selectedData, setSelectedData] = useState([]);
    const [options, setOptions] = useState(["Student name", "Course ID", "Course Name", "Student ID", "Student Age", "Gender"]);
    const [newOption, setNewOption] = useState("");
    const [currentAssignment, setCurrentAssignment] = useState(null); //Keep track on the current assignment the user is interact with
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // {
    //     "id": 1,
    //     "name": "Asm1",
    //     "course_id": 1,
    //     "marking_criteria_filepath": "Asm1/criteria.txt",
    //     "questions_filepath": "Asm1/q1.txt",
    //     "student_answer_filepath": "Asm1/demo.zip",
    //     "number_of_questions": 3,
    //     "number_of_submissions": 0,
    //     "instruction": null,
    //     "created_at": "2024-06-23T04:57:40.212892",
    //     "evaluation_status": false,
    //     "lecture_check_status": false,
    //     "sensitive_rmv_status": false
    // },
    const [assignments, setAssignments] = useState([]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const fetchAllAssignment = async () => {
        const endpoint = AssignmentEndpoint["searchAll"];
        const resp = await request.get(endpoint);
        console.log(resp)
        setAssignments(resp);
      };
    
      useEffect(() => {
        fetchAllAssignment();
      },[]);

    const modalEva= (assignmentId) => {
        setIsModalEvaOpen(true);
        setCurrentAssignment(assignmentId);
        setRecentAssignments(prevRecentAssignments => {
            const updatedRecentAssignments = [assignmentId, ...prevRecentAssignments];
            // Keep only the 3 most recent assignments
            return updatedRecentAssignments.slice(0, 3);
        });
    };

    const modalAskInputUser = (assignmentId) => {
        setIsModalOpen(true);
        setCurrentAssignment(assignmentId);
        setRecentAssignments(prevRecentAssignments => {
            const updatedRecentAssignments = [assignmentId, ...prevRecentAssignments];
            // Keep only the 3 most recent assignments
            return updatedRecentAssignments.slice(0, 3);
        });
    };
    

    const confirmSensiData = async () => {
        setIsModalOpen(false);
        setSelectedData([]); 
        setNewOption(""); 

        const endpoint = PrivacyEndpoint["privacyProtection"];
        const resp = await request.post(`${endpoint}/${currentAssignment}`);
        displaySuccessMessage("Running Privacy Protection Process");
        console.log(resp)
    };

    const confirmAutoEva = async () => {
        setIsModalEvaOpen(false);
        setSelectedData([]); 
        setNewOption(""); 

        const endpoint = EvaEndpoint["autoEva"];
        const resp = await request.post(`${endpoint}/${currentAssignment}`);
        displaySuccessMessage("Running Auto Evaluation Process");
        console.log(resp)
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
        setIsModalEvaOpen(false)
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
                <Col span={3} className="asm-label-rmae">Assignment ID</Col>
                <Col span={8} className="asm-label-rmae">Assignment Name</Col>
                <Col span={1} className="asm-label-rmae"></Col>
                <Col span={2} className="asm-label-rmae"></Col>
                <Col span={8} className="asm-label-rmae">Progress</Col>
            </Row>

            <Divider  className='divi-rmae'/>

            {assignments.map((assignment) => (
                <div key={assignment.id}>
                    <Row className="display-assignments">
                        <Col span={3} className="assignment-name">{assignment.id}</Col>
                        <Col span={8} className="assignment-name">{assignment.name}</Col>
                        <Col span={1}>
                            <Tooltip title={
                                <>
                                    <span className="tooltip-label">Course Name:</span> <span className="tooltip-value">{`${assignment?.name}`}</span><br />
                                    <span className="tooltip-label">Date:</span> <span className="tooltip-value">{`${assignment?.created_at}`}</span><br />
                                    {/* <span className="tooltip-label">Submission Type:</span> <span className="tooltip-value">{`${assignment.submissionType}`}</span><br /> */}
                                    <span className="tooltip-label">Number of Files:</span> <span className="tooltip-value">{`${assignment?.number_of_submissions}`}</span><br />
                                    {/* <span className="tooltip-label">File Type:</span> <span className="tooltip-value">{`${assignment.fileType}`}</span> */}
                                </>
                            }>
                                <InfoCircleOutlined className="view-asm-detail-icon" /> {/* Hover to show the assignmemt detai for marking */}
                            </Tooltip>
                        </Col>
                        <Col span={2}>
                            {assignment.sensitive_rmv_status ? (
                                <FaGooglePlay className="start-eva-icon" size={18} onClick={() => modalEva(assignment.id)} />
                            ) : (
                                <FaGooglePlay className="start-eva-icon" size={18} onClick={() => modalAskInputUser(assignment.id)} />
                            )}
                            {/* <FaGooglePlay className="start-eva-icon" size={18} onClick={() => modalAskInputUser(assignment.id)} /> */}
                        </Col>

                        {/* Progress bar system */}
                        <Col span={8}>
                            <ProgressBar now={assignment?.progressPercentage || Math.floor(Math.random() * 100) + 1} label={`${assignment?.progressPercentage || Math.floor(Math.random() * 100) + 1}%`} visuallyHidden />
                            {!assignment.sensitive_rmv_status ? (
                                <p className="progress-announcement">Need removing sensitive data from the student works.</p>
                            ) : assignment.evaluation_status ? <p className="progress-announcement">Auto Evaluation completed</p> : <p className="progress-announcement">Remove sensitive information completed</p>}
                        </Col>
                        <Col span={2}><MdLockPerson className="view-asm-icon" size = {22} onClick={() => navigate(`/privacy/${assignment.id}`)}/></Col> {/* If the user on the checking sensitive data step, changge to this icon */}
                        {/* <Col span={2}><GiTwirlyFlower className="view-asm-icon" size = {22} /></Col>  */}
                        {/* If the user on the evaluation step, changge to this icon */}
                    </Row>
                </div>
            ))}

        </div>

        <Modal className="custom-modal-eva-progress" title="Evaluation Progress" open={isModalOpen} onCancel={cancelSensiData} onOk={() => confirmSensiData(currentAssignment)} width={650} okButtonProps={{ className: 'custom-ok-button'}}>
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

        <Modal className="custom-modal-eva-progress" title="Evaluation Progress" open={isModalEvaOpen} onCancel={cancelSensiData} onOk={() => confirmAutoEva(currentAssignment)} width={650} okButtonProps={{ className: 'custom-ok-button'}}>
            <Steps
                className = "eva-progress"
                current={1}
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
            <p>Click OK for running Auto Evaluation Process</p>
        </Modal>

    </>
    );
};

export default Rmae;