import React, { useState } from 'react';
import { FloatButton, Button, Input, Divider, Modal, Row, Col, Form, Checkbox, Upload} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BiAddToQueue } from "react-icons/bi";
import { FaTrashCan } from "react-icons/fa6";
import { IoDocumentTextSharp } from "react-icons/io5";
import { LuArrowLeftFromLine } from "react-icons/lu";
//import { BsCheckCircleFill } from "react-icons/bs"; 
import './Assignment.css';
import ReturnPrePage from './Feature/Course/ReturnPage';

function getOrdinalSuffix(date) {
    let day = date.getDate();
    let month = date.toLocaleString('en-US', { month: 'long' });
    if (day % 10 === 1 && day !== 11) {
        return day + 'st ' + month;
    } else if (day % 10 === 2 && day !== 12) {
        return day + 'nd ' + month;
    } else if (day % 10 === 3 && day !== 13) {
        return day + 'rd ' + month;
    } else {
        return day + 'th ' + month;
    }
}

const Assignment = () => {
    const [isOpen, setOpen] = useState(false);
    const [isAllChecked, setIsAllChecked] = useState(false);

    //Create a new assignment
    const [assignmentName, setAssignmentName] = useState('');
    //const [assignmentStatus, setAssignmentStatus] = useState('Undone');
    const [asmStudentWorkFiles, setAsmStudentWorkFiles] = useState([]);
    const [asmMCFiles, setAsmMCFiles] = useState([]);
    const [asmQuestsFiles, setAsmQuestsFiles] = useState([]);
    const [error, setError] = useState('');
    
    //Display the assignment
    const [assignments, setAssignments] = useState([]);
    const assignmentExists = assignments.some(assignment => assignment.name === assignmentName);

    const asmCreateForm = () => {
        setAssignmentName('');
        setOpen(true);
    };

    const assignmentCreate = () => {
        // Trim assignmentName before checking its length
        const trimmedAssignmentName = assignmentName.trim();
    
        // Check if asmStudentWorkFiles is empty or contains only empty strings
        const isAsmStudentWorkFilesInvalid = asmStudentWorkFiles.length === 0 || asmStudentWorkFiles.some(file => file.name.trim().length < 5 || file.name.startsWith(' '));
    
        if (trimmedAssignmentName.length === 0 || isAsmStudentWorkFilesInvalid || asmMCFiles.length === 0 || asmQuestsFiles.length === 0) {
            setError('Assignment Name, Student Work Submission, Marking Criteria and Assignment Questions are required');
        } else {
            // Check if a assignment with the same name already exists
            if (assignmentExists) {
                setError('A assignment with the same name already exists');
            } else {
                const assignmentDate = new Date();
                setAssignments([...assignments, { name: trimmedAssignmentName, date: assignmentDate, checked: false, files: asmStudentWorkFiles, evaluationStatus: 'Undone' }]); 
                setOpen(false);
                setError('');
                // Reset the assignment name and file list
                setAssignmentName('');
                setAsmStudentWorkFiles([]);
                setAsmMCFiles([]);
                setAsmQuestsFiles([]);
            }
        }
    };
    
    const cancelAssignmentSet = () => {
        setAssignmentName('');
        setAsmMCFiles([]);
        setAsmQuestsFiles([]);
        setAsmStudentWorkFiles([]);
        setOpen(false);
        setError('');
    };

    const uploadAsmWork = {
        onRemove: file => {
            setAsmStudentWorkFiles(asmStudentWorkFiles.filter(item => item !== file));
        },
        beforeUpload: file => {
            setAsmStudentWorkFiles([file]);
            return false;
        },
        fileList: asmStudentWorkFiles,
    };

    const uploadAsmMC = {
        onRemove: file => {
            setAsmMCFiles(asmMCFiles.filter(item => item !== file));
        },
        beforeUpload: file => {
            setAsmMCFiles([file]); 
            return false;
        },
        fileList: asmMCFiles,
    };
    
    const uploadAsmQuests = {
        onRemove: file => {
            setAsmQuestsFiles(asmQuestsFiles.filter(item => item !== file));
        },
        beforeUpload: file => {
            setAsmQuestsFiles([file]); 
            return false;
        },
        fileList: asmQuestsFiles,
    };
    
    //Assignment manage state
    const selectAssignment = index => {
        setAssignments(assignments.map((assignment, i) => i === index ? { ...assignment, checked: !assignment.checked } : assignment));
    };

    const selectAllAssignment = (assignmentdel) => {
        setIsAllChecked(assignmentdel.target.checked);
        setAssignments(assignments.map(assignment => ({ ...assignment, checked: assignmentdel.target.checked })));
    }; 
    
    const assignmentDelete = () => {
        setAssignments(assignments.filter(assignment => !assignment.checked));
    };

    return (
        <>
        <FloatButton className = "creatAssignment-icon" icon={<BiAddToQueue />} onClick={asmCreateForm} style={{position: 'fixed', bottom: '20px', right: '20px',}}>
            Create Assignment
        </FloatButton>
        <Modal className="custom-modal-assignment" title="Create Assignment" open={isOpen} onOk={assignmentCreate} onCancel={cancelAssignmentSet} width={550} okButtonProps={{ className: 'custom-ok-button' }}>
            <Form layout="vertical">
                <Form.Item label = 'Name' className="assignmentname">
                    <Input className="asm-nameholder" placeholder="" value={assignmentName} onChange={assignmentname => setAssignmentName(assignmentname.target.value)} />
                </Form.Item>
                <Form.Item 
                    className='asmfileupload' 
                    label="Student Works Submission" 
                    extra={asmStudentWorkFiles.length ? "" : "Select file to upload"}
                >
                    <Upload {...uploadAsmWork}>
                        <Button icon={<UploadOutlined />}>Select File</Button>
                    </Upload>
                </Form.Item>
                <p className="instruction-ams" >
                    Please provide <b>'Questions'</b> and <b>'Marking Criteria'</b> relating to the assignment for the evaluation process.
                </p>
                <Form.Item 
                    label="Assignment Questions" 
                    className='asm-upload-quests' 
                    extra={asmQuestsFiles.length ? "" : "Select file to upload"}
                >
                    <Upload {...uploadAsmQuests}>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                </Form.Item>
                <Form.Item 
                        label="Marking Criteria" 
                        className='asm-upload-mc' 
                        extra={asmMCFiles.length ? "" : "Select file to upload"}
                    >
                        <Upload {...uploadAsmMC}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                    </Form.Item>
            </Form>
            {error && <div className="errorMessage">{error}</div>}
        </Modal>

        {/*previous page return*/}
        <div className='manage-page-state'>
            <LuArrowLeftFromLine className='returnpage-icon' size={25} onClick={ReturnPrePage} />
        </div>

        {/*Manage assignment*/}
        <div className="breadcrumbassignment">
            {assignments.some(assignment => assignment.checked) && <FaTrashCan className='deleteassignmenticon' size='18px' onClick={assignmentDelete} />}
            <Checkbox className='checkallassignment'checked={isAllChecked} onChange={selectAllAssignment}>Select all</Checkbox>
        </div>
        
        {/*Course info*/}
        <div>
            <Divider className = "asm-cname" orientation = 'centre' > Capstone Engineering Project Part A </Divider> {/*name*/}
            <p className = 'asm-csem-year'>Sem A 2024</p> {/*sem and year*/}
        </div>

        {/*Manage assignment*/}
        {/* <div className="breadcrumbassignment">
            {assignments.some(assignment => assignment.checked) && <FaTrashCan className='deleteassignmenticon' size='18px' onClick={assignmentDelete} />}
            <Checkbox className='checkallassignment'checked={isAllChecked} onChange={selectAllAssignment}>Select all</Checkbox>
        </div> */}

        <div className="assignments-container">
            {/* Assignment information title */}
            <Row className="assignment-info">
                <Col span={1}><b></b></Col>
                <Col span={8}><div className="assignment-label"><b>NAME</b></div></Col>
                <Col span={4}><div className="assignment-label"><b>DATE</b></div></Col>
                <Col span={5}><div className="assignment-label"><b>WORK SUBMISSON</b></div></Col>
                <Col span={4}><div className="assignment-label"><b>EVA STATUS</b></div></Col>
            </Row>
            <Divider orientation = 'left' > </Divider>
            {assignments.sort((a, b) => a.date - b.date).map((assignment, index, arr) => (
                <>
                    {(index === 0 || assignment.date !== arr[index - 1].date)}
                    <AssignmentDisplay key={index} assignment={assignment} onCheckboxChange={() => selectAssignment(index)} />
                </>
            ))}
        </div>
    </>
    );
};

