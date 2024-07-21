import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Space, Table, Slider, Divider, Col, InputNumber, Row } from 'antd';
import { SearchOutlined, CloseOutlined, FilterOutlined } from '@ant-design/icons';
import { LuArrowLeftFromLine } from "react-icons/lu";
import Highlighter from 'react-highlight-words';
import './FinalResult.css';
import ReturnPrePage from './ReturnPage';
import request from '../../utils/request';
import { ResultEndpoint } from '../../constants/endpoints';
import { useParams } from "react-router-dom";

const FinalResult = () => {
    const raw = [
        {
            "Assignment Question": [3],
            "Student Name": ["A", "A", "A", "A", "A", "A", 'Bsa', 'Bsa', 'Bsa'],
            "Student ID": ["s3911365", "s3911365", "s3911365", "s123", "s123", "s123", "s345", "s345", "s345"],
            "Question ID": ["1", "2", "3", "1", "2", "3", '1', "2", "3"],
            "Question Score": ["8/8", "7.5/8", "5/8", "7/8", "6/8", "8/8", "0/8", "7/8", "1/8"],
            "Question Feedbacks": [
`- The code follows the requirements and produces the correct results for all inputs tested.
- The program efficiently performs the required tasks.`,
                `- The variable names (num1, num2, num3) `,
                `- The variable names (num1, num2, num3) `,
                `- The code follows the requirements and produces the correct results for all inputs tested.\n- The program efficiently performs the required tasks.`,
                `- The variable names (num1, num2, num3) `,
                `- The variable names (num1, num2, num3) `,
                `- The student does not done this work`,
                ``,
                ``
            ]
        }
    ];

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [sortedInfo, setSortedInfo] = useState({});
    const [filteredInfo, setFilteredInfo] = useState({});
    const searchInput = useRef(null);
    const { assignmentID } = useParams();
    const [keyCount, setKeyCount] = useState(0)
    // Calculate total score
    const [studentTotalScore, setStudentTotalScore] = useState({});
    const [studentFinalResult, setStudentFinalResult] = useState([])

    console.log(studentTotalScore)
    const fetchResults = async () => {
        const endpoint = ResultEndpoint["getResult"];
        const resp = await request.get(`${endpoint}/${assignmentID}`);
        console.log(resp)
        let tempTotalScore = {}
        resp.forEach(item => {
            console.log(item)
            item['Question Score'].forEach((score, index) => {
                const [actualScore, maxScore] = score.split('/').map(Number);
                const studentId = item['Student ID'][index];
                if (!tempTotalScore[studentId]) {
                    tempTotalScore[studentId] = {
                        name: item['Student Name'][index],
                        id: studentId,
                        totalScore: 0,
                        maxScore: 0,
                        questionFeedbacks: Array(item['Assignment Question'][0]).fill(''),
                        questionScores: Array(item['Assignment Question'][0]).fill(''),
                    };
                }
                tempTotalScore[studentId].totalScore += actualScore;
                tempTotalScore[studentId].maxScore += maxScore;
                tempTotalScore[studentId].questionFeedbacks[parseInt(item['Question ID'][index].replace(/\D/g, ''), 10) - 1 || 0] = item['Question Feedbacks'][index];
                tempTotalScore[studentId].questionScores[parseInt(item['Question ID'][index]) - 1] = score;
            });
        });
        setStudentTotalScore(tempTotalScore)
        setStudentFinalResult(resp)
        setKeyCount(keyCount + 1)
    };

    useEffect(() => {
        fetchResults();
      }, [assignmentID])

    const getMaxScoresFromDatabase = () => {
        const maxScores = {};
        studentFinalResult.length && studentFinalResult.forEach(item => {
            item['Question Score'].forEach((score, index) => {
                const questionId = item['Question ID'][index];
                const [actualScore, maxScore] = score.split('/').map(Number);
                maxScores[questionId] = Math.max(maxScores[questionId] || 0, maxScore);
            });
        });
        return maxScores;
    };
    

    
    

    // Convert the studentTotalScore object to an array for the Table component
    const tableData = Object.values(studentTotalScore).map(student => ({
        key: student.id,
        ...student,
        overall: ((student.totalScore / student.maxScore) * 100).toFixed(2) + '%',
    }));

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    const confirmSearchID = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const resetSearchID = (clearFilters, confirm) => {
        clearFilters();
        setSearchText('');
        confirm();
    };

    const searchIDColumn = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirmSearchID(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
                <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        onClick={() => confirmSearchID(selectedKeys, confirm, dataIndex)}
                        size="small"
                        style={{ width: 60, backgroundColor: '#840707' }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => resetSearchID(clearFilters, confirm)}
                        icon={<CloseOutlined style={{ size: '13px', color: '#840707' }}/>}
                        size="small"
                        style={{ width: 20 }}
                    />
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const filterOverallColumn = (dataIndex) => {
        const marks = {
            0: '0%',
            100: '100%'
        }
    
        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 15 }}>
                    <b>Percentage</b>
                    <Slider
                        range
                        marks={marks}
                        defaultValue={selectedKeys[0] ? selectedKeys[0] : [0, 100]}
                        onChange={(value) => setSelectedKeys([value])}
                        onAfterChange={() => confirm()}
                        min={0}
                        max={100}
                        style={{ marginBottom: 8, display: 'block', width: '200px'}}
                    />
                    <Divider style={{ marginTop: '20px', marginBottom: '10px' }} />
                    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => {
                                clearFilters();
                                confirm();
                            }}
                            icon={<CloseOutlined style={{ size: '13px', color: '#840707' }} />}
                            size="small"
                            style={{ width: 20 }}
                        />
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => {
                const overallPercentage = parseFloat(record[dataIndex]);
                return overallPercentage >= value[0] && overallPercentage <= value[1];
            },
            sorter: (a, b) => parseFloat(a[dataIndex]) - parseFloat(b[dataIndex]),
            sortOrder: sortedInfo.columnKey === dataIndex && sortedInfo.order,
        };
    };

    const expandedRowRender = (record) => {
        // Calculate the width for each column
        const columnWidth = 100 / studentFinalResult[0]["Assignment Question"][0];
    
        // Generate columns for each question
        const columns = [];
        for (let i = 1; i <= studentFinalResult[0]["Assignment Question"][0]; i++) {
            columns.push({
                title: <div style={{ textAlign: 'center', marginTop:'-20px', fontWeight: 'bold'}}>Q{i}</div>,
                dataIndex: `Q${i}`,
                key: `Q${i}`,
                width: `${columnWidth}%`, // Set the width for each column
                render: (_, record) => (
                    <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify'}}>
                        {record[`Q${i}`]}
                    </div>
                ),
            });
        }
    
        const queScoreRow = [];
        for (let i = 1; i <= studentFinalResult[0]["Assignment Question"][0]; i++) {
            queScoreRow.push({
                render: (_, record) => (
                    <div style={{ textAlign: 'center', marginTop:'-10px', marginBottom:'-10px'}}>
                        {record[`Q${i}Score`]}
                    </div>
                ),
            });
        }
    
        // Generate data for each question
        const data = [{
            key: record.id,
            ...record.questionFeedbacks.reduce((acc, feedback, index) => {
                acc[`Q${index + 1}`] = feedback;
                acc[`Q${index + 1}Score`] = record.questionScores[index];
                return acc;
            }, {}),
        }];
    
        return (
            <div>
                <Table columns={columns} dataSource={data} pagination={false} />
                <Table columns={queScoreRow} dataSource={data} pagination={false} showHeader={false} />
            </div>
        );
    };
    
    const filterTotalScoreColumn = (dataIndex, maxScores) => {
        return {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 15 }}>
                    {Object.entries(maxScores).map(([questionId, maxScore]) => (
                        <div key={questionId}>
                            <b>Q{questionId}</b>
                            <Row>
                                <Col span={12}>
                                    <Slider
                                        range
                                        min={0}
                                        max={maxScore}
                                        onChange={(value) => {
                                            const newSelectedKeys = { ...selectedKeys, [questionId]: value };
                                            setSelectedKeys(newSelectedKeys);
                                        }}
                                        value={selectedKeys[questionId] || [0, maxScore]}
                                        style={{ marginBottom: 8, display: 'block', width: '150px'}}
                                    />
                                </Col>
                            </Row>
                        </div>
                    ))}
                    <Divider style={{ marginTop: '20px', marginBottom: '10px' }} />
                    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={() => {
                                clearFilters();
                                confirm();
                            }}
                            icon={<CloseOutlined style={{ size: '13px', color: '#840707' }} />}
                            size="small"
                            style={{ width: 20 }}
                        />
                    </Space>
                </div>
            ),
            filterIcon: (filtered) => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: (value, record) => {
                return Object.entries(value).every(([questionId, [min, max]]) => {
                    const score = parseFloat(record.questionScores[parseInt(questionId) - 1].split('/')[0]);
                    return score >= min && score <= max;
                });
            },
        };
    };
    
    
    const tableColumns = [
        {
            title: <span className='student-result-label'>Student ID</span>,
            dataIndex: 'id',
            key: 'id',
            className: 'student-id',
            ...searchIDColumn('id'),
        },
        {
            title: <span className='student-result-label'>Student Name</span>,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <span className='student-result-label'>Total Score</span>,
            dataIndex: 'totalScore',
            key: 'totalScore',
            ...filterTotalScoreColumn('totalScore', getMaxScoresFromDatabase()),
        },        
        {
            title: <span className='student-result-label'>Overall</span>,
            dataIndex: 'overall',
            key: 'overall',
            ...filterOverallColumn('overall'),
        },
    ];

    return (
            <>
            {/*previous page return*/}
            <div className='manage-page-state'>
                <LuArrowLeftFromLine className='returnpage-icon' size={25} onClick={ReturnPrePage} />
            </div>
            
            <div className='pp-container'>
                <Table 
                    key={keyCount}
                    className="table-row"
                    dataSource={tableData} 
                    columns={tableColumns} 
                    bordered
                    title={() => <p className='Asm-info'>Assignment Name (Assignment ID)</p>}
                    pagination={false}
                    onChange={handleChange}
                    expandable={{ expandedRowRender }}
                />
            </div>
        </>
    );
};

export default FinalResult;