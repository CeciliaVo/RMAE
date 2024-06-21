import React, { useState, useEffect } from 'react';
import { Divider, Row, Col, Select, Checkbox, Button, Steps, Modal, Input, Upload, Form} from 'antd';
import { GiSpiderFace } from "react-icons/gi";
import { UploadOutlined } from '@ant-design/icons';
import { LuArrowLeftFromLine, LuSaveAll, LuSave } from "react-icons/lu";
import { FaArrowRightToBracket, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { FaGooglePlay } from "react-icons/fa";
import { BsPersonLock } from "react-icons/bs";
import { IoTimerSharp } from "react-icons/io5";
import './PrivacyProtection.css';
import ReturnPrePage from './Feature/Course/ReturnPage';

function highlightSensitiveDataRemoved(text) {
    const regex = /(\d+\.\[REMOVED\])/g;
    const replacer = (match) => {
        const [id, word] = match.split('.');
        return `<strong>${id}.<span style="color: #a00909">${word}</span></strong>`;
    };
    const highlightedText = text.replace(regex, replacer);
    return { __html: highlightedText };
}

const PrivacyProtection = () => {
    const database = [
        {
            "File Name": ["1YLHi86m_469298_q1.c", "2ABCDm_123456_q2.c", "2ABCDm_123456_q3.c"],
            "Student Work": [
                `
    /*  
    1.[REMOVED] (2.[REMOVED])
    3.[REMOVED]
    Intro to 4.[REMOVED]
    */
    #include <stdio.h>
    
    int main() {
        float num1, num2, num3;
        printf("Enter three float numbers: ");
        scanf("%f %f %f", &num1, &num2, &num3);
    
        printf("A number is the sum of the others: ");
        
        // Check all 5.[REMOVED] and print 6.[REMOVED] result
        if (num1 + num2 == num3) {
            printf("YES");
        } else if (num1 + num3 == num2) {
            printf("YES");
        } else if (num2 + num3 == num1) {
            printf("YES");
        } else
            printf("NO");
    
        printf("\\n");
    
        return 0;
    }`,
                "abcdef", // student work for the second file
                "abcedefasdfsf"  // student work for the third file
            ],
            "Sensitive Data Removed": [
                `
                1.Nguyen Xuan Thanh
                2.s3915468
                3.RMIT University
                4.Programming
                5.conditions
                6.appropriate`,
                `....`,
                ""
            ]
        }
    ];

    const { Option } = Select;
    const defaultFileIndex = 0; // Set the default file index for selecting file
    const [selectedFileIndex, setSelectedFileIndex] = useState(defaultFileIndex);
    const [checkedList, setCheckedList] = useState([]);
    const [sensitiveDataRemoved, setSensitiveDataRemoved] = useState(database[0]["Sensitive Data Removed"][selectedFileIndex]);
    const [modifiedStudentWork, setModifiedStudentWork] = useState(database[0]["Student Work"][defaultFileIndex]);
    const [transferredData, setTransferredData] = useState([]);
    const [currentFileIndex, setCurrentFileIndex] = useState(1);
    const [isFileSaved, setIsFileSaved] = useState(database[0]["File Name"].map(() => false)); // Track save state for each file
    const [isAllSaved, setIsAllSaved] = useState(false); // Track if all files are saved
    //asm marking criteria and questions:
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [instruction, setInstruction] = useState('');
    const [asmMCFiles, setAsmMCFiles] = useState([]);
    const [asmQuestsFiles, setAsmQuestsFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        setModifiedStudentWork(database[0]["Student Work"][selectedFileIndex]);
        setCheckedList([]);
        setSensitiveDataRemoved(database[0]["Sensitive Data Removed"][selectedFileIndex]);
    }, [selectedFileIndex]);
    
    const selectStudentWork = (value) => {
        const selectedIndex = database[0]["File Name"].indexOf(value);
        setSelectedFileIndex(selectedIndex);
        setCurrentFileIndex(selectedIndex + 1); 
    };    

    const goToPreviousFile = () => {
        if (currentFileIndex > 1) {
            const newFileIndex = currentFileIndex - 2; // Subtract 2 because array indices are 0-based
            selectStudentWork(database[0]["File Name"][newFileIndex]);
        }
    };
    
    const goToNextFile = () => {
        if (currentFileIndex < database[0]["File Name"].length) {
            const newFileIndex = currentFileIndex; // No need to add 1 because array indices are 0-based
            selectStudentWork(database[0]["File Name"][newFileIndex]);
        }
    };
    
    
    const sensitiveDataItems = sensitiveDataRemoved.split('\n').filter(item => item.trim() !== '');
    const checkAll = sensitiveDataItems.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < sensitiveDataItems.length;

    const onChange = (item) => {
        setCheckedList(checkedList.includes(item)
            ? checkedList.filter(checkedItem => checkedItem !== item)
            : [...checkedList, item]
        );
    };

    const checkAllSensiData = (e) => {
        setCheckedList(e.target.checked ? sensitiveDataItems : []);
    };

    const transferCheckedWords = () => {
        let newStudentWork = database[0]["Student Work"][selectedFileIndex];
        checkedList.forEach(item => {
            const id = parseInt(item.split('.')[0]);
            const word = item.split('.')[1];
            const regex = new RegExp(`${id}\\.\\[REMOVED\\]`, 'g');
            newStudentWork = newStudentWork.replace(regex, `${word}`);
        });
        setModifiedStudentWork(newStudentWork);
        setTransferredData([...transferredData, ...checkedList]);
        setCheckedList([]); // Clear checked list after transfer
    };

    const saveTransferredData = () => {
        if (window.confirm("Once you save, you cannot modify the current file anymore. Are you sure you want to save?")) {
            const updatedSensitiveData = sensitiveDataItems.filter(item => !transferredData.includes(item)).join('\n');
            setSensitiveDataRemoved(updatedSensitiveData);
            database[0]["Sensitive Data Removed"][selectedFileIndex] = updatedSensitiveData; // update the sensitive data
            setTransferredData([]); // clear the transferred data after saving
            setCheckedList([]); // clear the checked list after saving
            setIsFileSaved(prevState => {
                const newState = [...prevState];
                newState[selectedFileIndex] = true;
                return newState;
            });
        }
    };

    const saveAllFiles = () => {
        if (window.confirm("Once you save all files, you cannot modify them anymore. Are you sure you want to save all?")) {
            setIsAllSaved(true); // Disable transfer buttons for all files
            setIsFileSaved(database[0]["File Name"].map(() => true)); // Set all files as saved
        }
    };

    const inputData4AI = () => {
        setIsModalOpen(true);
    };

    const acptData4AI = () => {
        if (asmMCFiles.length === 0 || asmQuestsFiles.length === 0) {
            setError('Marking criteria and questions for the assignment are required');
            return;
        }
        setIsModalOpen(false);
        setAsmMCFiles([]);
        setAsmQuestsFiles([]);
        setInstruction('');
    };
    
    
    const cancelData4AI = () => {
        setIsModalOpen(false);
        setAsmMCFiles([]); 
        setAsmQuestsFiles([]); 
        setInstruction(''); 
    };
    

    const onInstructionInput = instructionin => {
        setInstruction(instructionin.target.value);
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
    
    return (
        <>
            {/*previous page return*/}
            <div className='manage-page-state'>
                <LuArrowLeftFromLine className='returnpage-icon' size={25} onClick={ReturnPrePage} />
            </div>

            <Divider orientation='left' style={{marginTop:'-14px',marginBottom:'-48px',paddingLeft:'30px' }}>
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
                </Divider>

            <div className='search-box'>
                <Select
                    className='search-box-component'
                    showSearch
                    style={{ width: 300 }}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    onChange={(value) => selectStudentWork(value)}
                    defaultValue={database[0]["File Name"][defaultFileIndex]} 
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {database[0]["File Name"].map((fileName, index) => (
                        <Option key={index} value={fileName}>
                            {fileName}
                        </Option>
                    ))}
                </Select>
                <Button 
                    type="primary" 
                    icon={<FaCaretLeft />} 
                    className='pre-file' 
                    size="small" 
                    onClick={goToPreviousFile} 
                    disabled={currentFileIndex === 1}
                />
                <p className='cur-file'>{currentFileIndex}/{database[0]["File Name"].length}</p>
                <Button 
                    type="primary" 
                    icon={<FaCaretRight />} 
                    className='next-file' 
                    size="small" 
                    onClick={goToNextFile} 
                    disabled={currentFileIndex === database[0]["File Name"].length}
                />
                <p className ='dvider-line'>|</p>
                <Button 
                    type="primary" 
                    icon={<LuSaveAll className='icon-save-all'/>} 
                    className='save-all' 
                    size="small" 
                    onClick={saveAllFiles} 
                    disabled={isAllSaved}
                >
                    Save all
                </Button>

                {isAllSaved ? 
                    <FaGooglePlay className='auto-eva-progress' onClick={inputData4AI} /> :
                    <FaGooglePlay className='auto-eva-progress-disabled' />
                }
            </div>

            <div className='pp-container'>
                <Row>
                    <Col span={6}>
                        <div className='Sensitive-Data-Removed-Header'>
                            <p className='count-removed-data'>{sensitiveDataItems.length} items</p>
                            <Row className='label-sdr'>
                                <Col span={3}><Checkbox indeterminate={indeterminate} onChange={checkAllSensiData} checked={checkAll} /></Col>
                                <Col span={2}><div className="label-sdr-1"><b>ID</b></div></Col>
                                <Col span={5}><div className="label-sdr-1"><b>Sensitive Data</b></div></Col>
                            </Row>
                        </div>
                        <div className='sensitive-data-removed'>
                            {sensitiveDataItems.map((item, index) => {
                                const id = item.split('.')[0];
                                const data = item.split('.')[1];
                                return (
                                    <Row key={index} className='sdr'>
                                        <Col span={3}><Checkbox checked={checkedList.includes(item)} onChange={() => onChange(item)} /></Col>
                                        <Col span={2}>{id}</Col>
                                        <Col span={5} className="sdr-display">{data}</Col>
                                    </Row>
                                );
                            })}
                        </div>
                    </Col>

                    <Col>
                        <div className='Transfer-sensi-word'>
                            <Button 
                                type="primary" 
                                icon={<FaArrowRightToBracket className='arrowright' />} 
                                onClick={transferCheckedWords} 
                                disabled={isFileSaved[selectedFileIndex] || isAllSaved} 
                            /> 
                        </div>
                    </Col>

                    <Col span={13}>
                        <div className='Student-Work-Header'>
                            <div>
                                <p className='student-work-info'>Asm Name (Asm ID) </p>
                                <div className='icon-save'><LuSave className='icon-save' onClick={saveTransferredData} disabled={isFileSaved[selectedFileIndex]}/></div>
                            </div>
                        </div>
                        <div className='student-work-display'>
                            <pre dangerouslySetInnerHTML={highlightSensitiveDataRemoved(modifiedStudentWork)}></pre>
                        </div>
                    </Col>
                </Row>
            </div>

            <Modal className="custom-modal-eva-progress" title="Evaluation Progress" open={isModalOpen} onOk={acptData4AI} onCancel={cancelData4AI} okButtonProps={{ className: 'custom-ok-button'}} width={650}>
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
                <Form layout="vertical">
                    <GiSpiderFace className='rmit-spider'/>
                    <p className="intro-ai" >
                        Hello! I’m your digital assistant for today’s assignment marking. 
                        My goal is to make your evaluation process as smooth and accurate as possible. 
                        Please provide clear and in-depth instructions for the evaluation process. 
                        Your detailed guidance will ensure that the auto-evaluation aligns with your expectations and standards. 
                        Let’s get started on this journey towards efficient and effective assignment marking!
                    </p>
                    <Form.Item label="Instructions" className='instruction-input'>
                        <Input.TextArea showCount maxLength={4000} onChange={onInstructionInput} style={{marginBottom:'-10px'}} />
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
                    <Form.Item 
                        label="Assignment Questions" 
                        className='asm-upload-quests' 
                        extra={asmQuestsFiles.length ? "" : "Select file to upload"}
                    >
                        <Upload {...uploadAsmQuests}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                        {error && <div className="errorMessage">{error}</div>}
                    </Form.Item>
                </Form>
            </Modal>

        </>
    );
};

export default PrivacyProtection;