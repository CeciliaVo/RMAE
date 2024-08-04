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
            "Student ID": ["s3911365", "s3911365", "s3911365", "s123", "s123", "s123", "s345", "s345", "s345"],
            "Question ID": ["1", "2", "3", "1", "2", "3", '1', "2", "3"],
            "Question Score": ["8/8", "7.5/8", "5/8", "7/8", "6/8", "8/8", "0/8", "7/8", "1/8"],
            "Question Feedbacks": [
                `- The code follows the requirements and produces the correct results for all inputs tested.
- The program efficiently performs the required tasks.`,
                `- The variable names (num1, num2, num3) `,
                `- The variable names (num1, num2, num3) `,
                `- The code follows the requirements and produces the correct results for all inputs tested.
- The program efficiently performs the required tasks.`,
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
    const [numQuestions, setNumQuestions] = useState(null);
    const [feedbackColumnWidth, setFeedbackColumnWidth] = useState('auto');
    const [scoreColumnWidth, setScoreColumnWidth] = useState('auto')
    const [maxScores, setMaxScores] = useState({})

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
                tempTotalScore[studentId].questionScores[parseInt(item['Question ID'][index].replace(/\D/g, ''), 10) - 1 || 0] = score;
            });
        });
        console.log(tempTotalScore)
        setStudentTotalScore(tempTotalScore)
        setStudentFinalResult(resp)
        const tmpNumQuestions = resp[0]["Assignment Question"][0];
        setNumQuestions(tmpNumQuestions);
        setFeedbackColumnWidth(tmpNumQuestions > 0 ? 80 / (tmpNumQuestions * 2) + '%' : 'auto');
        setScoreColumnWidth(tmpNumQuestions > 0 ? 20 / (tmpNumQuestions * 2) + '%' : 'auto');
        setMaxScores(getMaxScoresFromDatabase(resp))
        setKeyCount(keyCount + 1)
    };

    // useEffect(() => {
    //     const tmpNumQuestions = studentFinalResult[0]["Assignment Question"][0];
    //     setNumQuestions(tmpNumQuestions);
    //     setFeedbackColumnWidth(tmpNumQuestions > 0 ? 80 / (tmpNumQuestions * 2) + '%' : 'auto');
    //     setScoreColumnWidth(tmpNumQuestions > 0 ? 20 / (tmpNumQuestions * 2) + '%' : 'auto');
    // }, [studentFinalResult])

    useEffect(() => {
        fetchResults();
      }, [assignmentID])

    const getMaxScoresFromDatabase = (results) => {
        const maxScores = {};
        results.length && results.forEach(item => {
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

    console.log(tableData)
    console.log(studentTotalScore)

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
                        icon={<CloseOutlined style={{ size: '13px', color: '#840707' }} />}
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

    const filterQuestionScoreColumn = (dataIndex, i) => ({
        sorter: {
            compare: (a, b) => a.questionActualScores[i] - b.questionActualScores[i],
            multiple: numQuestions - i, // Use decreasing order for multiple sorting
        },
        sortOrder: sortedInfo.columnKey === dataIndex && sortedInfo.order,
    });    

    const filterOverallColumn = (dataIndex) => {
        const marks = {
            0: '0%',
            100: '100%'
        };

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
                        style={{ marginBottom: 8, display: 'block', width: '200px' }}
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


    const tableColumns = [
        {
            title: <span className='student-result-label'>Student ID</span>,
            dataIndex: 'id',
            key: 'id',
            className: 'student-id',
            fixed: 'left',
            width: '5%',
            ...searchIDColumn('id'),
        },
        {
            title: <span className='student-result-label'>Assignment Question</span>,
            children: Array.from({ length: numQuestions }, (_, i) => ({
                title: `Q${i + 1}`,
                children: [
                    {
                        title: 'Feedback',
                        dataIndex: `q${i + 1}Feedback`,
                        key: `q${i + 1}Feedback`,
                        width: feedbackColumnWidth,
                        render: (text, record) => (
                            record.questionFeedbacks[i] !== null && <div>{record.questionFeedbacks[i].split('\n').map((line, index) => <span key={index}>{line}<br/></span>)}</div>
                        ),
                    },
                    {
                        title: 'Score',
                        dataIndex: `q${i + 1}Score`,
                        key: `q${i + 1}Score`,
                        width: scoreColumnWidth,
                        ...filterQuestionScoreColumn(`q${i + 1}Score`, i),
                        render: (text, record) => (
                            <div style={{ textAlign: 'center' }}>{record.questionScores && record.questionScores[i]}</div> 
                        ),
                    }                    
                ],
            })),
        },
        {
            title: <span className='student-result-label'>Total Score</span>,
            dataIndex: 'totalScore',
            key: 'totalScore',
            fixed: 'right',
            width: '5%',
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>{record.totalScore}</div>
            ),
        },
        {
            title: <span className='student-result-label'>Overall</span>,
            dataIndex: 'overall',
            key: 'overall',
            fixed: 'right',
            width: '5%',
            ...filterOverallColumn('overall'),
            render: (text, record) => (
                <div style={{ textAlign: 'center' }}>{record.overall}</div>
            ),
        },
    ];

    return (
        <>
            {/* Previous page return */}
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
                    scroll={{ x: 'max-content' }}
                    onChange={handleChange}
                />
            </div>
        </>
    );
};

export default FinalResult;