//Whenever the user create a new assignment, the assignment will be added.
const AssignmentDisplay = ({ assignment, onCheckboxChange }) => {
    // Truncate the file name to first 15 characters and last 5 characters
    const truncateFileName = (fileName) => {
        if (fileName.length > 20) {
            return fileName.slice(0, 15) + '...' + fileName.slice(-5);
        }
        return fileName;
    };

    return (
        <div className={assignment.checked ? 'row-checked' : ''}>
            <Row className="display-assignments">
                <Col span={1}><Checkbox className='checkboxassignment' checked={assignment.checked} onChange={onCheckboxChange} /></Col>
                <Col span={8} className="assignment-name">{assignment.name}</Col>
                <Col span={4} className="assignment-date">{getOrdinalSuffix(assignment.date)}</Col>
                <Col span={5} className="assignment-files">{truncateFileName(assignment.files[0]?.name)}</Col>
                
                <Col span={4} className={`assignment-status ${assignment.checked ? 'textwhite-onchecked' : ''} ${assignment.evaluationStatus === 'Done' ? 'assignment-status-done' : 'assignment-status-undone'}`}>
                    {assignment.evaluationStatus === 'Done' ? <BsCheckCircleFill /> : assignment.evaluationStatus}
                </Col> {/*Evaluation change when the assignmengt done marking - Function evaluate add later*/}
                
                <Col span={2}><IoDocumentTextSharp className="view-asm-icon" size = {22} /></Col>
            </Row>
        </div>
    );
};

export default Assignment;